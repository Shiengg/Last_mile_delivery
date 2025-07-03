const { getProvincesWithDetail } = require('vietnam-provinces');

// Cache data để tránh phải load lại nhiều lần
let provincesData = null;

function loadProvinceData() {
    if (!provincesData) {
        provincesData = getProvincesWithDetail();
    }
    return provincesData;
}

// Hàm xử lý tên đường
function processStreetName(street) {
    return street.toLowerCase()
        .replace(/(đường|duong|đ\.|d\.)\s*/gi, '')
        .trim();
}

function findProvinceByName(provinceName) {
    const provinces = loadProvinceData();
    // Chuẩn hóa tên tỉnh/thành phố
    const normalizedName = provinceName.toLowerCase()
        .replace(/(tỉnh|thành phố|tp|tp.|t.p|t.p.)\s*/g, '')
        .trim();

    // Tìm trong data
    for (const [id, province] of Object.entries(provinces)) {
        const name = province.name.toLowerCase()
            .replace(/(tỉnh|thành phố|tp|tp.|t.p|t.p.)\s*/g, '')
            .trim();
        if (name === normalizedName) {
            return {
                province_id: id,
                province: province
            };
        }
    }
    return null;
}

function findDistrictByName(province, districtName) {
    // Chuẩn hóa tên quận/huyện
    const normalizedName = districtName.toLowerCase()
        .replace(/(quận|huyện|thành phố|thị xã|q|q.|h|h.|tx|tx.)\s*/g, '')
        .trim();

    // Tìm trong data
    for (const [id, district] of Object.entries(province.districts)) {
        const name = district.name.toLowerCase()
            .replace(/(quận|huyện|thành phố|thị xã|q|q.|h|h.|tx|tx.)\s*/g, '')
            .trim();
        if (name === normalizedName) {
            return {
                district_id: id,
                district: district
            };
        }
    }
    return null;
}

function findWardByName(district, wardName) {
    // Chuẩn hóa tên phường/xã
    const normalizedName = wardName.toLowerCase()
        .replace(/(phường|xã|thị trấn|p|p.|x|x.|tt|tt.)\s*/g, '')
        .trim();

    // Tìm trong data
    for (const [code, ward] of Object.entries(district.wards)) {
        const name = ward.name.toLowerCase()
            .replace(/(phường|xã|thị trấn|p|p.|x|x.|tt|tt.)\s*/g, '')
            .trim();
        if (name === normalizedName) {
            return {
                ward_code: code,
                ward: ward
            };
        }
    }
    return null;
}

function parseAddress(address) {
    try {
        // Tìm tỉnh/thành phố
        const provinceResult = findProvinceByName(address.province);
        if (!provinceResult) {
            throw new Error(`Không tìm thấy tỉnh/thành phố: ${address.province}`);
        }

        // Tìm quận/huyện
        const districtResult = findDistrictByName(provinceResult.province, address.district);
        if (!districtResult) {
            throw new Error(`Không tìm thấy quận/huyện: ${address.district}`);
        }

        // Tìm phường/xã
        const wardResult = findWardByName(districtResult.district, address.ward);
        if (!wardResult) {
            throw new Error(`Không tìm thấy phường/xã: ${address.ward}`);
        }

        return {
            province_id: provinceResult.province_id,
            district_id: districtResult.district_id,
            ward_code: wardResult.ward_code,
            street: processStreetName(address.street),
            house_number: address.house_number
        };
    } catch (error) {
        console.error('Lỗi khi parse địa chỉ:', error);
        return null;
    }
}

module.exports = {
    parseAddress
}; 