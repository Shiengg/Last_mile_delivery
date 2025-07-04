const Route = require('../models/Route');
const User = require('../models/User');
const DeliveryZone = require('../models/DeliveryZone');

/**
 * Tìm delivery staff phù hợp nhất cho một route
 * @param {Object} route - Route cần được assign
 * @returns {Promise<Object>} - Delivery staff phù hợp nhất
 */
async function findBestDeliveryStaff(route) {
    try {
        // 1. Tìm delivery zone dựa vào district_id của điểm đến
        const deliveryZone = await DeliveryZone.findOne({
            'districts.district_id': route.destination.address.district_id,
            status: 'active'
        }).populate('delivery_staff');

        if (!deliveryZone) {
            throw new Error('No active delivery zone found for this district');
        }

        // 2. Lọc ra các delivery staff đang active và chưa đạt giới hạn route
        const availableStaff = await Promise.all(
            deliveryZone.delivery_staff.map(async (staff) => {
                const activeRoutes = await Route.countDocuments({
                    delivery_staff_id: staff._id,
                    status: { $in: ['assigned', 'delivering'] }
                });

                return {
                    staff,
                    activeRoutes,
                    available: activeRoutes < staff.max_concurrent_routes
                };
            })
        );

        const eligibleStaff = availableStaff.filter(s => s.available && s.staff.status === 'active');

        if (eligibleStaff.length === 0) {
            throw new Error('No available delivery staff found in this zone');
        }

        // 3. Sắp xếp theo số lượng route đang active (ít nhất lên đầu)
        eligibleStaff.sort((a, b) => a.activeRoutes - b.activeRoutes);

        return eligibleStaff[0].staff;
    } catch (error) {
        console.error('Error finding best delivery staff:', error);
        throw error;
    }
}

/**
 * Tự động assign route cho delivery staff phù hợp
 * @param {string} routeId - ID của route cần assign
 * @returns {Promise<Object>} - Route đã được assign
 */
async function autoAssignRoute(routeId) {
    try {
        const route = await Route.findById(routeId);

        if (!route) {
            throw new Error('Route not found');
        }

        if (route.status !== 'pending') {
            throw new Error('Only pending routes can be assigned');
        }

        const bestStaff = await findBestDeliveryStaff(route);

        // Cập nhật route với delivery staff được chọn
        const updatedRoute = await Route.findByIdAndUpdate(
            routeId,
            {
                delivery_staff_id: bestStaff._id,
                status: 'assigned',
                assigned_at: new Date()
            },
            { new: true }
        );

        return updatedRoute;
    } catch (error) {
        console.error('Error auto-assigning route:', error);
        throw error;
    }
}

module.exports = {
    findBestDeliveryStaff,
    autoAssignRoute
}; 