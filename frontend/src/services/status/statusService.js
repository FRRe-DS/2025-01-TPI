// Servicio para consumir el endpoint de status del backend
import { API_URL } from '../config/apiConfig';

const STATUS_URL = API_URL + '/status';
const HEALTH_URL = API_URL + '/health';

export const statusService = {
  // Obtener el status del backend
  async getStatus() {
    try {
      const response = await fetch(STATUS_URL);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return {
        success: true,
        data: data
      };
    } catch (error) {
      console.error('Error fetching status:', error);
      return {
        success: false,
        error: error.message,
        data: null
      };
    }
  },

  // Obtener el health check del backend
  async getHealth() {
    try {
      const response = await fetch(HEALTH_URL);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return {
        success: true,
        data: data
      };
    } catch (error) {
      console.error('Error fetching health:', error);
      return {
        success: false,
        error: error.message,
        data: null
      };
    }
  }
};

export default statusService;
