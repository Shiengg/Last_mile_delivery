const District = require('../models/District');

exports.getAllDistricts = async (req, res) => {
    try {

        const { province_id } = req.query;

        let query = {};
        if (province_id) {
            const normalizedProvinceId = province_id.replace(/^0+/, '');
            query = {
                $or: [
                    { province_id: province_id },
                    { province_id: normalizedProvinceId },
                    { province_id: normalizedProvinceId.padStart(2, '0') }
                ]
            };
        }



        const districts = await District.find(query)
            .select('code name province_id')
            .sort({ name: 1 })
            .lean();



        const transformedDistricts = districts.map(district => ({
            district_id: district.code,
            name: district.name,
            province_id: district.province_id
        }));



        res.json({
            success: true,
            data: transformedDistricts
        });
    } catch (error) {
        console.error('Error in getAllDistricts:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching districts',
            error: error.message
        });
    }
}; 