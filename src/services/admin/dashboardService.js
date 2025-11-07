// Dashboard Service - Aggregate data from multiple APIs for dashboard stats
import userService from '@/services/users/userService.js';
import vehicleService from '@/services/vehicles/vehicleService.js';
import stationService from '@/services/stations/stationService.js';
import complaintsService from '@/services/complaints/complaintsService.js';
import adminService from '@/services/admin/adminService.js';

/**
 * Extract data array from API response with multiple possible structures
 * @param {Object} response - API response
 * @returns {Array} Data array
 */
const extractDataArray = (response) => {
    if (!response) return [];

    // Handle different response structures
    if (Array.isArray(response)) return response;
    if (response.result && Array.isArray(response.result)) return response.result;

    return [];
};

/**
 * Get comprehensive dashboard statistics
 * @returns {Promise<Object>} Dashboard stats object
 */
const getDashboardStats = async () => {
    try {
        // Fetch data from all relevant APIs in parallel
        const [
            usersResponse,
            vehiclesResponse,
            stationsResponse,
            complaintsResponse,
            rentalsResponse
        ] = await Promise.all([
            userService.getAll().catch(() => ({ data: [] })),
            vehicleService.getAll().catch(() => ({ data: [] })),
            stationService.getAll().catch(() => ({ data: [] })),
            complaintsService.getAll().catch(() => ({ data: [] })),
            adminService.getRentals().catch(() => ({ data: [] }))
        ]);

        // Extract data arrays - handle different response structures
        const users = extractDataArray(usersResponse);
        const vehicles = extractDataArray(vehiclesResponse);
        const stations = extractDataArray(stationsResponse);
        const complaints = extractDataArray(complaintsResponse);
        const rentals = extractDataArray(rentalsResponse);

        // Calculate statistics with safe operations
        const stats = {
            totalUsers: users.length || 0,
            totalVehicles: vehicles.length || 0,
            totalStations: stations.length || 0,
            totalStaff: users.filter(user =>
                user && (user.role === 'staff' || user.role === 'STAFF')
            ).length || 0,
            activeRentals: rentals.filter(rental =>
                rental && (rental.status === 'active' || rental.status === 'ACTIVE')
            ).length || 0,
            totalRevenue: rentals.reduce((sum, rental) => {
                if (!rental) return sum;
                const amount = parseFloat(rental.totalAmount || rental.amount || 0);
                return sum + (isNaN(amount) ? 0 : amount);
            }, 0),
            pendingComplaints: complaints.filter(complaint =>
                complaint && (complaint.status === 'pending' || complaint.status === 'PENDING')
            ).length || 0,
            systemAlerts: calculateSystemAlerts(vehicles, stations, complaints)
        };

        return stats;
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        // Return fallback stats if API calls fail
        return {
            totalUsers: 0,
            totalVehicles: 0,
            totalStations: 0,
            totalStaff: 0,
            activeRentals: 0,
            totalRevenue: 0,
            pendingComplaints: 0,
            systemAlerts: 0
        };
    }
};

/**
 * Calculate system alerts based on business rules
 * @param {Array} vehicles - Vehicles data
 * @param {Array} stations - Stations data
 * @param {Array} complaints - Complaints data
 * @returns {number} Number of system alerts
 */
const calculateSystemAlerts = (vehicles = [], stations = [], complaints = []) => {
    try {
        let alertCount = 0;

        // Alert if vehicles need maintenance
        const vehiclesNeedingMaintenance = vehicles.filter(vehicle =>
            vehicle && (vehicle.status === 'maintenance' || vehicle.maintenanceRequired === true)
        );
        alertCount += vehiclesNeedingMaintenance.length;

        // Alert if stations have low vehicle count
        const lowVehicleStations = stations.filter(station => {
            if (!station) return false;
            const availableVehicles = station.availableVehicles || 0;
            const capacity = station.capacity || 20;
            return availableVehicles < (capacity * 0.2); // Less than 20% capacity
        });
        alertCount += lowVehicleStations.length;

        // Alert for urgent complaints
        const urgentComplaints = complaints.filter(complaint =>
            complaint && (complaint.priority === 'high' || complaint.priority === 'urgent')
        );
        alertCount += urgentComplaints.length;

        return alertCount;
    } catch (error) {
        console.error('Error calculating system alerts:', error);
        return 0;
    }
};

export default {
    getDashboardStats
};