const { v4: uuidv4 } = require('uuid');
const { parseAddress } = require('./addressService');
const Order = require('../models/order');

// Lưu trữ thông tin đơn hàng tạm thời theo user ID
const pendingOrders = new Map();

// Thời gian timeout cho đơn hàng (30 phút)
const ORDER_TIMEOUT = 30 * 60 * 1000;

// Kiểm tra các trường bắt buộc của đơn hàng
function validateOrder(order) {
    const requiredFields = {
        receiver_name: 'tên người nhận',
        receiver_phone: 'số điện thoại',
        'address.street': 'tên đường',
        'address.house_number': 'số nhà',
        'address.ward': 'phường/xã',
        'address.district': 'quận/huyện',
        'address.province': 'tỉnh/thành phố',
        products: 'sản phẩm cần mua'
    };

    const missingFields = [];

    for (const [field, label] of Object.entries(requiredFields)) {
        if (field.includes('.')) {
            const [parent, child] = field.split('.');
            if (!order[parent] || !order[parent][child]) {
                missingFields.push(label);
            }
        } else if (!order[field]) {
            missingFields.push(label);
        }
    }

    return missingFields;
}

// Cập nhật thông tin đơn hàng
function updateOrder(userId, newData) {
    const currentOrder = pendingOrders.get(userId) || {
        receiver_name: '',
        receiver_phone: '',
        address: {
            street: '',
            house_number: '',
            ward: '',
            district: '',
            province: ''
        },
        products: '',
        extra: ''
    };

    // Merge dữ liệu mới vào đơn hàng hiện tại
    const updatedOrder = {
        ...currentOrder,
        ...newData,
        address: {
            ...currentOrder.address,
            ...(newData.address || {})
        }
    };

    // Lưu đơn hàng và set timeout
    pendingOrders.set(userId, updatedOrder);
    setTimeout(() => {
        if (pendingOrders.get(userId) === updatedOrder) {
            pendingOrders.delete(userId);
        }
    }, ORDER_TIMEOUT);

    return updatedOrder;
}

// Lấy thông tin đơn hàng
function getOrder(userId) {
    return pendingOrders.get(userId);
}

// Xóa đơn hàng
function clearOrder(userId) {
    pendingOrders.delete(userId);
}

// Tạo đơn hàng trong database
async function createOrder(userId, pendingOrder) {
    try {
        // Parse địa chỉ để lấy mã
        const addressCodes = parseAddress(pendingOrder.address);
        if (!addressCodes) {
            throw new Error('Không thể parse địa chỉ');
        }

        // Tạo order_id
        const order_id = `FB-${uuidv4()}`;

        // Tạo đơn hàng mới
        const order = new Order({
            order_id,
            customer_id: userId,
            shop_id: '12345678', // ID mặc định của shop
            channel: 'social_media',
            source: {
                type: 'shop',
                location_id: '12345678',
                address: {
                    province_id: '79', // TPHCM
                    district_id: '760', // Quận 1
                    ward_code: '26734', // Phường Bến Nghé
                    street: 'Lê Lợi',
                    house_number: '68'
                }
            },
            destination: {
                receiver_name: pendingOrder.receiver_name,
                receiver_phone: pendingOrder.receiver_phone,
                address: {
                    province_id: addressCodes.province_id,
                    district_id: addressCodes.district_id,
                    ward_code: addressCodes.ward_code,
                    street: addressCodes.street,
                    house_number: addressCodes.house_number
                }
            },
            status: 'pending',
            notes: `Sản phẩm: ${pendingOrder.products}${pendingOrder.extra ? `\nGhi chú: ${pendingOrder.extra}` : ''}`,
            estimated_delivery_time: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24h từ thời điểm đặt
        });

        // Lưu vào database
        await order.save();

        return order;
    } catch (error) {
        console.error('Lỗi khi tạo đơn hàng:', error);
        throw error;
    }
}

module.exports = {
    updateOrder,
    getOrder,
    clearOrder,
    validateOrder,
    createOrder
}; 