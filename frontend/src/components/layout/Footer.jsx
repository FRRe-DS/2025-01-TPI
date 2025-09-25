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
  const [backendStatus, setBackendStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        setLoading(true);
        const result = await statusService.getStatus();

        if (result.success) {
          setBackendStatus(result.data);
          setError(null);
        } else {
          setError(result.error);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
  }, []);

  const getStatusClass = () => {
    if (loading) return 'status-dot loading';
    if (error) return 'status-dot error';
    if (backendStatus) return 'status-dot success';
    return 'status-dot';
  };

  const getStatusText = () => {
    if (loading) return 'Conectando...';
    if (error) return 'Backend desconectado';
    if (backendStatus) return `Backend conectado - DB: ${backendStatus.services.database}`;
    return 'Estado desconocido';
  };

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-left">
          <div className="status-indicator">
            <div className={getStatusClass()}></div>
            <span>{getStatusText()}</span>
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
