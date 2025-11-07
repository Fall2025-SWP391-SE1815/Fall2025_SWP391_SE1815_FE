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

/**
 * Get detailed revenue data for charts and analytics
 * @param {Object} params - Query parameters for filtering
 * @returns {Promise<Object>} Revenue data object
 */
const getRevenueData = async (params = {}) => {
    try {
        // Fetch rental data with parameters
        const rentalsResponse = await adminService.getRentals(params).catch(() => ({ data: [] }));
        const rentals = extractDataArray(rentalsResponse);

        // Calculate revenue by period (daily, monthly, yearly)
        const revenueByDay = {};
        const revenueByMonth = {};
        const revenueByYear = {};
        
        let totalRevenue = 0;
        let completedRentals = 0;
        let avgRentalValue = 0;

        rentals.forEach(rental => {
            if (!rental || rental.status !== 'completed') return;
            
            const amount = parseFloat(rental.totalAmount || rental.amount || 0);
            if (isNaN(amount)) return;

            totalRevenue += amount;
            completedRentals++;

            // Group by date
            const date = new Date(rental.endTime || rental.createdAt);
            const dayKey = date.toISOString().split('T')[0]; // YYYY-MM-DD
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`; // YYYY-MM
            const yearKey = date.getFullYear().toString();

            revenueByDay[dayKey] = (revenueByDay[dayKey] || 0) + amount;
            revenueByMonth[monthKey] = (revenueByMonth[monthKey] || 0) + amount;
            revenueByYear[yearKey] = (revenueByYear[yearKey] || 0) + amount;
        });

        avgRentalValue = completedRentals > 0 ? totalRevenue / completedRentals : 0;

        // Prepare chart data (last 30 days)
        const last30Days = Array.from({ length: 30 }, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - i);
            return date.toISOString().split('T')[0];
        }).reverse();

        const dailyRevenueChart = last30Days.map(day => ({
            date: day,
            revenue: revenueByDay[day] || 0
        }));

        return {
            totalRevenue,
            completedRentals,
            avgRentalValue,
            revenueByDay,
            revenueByMonth,
            revenueByYear,
            dailyRevenueChart,
            // Top performing periods
            topDays: Object.entries(revenueByDay)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 5)
                .map(([date, revenue]) => ({ date, revenue })),
            topMonths: Object.entries(revenueByMonth)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 12)
                .map(([month, revenue]) => ({ month, revenue }))
        };
    } catch (error) {
        console.error('Error fetching revenue data:', error);
        return {
            totalRevenue: 0,
            completedRentals: 0,
            avgRentalValue: 0,
            revenueByDay: {},
            revenueByMonth: {},
            revenueByYear: {},
            dailyRevenueChart: [],
            topDays: [],
            topMonths: []
        };
    }
};

export default {
    getDashboardStats,
    getRevenueData
};