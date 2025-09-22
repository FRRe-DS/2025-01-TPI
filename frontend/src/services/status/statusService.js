// Servicio para consumir el endpoint de status del backend
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://p01--backend--vtq7dc7r2j7w.code.run';

export const statusService = {
  // Obtener el status del backend
  async getStatus() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/status`);
      
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
      const response = await fetch(`${API_BASE_URL}/health`);
      
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
