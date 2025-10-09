import React, { useState, useEffect } from 'react';
import './Footer.css';
import { statusService } from '../../services/status/statusService';

// Importar iconos desde src/icons
import reactIcon from '../../icons/react.png';
import nestIcon from '../../icons/nest.png';
import postgreIcon from '../../icons/postgre.png';
import dockerIcon from '../../icons/docker.png';
import northflankIcon from '../../icons/northflank.svg';
import prismaIcon from '../../icons/prisma.png';

const Footer = () => {
  const [authStatus, setAuthStatus] = useState(null);
  const [apiStatus, setApiStatus] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [apiLoading, setApiLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [apiError, setApiError] = useState(null);

  useEffect(() => {
    const fetchAuthStatus = async () => {
      try {
        setAuthLoading(true);
        const authBaseUrl = (import.meta.env.VITE_AUTH_BASE_URL || 'https://shipper-server-auth.onrender.com').replace(/\/$/, '');
        const response = await fetch(authBaseUrl);
        
        if (response.ok) {
          setAuthStatus('connected');
          setAuthError(null);
        } else {
          setAuthError('Error');
        }
      } catch (err) {
        setAuthError(err.message);
      } finally {
        setAuthLoading(false);
      }
    };

    const fetchApiStatus = async () => {
      try {
        setApiLoading(true);
        const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || 'https://p01--backend--vtq7dc7r2j7w.code.run')
          .replace(/^hhttps:\/\//, 'https://') // Remove leading 'h' if 'hhttps://'
          .replace(/\/$/, ''); // Remove trailing slash
        const healthUrl = `${apiBaseUrl}/health`;
        console.log('🔍 Footer: Fetching API health from:', healthUrl);
        const response = await fetch(healthUrl);
        
        if (response.ok) {
          setApiStatus('connected');
          setApiError(null);
          console.log('✅ API Status: Connected');
        } else {
          setApiError('Error');
          console.log('❌ API Status: Error -', response.status);
        }
      } catch (err) {
        setApiError(err.message);
        console.log('❌ API Status: Exception -', err.message);
      } finally {
        setApiLoading(false);
      }
    };

    fetchAuthStatus();
    fetchApiStatus();
  }, []);

  const getStatusClass = (loading, error, status) => {
    if (loading) return 'status-dot loading';
    if (error) return 'status-dot error';
    if (status) return 'status-dot success';
    return 'status-dot';
  };

  const getStatusText = (loading, error, status, serviceName) => {
    if (loading) return `${serviceName} Conectando...`;
    if (error) return `${serviceName} Desconectado`;
    if (status) return `${serviceName} Conectado`;
    return `${serviceName} Estado desconocido`;
  };

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-left">
          <div className="status-indicators">
            <div className="status-indicator">
              <div className={getStatusClass(authLoading, authError, authStatus)}></div>
              <span>{getStatusText(authLoading, authError, authStatus, 'Shipper Server Auth')}</span>
            </div>
            <div className="status-indicator">
              <div className={getStatusClass(apiLoading, apiError, apiStatus)}></div>
              <span>{getStatusText(apiLoading, apiError, apiStatus, 'Shipper Server API')}</span>
            </div>
          </div>
        </div>
        
        <div className="footer-right">
          <div className="tech-icon" title="React">
            <img src={reactIcon} alt="React" />
          </div>
          
          <div className="tech-icon" title="NestJS">
            <img src={nestIcon} alt="NestJS" />
          </div>
          
          <div className="tech-icon" title="PostgreSQL">
            <img src={postgreIcon} alt="PostgreSQL" />
          </div>
          
          <div className="tech-icon" title="Docker">
            <img src={dockerIcon} alt="Docker" />
          </div>
          
          <div className="tech-icon" title="Northflank">
            <img src={northflankIcon} alt="Northflank" />
          </div>
          
          <div className="tech-icon" title="Prisma">
            <img src={prismaIcon} alt="Prisma" />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
