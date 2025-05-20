const Province = require('../models/Province');

exports.getAllProvinces = async (req, res) => {
    try {

        const provinces = await Province.find()
            .select('code name nation_code')
            .sort({ name: 1 })
            .lean();


        const transformedProvinces = provinces.map(province => ({
            province_id: province.code.toString().padStart(2, '0'),
            name: province.name,
            code: province.code
        }));


        res.json({
            success: true,
            data: transformedProvinces
        });
    } catch (error) {
        console.error('Error in getAllProvinces:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching provinces',
            error: error.message
        });
    }
}; 