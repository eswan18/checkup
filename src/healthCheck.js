export const checkHealth = async (url) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  try {
    const response = await fetch(url, {
      method: 'GET',
      signal: controller.signal,
      mode: 'cors',
    });

    clearTimeout(timeoutId);

    return {
      status: response.ok ? 'healthy' : 'unhealthy',
      statusCode: response.status,
      error: null,
    };
  } catch (error) {
    clearTimeout(timeoutId);

    if (error.name === 'AbortError') {
      return {
        status: 'unhealthy',
        statusCode: null,
        error: 'Request timeout (no response after 5s)',
      };
    }

    return {
      status: 'unhealthy',
      statusCode: null,
      error: error.message || 'Failed to connect',
    };
  }
};

export const checkAllServices = async (services) => {
  const results = await Promise.all(
    services.map(async (service) => {
      const health = await checkHealth(service.healthcheckUrl);
      return {
        ...service,
        ...health,
        lastChecked: new Date().toISOString(),
      };
    })
  );

  return results;
};
