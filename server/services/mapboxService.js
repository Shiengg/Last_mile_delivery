const axios = require('axios');

const MAPBOX_ACCESS_TOKEN = process.env.MAPBOX_ACCESS_TOKEN;
const MAPBOX_BASE_URL = 'https://api.mapbox.com/geocoding/v5/mapbox.places';

const formatVietnameseAddress = (address) => {
    // Xóa các từ "Phường", "Thành phố" để làm địa chỉ ngắn gọn hơn
    let ward = address.ward_name.replace(/(Phường|Xã|Thị trấn)\s*/g, '');
    let district = address.district_name.replace(/(Quận|Huyện|Thành phố|Thị xã)\s*/g, '');
    let province = address.province_name.replace(/(Tỉnh|Thành phố)\s*/g, '');

    // Nếu là TPHCM thì chỉ để "Ho Chi Minh"
    if (province.includes('Hồ Chí Minh')) {
        province = 'Ho Chi Minh';
    }

    // Format địa chỉ theo chuẩn quốc tế
    return `${address.house_number} ${address.street}, ${ward}, ${district}, ${province}, Vietnam`;
};

const getCoordinatesFromAddress = async (address) => {
    try {
        const formattedAddress = formatVietnameseAddress(address);
        console.log('Formatted address for Mapbox:', formattedAddress);

        const encodedAddress = encodeURIComponent(formattedAddress);

        const response = await axios.get(
            `${MAPBOX_BASE_URL}/${encodedAddress}.json?country=VN&access_token=${MAPBOX_ACCESS_TOKEN}&limit=1`
        );

        if (response.data.features && response.data.features.length > 0) {
            const [longitude, latitude] = response.data.features[0].center;
            console.log('Found coordinates:', { latitude, longitude });
            return { latitude, longitude };
        }

        throw new Error('No coordinates found for the given address');
    } catch (error) {
        console.error('Error getting coordinates from Mapbox:', error);
        throw error;
    }
};

module.exports = {
    getCoordinatesFromAddress
}; 