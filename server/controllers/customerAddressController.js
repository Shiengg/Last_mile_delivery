const CustomerAddress = require('../models/CustomerAddress');
const mapboxService = require('../services/mapboxService');
const { getProvincesWithDetail } = require('vietnam-provinces');

const formatVietnameseAddress = (address, locationData) => {
    // Format địa chỉ theo chuẩn Việt Nam
    const ward = locationData.ward.name.replace(/(Phường|Xã|Thị trấn)\s*/g, '');
    const district = locationData.district.name.replace(/(Quận|Huyện|Thành phố|Thị xã)\s*/g, '');
    const province = locationData.province.name.replace(/(Tỉnh|Thành phố)\s*/g, '');

    return `${address.house_number} đường ${address.street}, ${ward}, ${district}, ${province}`;
};

exports.findCustomerAddress = async (req, res) => {
    try {
        const { province_id, district_id, ward_code, house_number, street } = req.query;

        // Find existing address with exact match
        const existingAddress = await CustomerAddress.findOne({
            province_id,
            district_id,
            ward_code,
            house_number,
            street,
            status: 'active'
        });

        if (!existingAddress) {
            return res.status(404).json({
                success: false,
                message: 'No matching address found'
            });
        }

        res.json({
            success: true,
            data: existingAddress
        });
    } catch (error) {
        console.error('Error finding customer address:', error);
        res.status(500).json({
            success: false,
            message: 'Error finding customer address',
            error: error.message
        });
    }
};

exports.createCustomerAddress = async (req, res) => {
    try {
        const {
            shop_id,
            shop_name,
            province_id,
            district_id,
            ward_code,
            house_number,
            street
        } = req.body;

        // Get province data for address lookup
        const provinces = getProvincesWithDetail();
        const province = provinces[province_id];
        if (!province) throw new Error(`Province not found with ID: ${province_id}`);

        const district = province.districts[district_id];
        if (!district) throw new Error(`District not found with ID: ${district_id}`);

        const ward = district.wards[ward_code];
        if (!ward) throw new Error(`Ward not found with code: ${ward_code}`);

        // Format địa chỉ đầy đủ
        const full_address = formatVietnameseAddress(
            { house_number, street },
            { province, district, ward }
        );

        // Get coordinates from Mapbox
        const coordinates = await mapboxService.getCoordinatesFromAddress({
            house_number,
            street,
            ward_name: ward.name,
            district_name: district.name,
            province_name: province.name
        });

        // Create customer address
        const customerAddress = new CustomerAddress({
            shop_id,
            shop_name,
            province_id,
            district_id,
            ward_code,
            house_number,
            street,
            full_address,
            latitude: coordinates.latitude,
            longitude: coordinates.longitude
        });

        await customerAddress.save();

        res.status(201).json({
            success: true,
            message: 'Customer address created successfully',
            data: customerAddress
        });
    } catch (error) {
        console.error('Error creating customer address:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating customer address',
            error: error.message
        });
    }
};