// Public Service - API calls that don't require authentication
import { getApiUrl } from '../../lib/api/apiConfig.js';

/**
 * Lấy danh sách xe công khai (không cần token)
 * @returns {Promise<Array>} Danh sách xe
 */
export const getPublicVehicles = async () => {
  try {
    const response = await fetch(getApiUrl('/api/public/vehicles'), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching public vehicles:', error);
    throw error;
  }
};

/**
 * Lấy danh sách trạm công khai (không cần token)
 * @returns {Promise<Array>} Danh sách trạm
 */
export const getPublicStations = async () => {
  try {
    const response = await fetch(getApiUrl('/api/public/stations'), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching public stations:', error);
    throw error;
  }
};
