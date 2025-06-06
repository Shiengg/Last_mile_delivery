const Warehouse = require('../models/warehouse');
const Province = require('../models/Province');
const District = require('../models/District');
const { logActivity } = require('./activityController');

// @desc    Get all warehouses
exports.getAllWarehouses = async (req, res) => {
    try {
        const { province_code, district_code, page = 1, limit = 10, search } = req.query;

        let query = {};
        if (province_code) query.province_code = province_code; // Assuming province_code in query is a string
        if (district_code) query.district_code = district_code;
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { id: { $regex: search, $options: 'i' } },
                { address: { $regex: search, $options: 'i' } }
            ];
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const total = await Warehouse.countDocuments(query);

        // Populate province and district names.
        // Since Warehouse.province_code is a string and Province.code is a number,
        // and Warehouse.district_code is a string and District.code is a string,
        // Mongoose's default populate won't work directly if `ref` expects `_id`.
        // We'll fetch them manually or adjust schema for direct populate if needed.
        // For simplicity, not populating here, but you can add manual lookups.
        const warehouses = await Warehouse.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const totalPages = Math.ceil(total / parseInt(limit));

        res.json({
            success: true,
            data: warehouses,
            pagination: { total, page: parseInt(page), limit: parseInt(limit), totalPages }
        });
    } catch (error) {
        console.error('Error in getAllWarehouses:', error);
        res.status(500).json({ success: false, message: 'Error fetching warehouses', error: error.message });
    }
};

// @desc    Get single warehouse by MongoDB _id
exports.getWarehouseById = async (req, res) => {
    try {
        const warehouse = await Warehouse.findById(req.params.id);
        // Manual populate example:
        // if (warehouse) {
        //     const province = await Province.findOne({ code: Number(warehouse.province_code) });
        //     const district = await District.findOne({ code: warehouse.district_code, province_id: warehouse.province_code });
        //     // Attach to response or a new object if needed
        // }

        if (!warehouse) {
            return res.status(404).json({ success: false, message: 'Warehouse not found' });
        }
        res.json({ success: true, data: warehouse });
    } catch (error) {
        console.error('Error in getWarehouseById:', error);
        if (error.kind === 'ObjectId') {
            return res.status(404).json({ success: false, message: 'Warehouse not found (invalid ID format)' });
        }
        res.status(500).json({ success: false, message: 'Error fetching warehouse', error: error.message });
    }
};

// @desc    Create a new warehouse
exports.createWarehouse = async (req, res) => {
    try {
        const { id, name, address, province_code, district_code, ward_code } = req.body;

        if (!id || !name || !province_code || !district_code || ward_code === undefined) {
            return res.status(400).json({ success: false, message: 'Required fields: id, name, province_code, district_code, ward_code' });
        }

        // Validate province_code (Warehouse.province_code is String, Province.code is Number)
        const provinceCodeNum = Number(province_code);
        if (isNaN(provinceCodeNum)) {
            return res.status(400).json({ success: false, message: 'Invalid province_code format. Must be a number.' });
        }
        const provinceExists = await Province.findOne({ code: provinceCodeNum });
        if (!provinceExists) {
            return res.status(400).json({ success: false, message: `Province with code ${province_code} does not exist.` });
        }

        // Validate district_code (Warehouse.district_code is String, District.code is String, District.province_id is String)
        // District.province_id should match the string representation of Province.code
        const districtExists = await District.findOne({ code: district_code, province_id: province_code });
        if (!districtExists) {
            return res.status(400).json({ success: false, message: `District with code ${district_code} in province ${province_code} does not exist.` });
        }

        // Check for duplicate custom warehouse 'id'
        const existingWarehouseByCustomId = await Warehouse.findOne({ id });
        if (existingWarehouseByCustomId) {
            return res.status(400).json({ success: false, message: `Warehouse with custom ID ${id} already exists.` });
        }

        const newWarehouse = new Warehouse({
            id, name, address,
            province_code: province_code, // Storing as string
            district_code: district_code,
            ward_code: Number(ward_code)
        });
        await newWarehouse.save();

        await logActivity('CREATE', 'WAREHOUSE', `Warehouse ${newWarehouse.name} (Custom ID: ${newWarehouse.id}) created`, req.user._id, { entityId: newWarehouse._id, entityName: newWarehouse.name });
        res.status(201).json({ success: true, data: newWarehouse });

    } catch (error) {
        console.error('Error creating warehouse:', error);
        let message = 'Error creating warehouse';
        // Assuming Warehouse.id has a unique index in MongoDB schema (add 'unique:true' to Warehouse.id if not)
        if (error.code === 11000 && error.keyPattern && error.keyPattern.id) {
            message = `Warehouse with custom ID ${id} already exists.`;
        } else if (error.name === 'ValidationError') {
            message = Object.values(error.errors).map(e => e.message).join(', ');
        }
        res.status(400).json({ success: false, message, error: error.message, details: error.errors });
    }
};

// @desc    Update a warehouse by MongoDB _id
exports.updateWarehouse = async (req, res) => {
    try {
        const { id: customId, name, address, province_code, district_code, ward_code } = req.body;
        const mongoDbId = req.params.id;

        let warehouse = await Warehouse.findById(mongoDbId);
        if (!warehouse) {
            return res.status(404).json({ success: false, message: 'Warehouse not found' });
        }

        // If custom warehouse 'id' is being changed, check for uniqueness
        if (customId && customId !== warehouse.id) {
            const existingByCustomId = await Warehouse.findOne({ id: customId, _id: { $ne: warehouse._id } });
            if (existingByCustomId) {
                return res.status(400).json({ success: false, message: `Another warehouse with custom ID ${customId} already exists.` });
            }
            warehouse.id = customId;
        }

        if (name) warehouse.name = name;
        if (address !== undefined) warehouse.address = address; // Allow empty string
        if (ward_code !== undefined) warehouse.ward_code = Number(ward_code);

        let provinceChanged = false;
        if (province_code && province_code !== warehouse.province_code) {
            const provinceCodeNum = Number(province_code);
            if (isNaN(provinceCodeNum)) {
                return res.status(400).json({ success: false, message: 'Invalid province_code format for update. Must be a number.' });
            }
            const provinceExists = await Province.findOne({ code: provinceCodeNum });
            if (!provinceExists) return res.status(400).json({ success: false, message: `Province with code ${province_code} does not exist.` });
            warehouse.province_code = province_code; // Store as string
            provinceChanged = true;
        }

        // If district_code is provided OR if province_code changed (district must be re-validated/provided)
        if (district_code || provinceChanged) {
            const targetDistrictCode = district_code || warehouse.district_code; // Use new district if provided, else old one
            const targetProvinceForDistrict = provinceChanged ? province_code : warehouse.province_code;

            if (!targetDistrictCode && provinceChanged) { // If province changed, new district is mandatory
                return res.status(400).json({ success: false, message: 'If province changes, a valid district_code for the new province must be provided.' });
            }

            if (targetDistrictCode) { // Only validate if a district code is effectively being used/changed
                const districtExists = await District.findOne({ code: targetDistrictCode, province_id: targetProvinceForDistrict });
                if (!districtExists) return res.status(400).json({ success: false, message: `District ${targetDistrictCode} in province ${targetProvinceForDistrict} does not exist.` });
                warehouse.district_code = targetDistrictCode;
            }
        }


        const updatedWarehouse = await warehouse.save();
        await logActivity('UPDATE', 'WAREHOUSE', `Warehouse ${updatedWarehouse.name} (Custom ID: ${updatedWarehouse.id}) updated`, req.user._id, { entityId: updatedWarehouse._id, entityName: updatedWarehouse.name });
        res.json({ success: true, message: 'Warehouse updated successfully', data: updatedWarehouse });

    } catch (error) {
        console.error('Error updating warehouse:', error);
        let message = 'Error updating warehouse';
        if (error.code === 11000 && error.keyPattern && error.keyPattern.id) {
            message = `Warehouse with this custom ID already exists.`;
        } else if (error.name === 'ValidationError') {
            message = Object.values(error.errors).map(e => e.message).join(', ');
        }
        res.status(400).json({ success: false, message, error: error.message, details: error.errors });
    }
};

// @desc    Delete a warehouse by MongoDB _id
exports.deleteWarehouse = async (req, res) => {
    try {
        const warehouse = await Warehouse.findById(req.params.id);
        if (!warehouse) {
            return res.status(404).json({ success: false, message: 'Warehouse not found' });
        }

        // Business logic: Check if warehouse is in use (e.g., linked to stock, shipments)
        // Example:
        // const activeStock = await Stock.findOne({ warehouse_custom_id: warehouse.id });
        // if (activeStock) {
        //     return res.status(400).json({ success: false, message: 'Cannot delete warehouse. It has active stock.' });
        // }

        const warehouseName = warehouse.name;
        const warehouseCustomId = warehouse.id;
        await Warehouse.findByIdAndDelete(req.params.id);

        await logActivity('DELETE', 'WAREHOUSE', `Warehouse ${warehouseName} (Custom ID: ${warehouseCustomId}) deleted`, req.user._id, { entityId: req.params.id, entityName: warehouseName });
        res.json({ success: true, message: 'Warehouse deleted successfully' });

    } catch (error) {
        console.error('Error deleting warehouse:', error);
        if (error.kind === 'ObjectId') {
            return res.status(404).json({ success: false, message: 'Warehouse not found (invalid ID format)' });
        }
        res.status(500).json({ success: false, message: 'Error deleting warehouse', error: error.message });
    }
};