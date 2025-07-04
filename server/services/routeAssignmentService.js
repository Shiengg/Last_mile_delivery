const Route = require('../models/Route');
const User = require('../models/User');
const DeliveryZone = require('../models/DeliveryZone');
const mapboxService = require('./mapboxService');
const Shop = require('../models/Shop');

/**
 * Tính khoảng cách giữa hai điểm
 * @param {Object} point1 - Điểm thứ nhất {latitude, longitude}
 * @param {Object} point2 - Điểm thứ hai {latitude, longitude}
 * @returns {number} - Khoảng cách tính bằng km
 */
function calculateDistance(point1, point2) {
    const R = 6371; // Bán kính trái đất (km)
    const dLat = (point2.latitude - point1.latitude) * Math.PI / 180;
    const dLon = (point2.longitude - point1.longitude) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(point1.latitude * Math.PI / 180) * Math.cos(point2.latitude * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

/**
 * Kiểm tra xem route có phù hợp với delivery staff không
 * @param {Object} route - Route cần kiểm tra
 * @param {Object} staff - Delivery staff
 * @param {Object} deliveryZone - Vùng giao hàng
 * @returns {Promise<boolean>} - True nếu phù hợp
 */
async function isRouteCompatible(route, staff, deliveryZone) {
    try {
        // 1. Kiểm tra số lượng route hiện tại
        const activeRoutes = await Route.countDocuments({
            delivery_staff_id: staff._id,
            status: { $in: ['assigned', 'delivering'] }
        });

        if (activeRoutes >= deliveryZone.settings.max_concurrent_routes) {
            console.log(`Staff ${staff._id} has too many active routes: ${activeRoutes}`);
            return false;
        }

        // 2. Lấy thông tin shops
        const firstShop = await Shop.findOne({ shop_id: route.shops[0].shop_id });
        const lastShop = await Shop.findOne({ shop_id: route.shops[route.shops.length - 1].shop_id });

        if (!firstShop || !lastShop) {
            console.log('Could not find shop information');
            return false;
        }

        // 3. Kiểm tra khoảng cách của route mới
        const routeDistance = calculateDistance(
            { latitude: firstShop.latitude, longitude: firstShop.longitude },
            { latitude: lastShop.latitude, longitude: lastShop.longitude }
        );

        if (routeDistance > deliveryZone.settings.max_distance_per_route) {
            console.log(`Route distance ${routeDistance} exceeds max allowed ${deliveryZone.settings.max_distance_per_route}`);
            return false;
        }

        // 4. Kiểm tra tổng khoảng cách với các route hiện tại
        const existingRoutes = await Route.find({
            delivery_staff_id: staff._id,
            status: { $in: ['assigned', 'delivering'] }
        }).populate('shops.shop_id');

        let totalDistance = routeDistance;
        for (const existingRoute of existingRoutes) {
            if (existingRoute.shops && existingRoute.shops.length >= 2) {
                const firstExistingShop = await Shop.findOne({ shop_id: existingRoute.shops[0].shop_id });
                const lastExistingShop = await Shop.findOne({
                    shop_id: existingRoute.shops[existingRoute.shops.length - 1].shop_id
                });

                if (firstExistingShop && lastExistingShop) {
                    totalDistance += calculateDistance(
                        { latitude: firstExistingShop.latitude, longitude: firstExistingShop.longitude },
                        { latitude: lastExistingShop.latitude, longitude: lastExistingShop.longitude }
                    );
                }
            }
        }

        // Giới hạn tổng khoảng cách trong một ngày (ví dụ: 100km)
        const MAX_DAILY_DISTANCE = 100;
        if (totalDistance > MAX_DAILY_DISTANCE) {
            console.log(`Total distance ${totalDistance} exceeds max daily distance ${MAX_DAILY_DISTANCE}`);
            return false;
        }

        console.log(`Route is compatible with staff ${staff._id}:`, {
            activeRoutes,
            routeDistance,
            totalDistance,
            maxConcurrentRoutes: deliveryZone.settings.max_concurrent_routes,
            maxDistancePerRoute: deliveryZone.settings.max_distance_per_route
        });

        return true;
    } catch (error) {
        console.error('Error checking route compatibility:', error);
        return false;
    }
}

/**
 * Tìm delivery staff phù hợp nhất cho một route
 * @param {Object} route - Route cần được assign
 * @returns {Promise<Object>} - Delivery staff phù hợp nhất
 */
async function findBestDeliveryStaff(route) {
    try {
        // Kiểm tra xem route có shops không
        if (!route.shops || route.shops.length === 0) {
            throw new Error('Route has no shops');
        }

        // Lấy thông tin shop cuối cùng trong route (điểm đến)
        const lastShop = route.shops[route.shops.length - 1];
        if (!lastShop || !lastShop.shop_id) {
            throw new Error('Route destination shop not found');
        }

        console.log('Finding shop with shop_id:', lastShop.shop_id);

        // Lấy thông tin chi tiết của shop
        const destinationShop = await Shop.findOne({ shop_id: lastShop.shop_id });
        if (!destinationShop) {
            throw new Error(`Destination shop ${lastShop.shop_id} not found in database`);
        }

        // Log thông tin để debug
        console.log('Destination shop:', {
            shop_id: destinationShop.shop_id,
            shop_name: destinationShop.shop_name,
            district_id: destinationShop.district_id,
            address: {
                province_id: destinationShop.province_id,
                district_id: destinationShop.district_id,
                ward_code: destinationShop.ward_code,
                street: destinationShop.street
            }
        });

        if (!destinationShop.district_id) {
            throw new Error(`Shop ${lastShop.shop_id} is missing district_id`);
        }

        // 1. Tìm delivery zone dựa vào district_id của shop đích
        const deliveryZone = await DeliveryZone.findOne({
            'districts.district_id': destinationShop.district_id,
            status: 'active'
        }).populate('delivery_staff');

        // Log thông tin delivery zone để debug
        console.log('Found delivery zone:', deliveryZone ? {
            id: deliveryZone._id,
            name: deliveryZone.name,
            districts: deliveryZone.districts,
            staff_count: deliveryZone.delivery_staff?.length
        } : 'No delivery zone found');

        if (!deliveryZone) {
            throw new Error(`No active delivery zone found for district ${destinationShop.district_id}`);
        }

        // 2. Lọc ra các delivery staff đang active
        const eligibleStaff = [];
        for (const staff of deliveryZone.delivery_staff) {
            if (!staff) {
                console.log('Found null staff in delivery zone');
                continue;
            }

            if (staff.status !== 'active') {
                console.log(`Staff ${staff._id} is not active, status: ${staff.status}`);
                continue;
            }

            const isCompatible = await isRouteCompatible(route, staff, deliveryZone);
            if (isCompatible) {
                const activeRoutes = await Route.countDocuments({
                    delivery_staff_id: staff._id,
                    status: { $in: ['assigned', 'delivering'] }
                });

                eligibleStaff.push({
                    staff,
                    activeRoutes,
                    score: calculateStaffScore(staff, route, activeRoutes)
                });
            } else {
                console.log(`Staff ${staff._id} is not compatible with route`);
            }
        }

        if (eligibleStaff.length === 0) {
            throw new Error('No available delivery staff found in this zone');
        }

        // Log thông tin staff được chọn
        console.log('Eligible staff:', eligibleStaff.map(s => ({
            id: s.staff._id,
            activeRoutes: s.activeRoutes,
            score: s.score
        })));

        // 3. Sắp xếp theo điểm số (cao nhất lên đầu)
        eligibleStaff.sort((a, b) => b.score - a.score);

        return eligibleStaff[0].staff;
    } catch (error) {
        console.error('Error finding best delivery staff:', error);
        throw error;
    }
}

/**
 * Tính điểm phù hợp của delivery staff với route
 * @param {Object} staff - Delivery staff
 * @param {Object} route - Route cần assign
 * @param {number} activeRoutes - Số route đang active
 * @returns {number} - Điểm số
 */
function calculateStaffScore(staff, route, activeRoutes) {
    let score = 100;

    // 1. Trừ điểm dựa trên số route đang active (trọng số cao nhất)
    score -= (activeRoutes * 15);

    // 2. Cộng điểm dựa trên đánh giá và hiệu suất
    if (staff.delivery_metrics) {
        // Rating (0-5 sao)
        if (staff.delivery_metrics.rating > 0) {
            score += staff.delivery_metrics.rating * 5;
        }

        // Tỉ lệ giao hàng thành công
        const successRate = staff.delivery_metrics.total_deliveries > 0
            ? (staff.delivery_metrics.successful_deliveries / staff.delivery_metrics.total_deliveries) * 100
            : 0;
        if (successRate >= 90) score += 10;
        else if (successRate >= 80) score += 5;
    }

    // 3. Cộng điểm cho khu vực quen thuộc
    if (staff.familiar_districts && staff.familiar_districts.length > 0) {
        const lastShop = route.shops[route.shops.length - 1];
        const familiarDistrict = staff.familiar_districts.find(d => d.district_id === lastShop.district_id);
        if (familiarDistrict) {
            // Cộng điểm dựa trên số lần đã giao trong khu vực
            const deliveryBonus = Math.min(10, familiarDistrict.delivery_count);
            score += deliveryBonus;

            // Cộng thêm điểm nếu giao hàng gần đây (trong vòng 7 ngày)
            if (familiarDistrict.last_delivery_date &&
                (Date.now() - new Date(familiarDistrict.last_delivery_date).getTime()) < 7 * 24 * 60 * 60 * 1000) {
                score += 5;
            }
        }
    }

    // 4. Kiểm tra giờ làm việc ưu tiên
    if (staff.preferred_working_hours) {
        const now = new Date();
        const currentHour = now.getHours();
        if (currentHour >= staff.preferred_working_hours.start &&
            currentHour <= staff.preferred_working_hours.end) {
            score += 8;
        }
    }

    // 5. Trừ điểm cho các lần từ chối gần đây
    if (staff.delivery_history?.recent_rejections) {
        const recentRejections = staff.delivery_history.recent_rejections.filter(r =>
            Date.now() - new Date(r.timestamp).getTime() < 24 * 60 * 60 * 1000
        );
        score -= (recentRejections.length * 5);
    }

    // 6. Random factor (1-5 điểm)
    score += Math.random() * 5;

    // Log chi tiết tính điểm
    console.log(`Score calculation for staff ${staff._id}:`, {
        baseScore: 100,
        activeRoutesDeduction: -(activeRoutes * 15),
        ratingBonus: staff.delivery_metrics?.rating ? staff.delivery_metrics.rating * 5 : 0,
        familiarDistrictBonus: staff.familiar_districts?.some(d =>
            d.district_id === route.shops[route.shops.length - 1].district_id
        ) ? 10 : 0,
        workingHoursBonus: staff.preferred_working_hours ? 8 : 0,
        finalScore: Math.max(0, score)
    });

    return Math.max(0, score);
}

/**
 * Tự động assign route cho delivery staff phù hợp
 * @param {string} routeId - ID của route cần assign
 * @returns {Promise<Object>} - Route đã được assign
 */
async function autoAssignRoute(routeId) {
    try {
        // Lấy route với đầy đủ thông tin
        const route = await Route.findById(routeId);

        console.log('Route found:', {
            id: route?._id,
            status: route?.status,
            shops: route?.shops?.map(s => ({
                shop_id: s.shop_id,
                order: s.order,
                status: s.status
            }))
        });

        if (!route) {
            throw new Error('Route not found');
        }

        if (route.status !== 'pending') {
            throw new Error('Only pending routes can be assigned');
        }

        // Kiểm tra shops
        if (!route.shops || route.shops.length === 0) {
            throw new Error('Route has no shops to deliver to');
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
        ).populate('delivery_staff_id', 'username fullName');

        console.log('Route updated:', {
            id: updatedRoute._id,
            status: updatedRoute.status,
            staff: updatedRoute.delivery_staff_id
        });

        return updatedRoute;
    } catch (error) {
        console.error('Error auto-assigning route:', error);
        throw error;
    }
}

/**
 * Tự động assign nhiều route cùng lúc
 * @param {Array<string>} routeIds - Danh sách ID của các route cần assign
 * @returns {Promise<Array<Object>>} - Danh sách các route đã được assign
 */
async function batchAutoAssignRoutes(routeIds) {
    const results = [];
    const errors = [];

    for (const routeId of routeIds) {
        try {
            const assignedRoute = await autoAssignRoute(routeId);
            results.push(assignedRoute);
        } catch (error) {
            errors.push({ routeId, error: error.message });
        }
    }

    return {
        success: results,
        failures: errors
    };
}

module.exports = {
    findBestDeliveryStaff,
    autoAssignRoute,
    batchAutoAssignRoutes
}; 