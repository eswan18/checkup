import { useState, useEffect } from 'react';
import { checkAllServices } from './healthCheck';
import './App.css';

function App() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [config, setConfig] = useState(null);

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const response = await fetch('/config.json');
        const data = await response.json();
        setConfig(data);
        await performHealthCheck(data.services);
      } catch (error) {
        console.error('Failed to load config:', error);
        setLoading(false);
      }
    };

    loadConfig();
  }, []);

  const performHealthCheck = async (servicesToCheck) => {
    setChecking(true);
    const results = await checkAllServices(servicesToCheck);
    setServices(results);
    setLoading(false);
    setChecking(false);
  };

  const handleCheckAgain = () => {
    if (config) {
      performHealthCheck(config.services);
    }
  };

  const formatTimestamp = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleTimeString();
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading services...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <header className="header">
        <h1>Service Health Dashboard</h1>
        <p className="subtitle">Real-time monitoring of your services</p>
      </header>

      <div className="controls">
        <button
          className="check-button"
          onClick={handleCheckAgain}
          disabled={checking}
        >
          {checking ? 'Checking...' : 'Check Again'}
        </button>
      </div>

      <div className="services-grid">
        {services.map((service, index) => (
          <div key={index} className={`service-card ${service.status}`}>
            <div className="service-header">
              <h2 className="service-name">{service.name}</h2>
              <div className={`status-indicator ${service.status}`}>
                <span className="status-dot"></span>
                <span className="status-text">
                  {service.status === 'healthy' ? 'Healthy' : 'Unhealthy'}
                </span>
              </div>
            </div>

            <div className="service-details">
              {service.url && (
                <div className="detail-row">
                  <span className="detail-label">URL:</span>
                  <a
                    href={service.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="detail-link"
                  >
                    {service.url}
                  </a>
                </div>
              )}

              <div className="detail-row">
                <span className="detail-label">Health Check:</span>
                <span className="detail-value">{service.healthcheckUrl}</span>
              </div>

              {service.statusCode && (
                <div className="detail-row">
                  <span className="detail-label">Status Code:</span>
                  <span className="detail-value">{service.statusCode}</span>
                </div>
              )}

              {service.error && (
                <div className="detail-row error">
                  <span className="detail-label">Error:</span>
                  <span className="detail-value">{service.error}</span>
                </div>
              )}

              {service.lastChecked && (
                <div className="detail-row">
                  <span className="detail-label">Last Checked:</span>
                  <span className="detail-value">{formatTimestamp(service.lastChecked)}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
