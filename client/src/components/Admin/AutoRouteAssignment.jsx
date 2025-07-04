import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const AutoRouteAssignment = () => {
    const [pendingRoutes, setPendingRoutes] = useState([]);
    const [deliveryZones, setDeliveryZones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRoutes, setSelectedRoutes] = useState([]);
    const [assignmentInProgress, setAssignmentInProgress] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [showZoneModal, setShowZoneModal] = useState(false);
    const [districts, setDistricts] = useState([]);
    const [deliveryStaff, setDeliveryStaff] = useState([]);
    const [selectedDistricts, setSelectedDistricts] = useState([]);
    const [selectedStaff, setSelectedStaff] = useState([]);
    const [newZone, setNewZone] = useState({
        name: '',
        description: '',
        max_concurrent_routes: 5,
        max_distance_per_route: 20
    });
    const [editingZone, setEditingZone] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [zoneToDelete, setZoneToDelete] = useState(null);
    const [loadingRoutes, setLoadingRoutes] = useState(true);

    useEffect(() => {
        fetchCurrentUser();
        fetchData();
        fetchDistricts();
        fetchDeliveryStaff();
        fetchPendingRoutes();
    }, []);

    const fetchCurrentUser = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/api/users/me', {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log('Current user info:', response.data);
            setCurrentUser(response.data.data);
        } catch (error) {
            console.error('Error fetching current user:', error);
            toast.error('Failed to fetch user information');
        }
    };

    const fetchDistricts = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/api/districts', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setDistricts(response.data.data || []);
        } catch (error) {
            console.error('Error fetching districts:', error);
            toast.error('Failed to load districts');
        }
    };

    const fetchDeliveryStaff = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/api/admin/delivery-staff', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setDeliveryStaff(response.data.data || []);
        } catch (error) {
            console.error('Error fetching delivery staff:', error);
            toast.error('Failed to load delivery staff');
        }
    };

    const fetchPendingRoutes = async () => {
        try {
            setLoadingRoutes(true);
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/api/routes', {
                params: {
                    status: 'pending'
                },
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                setPendingRoutes(response.data.data);
            } else {
                throw new Error(response.data.message);
            }
        } catch (error) {
            console.error('Error fetching pending routes:', error);
            toast.error(error.response?.data?.message || 'Failed to fetch pending routes');
        } finally {
            setLoadingRoutes(false);
        }
    };

    const handleCreateZone = async () => {
        try {
            const token = localStorage.getItem('token');
            const zoneData = {
                ...newZone,
                districts: selectedDistricts.map(d => ({
                    province_id: d.province_id,
                    district_id: d.district_id,
                    district_name: d.name
                })),
                delivery_staff: selectedStaff,
                settings: {
                    max_concurrent_routes: parseInt(newZone.max_concurrent_routes),
                    max_distance_per_route: parseInt(newZone.max_distance_per_route)
                }
            };

            await axios.post('http://localhost:5000/api/delivery-zones', zoneData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            toast.success('Delivery zone created successfully');
            setShowZoneModal(false);
            fetchData(); // Refresh zones list

            // Reset form
            setNewZone({
                name: '',
                description: '',
                max_concurrent_routes: 5,
                max_distance_per_route: 20
            });
            setSelectedDistricts([]);
            setSelectedStaff([]);
        } catch (error) {
            console.error('Error creating delivery zone:', error);
            toast.error(error.response?.data?.message || 'Failed to create delivery zone');
        }
    };

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };

            const [routesResponse, zonesResponse] = await Promise.all([
                axios.get('http://localhost:5000/api/routes?status=pending', { headers }),
                axios.get('http://localhost:5000/api/delivery-zones', { headers })
            ]);

            setPendingRoutes(routesResponse.data.data || []);
            setDeliveryZones(zonesResponse.data.data || []);
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const handleSelectRoute = (routeId) => {
        setSelectedRoutes(prev => {
            if (prev.includes(routeId)) {
                return prev.filter(id => id !== routeId);
            }
            return [...prev, routeId];
        });
    };

    const handleSelectAllRoutes = (e) => {
        if (e.target.checked) {
            setSelectedRoutes(pendingRoutes.map(route => route._id));
        } else {
            setSelectedRoutes([]);
        }
    };

    const handleAutoAssign = async () => {
        if (selectedRoutes.length === 0) {
            toast.error('Please select at least one route to assign');
            return;
        }

        // Kiểm tra thông tin shop của các route được chọn
        const routesWithoutShop = selectedRoutes
            .map(routeId => pendingRoutes.find(r => r._id === routeId))
            .filter(route => !route?.shops || route.shops.length === 0);

        if (routesWithoutShop.length > 0) {
            toast.error(`${routesWithoutShop.length} route(s) are missing shop information. Please update the routes first.`);
            return;
        }

        try {
            setAssignmentInProgress(true);
            const token = localStorage.getItem('token');
            const response = await axios.post('http://localhost:5000/api/routes/auto-assign', {
                routeIds: selectedRoutes
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                // Cập nhật danh sách route sau khi assign thành công
                const updatedRoutes = pendingRoutes.filter(route => !selectedRoutes.includes(route._id));
                setPendingRoutes(updatedRoutes);
                setSelectedRoutes([]); // Clear selection
                toast.success(response.data.message);
            } else {
                // Hiển thị thông tin chi tiết về các route thất bại
                if (response.data.data?.failed?.length > 0) {
                    const failedRoutes = response.data.data.failed;
                    failedRoutes.forEach(route => {
                        toast.error(`Failed to assign route ${route.route_code}: ${route.error}`);
                    });
                }
                throw new Error(response.data.message);
            }
        } catch (error) {
            console.error('Error auto-assigning routes:', error);
            toast.error(error.response?.data?.message || 'Failed to auto-assign routes');
        } finally {
            setAssignmentInProgress(false);
        }
    };

    const getLocationName = (route, type) => {
        try {
            if (!route || !route[type] || !route[type].address) {
                return 'N/A';
            }
            const location = route[type].address;
            return location.district_name || location.district || 'N/A';
        } catch (error) {
            return 'N/A';
        }
    };

    const handleEditZone = (zone) => {
        setEditingZone(zone);
        setNewZone({
            name: zone.name,
            description: zone.description,
            max_concurrent_routes: zone.settings?.max_concurrent_routes || 5,
            max_distance_per_route: zone.settings?.max_distance_per_route || 20
        });
        setSelectedDistricts(zone.districts || []);
        setSelectedStaff(zone.delivery_staff?.map(staff => staff._id) || []);
        setShowZoneModal(true);
    };

    const handleDeleteZone = async (zoneId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:5000/api/delivery-zones/${zoneId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            toast.success('Delivery zone deleted successfully');
            fetchData(); // Refresh zones list
            setShowDeleteConfirm(false);
            setZoneToDelete(null);
        } catch (error) {
            console.error('Error deleting delivery zone:', error);
            toast.error(error.response?.data?.message || 'Failed to delete delivery zone');
        }
    };

    const handleSaveZone = async () => {
        try {
            const token = localStorage.getItem('token');
            const zoneData = {
                ...newZone,
                districts: selectedDistricts.map(d => ({
                    province_id: d.province_id,
                    district_id: d.district_id,
                    district_name: d.name
                })),
                delivery_staff: selectedStaff,
                settings: {
                    max_concurrent_routes: parseInt(newZone.max_concurrent_routes),
                    max_distance_per_route: parseInt(newZone.max_distance_per_route)
                }
            };

            if (editingZone) {
                // Update existing zone
                await axios.put(`http://localhost:5000/api/delivery-zones/${editingZone._id}`, zoneData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                toast.success('Delivery zone updated successfully');
            } else {
                // Create new zone
                await axios.post('http://localhost:5000/api/delivery-zones', zoneData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                toast.success('Delivery zone created successfully');
            }

            setShowZoneModal(false);
            fetchData(); // Refresh zones list

            // Reset form
            setNewZone({
                name: '',
                description: '',
                max_concurrent_routes: 5,
                max_distance_per_route: 20
            });
            setSelectedDistricts([]);
            setSelectedStaff([]);
            setEditingZone(null);
        } catch (error) {
            console.error('Error saving delivery zone:', error);
            toast.error(error.response?.data?.message || 'Failed to save delivery zone');
        }
    };

    const renderRouteList = () => {
        if (loadingRoutes) {
            return <div className="text-center py-4">Loading routes...</div>;
        }

        // Lọc chỉ lấy các route có status là pending
        const pendingOnlyRoutes = pendingRoutes.filter(route => route.status === 'pending');

        if (pendingOnlyRoutes.length === 0) {
            return <div className="text-center py-4">No pending routes found</div>;
        }

        return (
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                    <thead>
                        <tr>
                            <th className="px-4 py-2">
                                <input
                                    type="checkbox"
                                    onChange={handleSelectAllRoutes}
                                    checked={selectedRoutes.length === pendingOnlyRoutes.length}
                                />
                            </th>
                            <th className="px-4 py-2">Route Code</th>
                            <th className="px-4 py-2">Destination Shop</th>
                            <th className="px-4 py-2">Shop Address</th>
                            <th className="px-4 py-2">District</th>
                            <th className="px-4 py-2">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pendingOnlyRoutes.map(route => {
                            const lastShop = route.shops[route.shops.length - 1];
                            const shopDetails = lastShop?.shop_details;
                            return (
                                <tr key={route._id} className={!lastShop ? 'bg-red-100' : ''}>
                                    <td className="border px-4 py-2">
                                        <input
                                            type="checkbox"
                                            checked={selectedRoutes.includes(route._id)}
                                            onChange={() => handleSelectRoute(route._id)}
                                        />
                                    </td>
                                    <td className="border px-4 py-2">{route.route_code}</td>
                                    <td className="border px-4 py-2">{shopDetails?.shop_name || 'N/A'}</td>
                                    <td className="border px-4 py-2">
                                        {shopDetails ? (
                                            `${shopDetails.street}, ${shopDetails.ward_code}`
                                        ) : (
                                            <span className="text-red-500">Missing shop</span>
                                        )}
                                    </td>
                                    <td className="border px-4 py-2">
                                        {shopDetails?.district_id ||
                                            <span className="text-red-500">Missing district</span>}
                                    </td>
                                    <td className="border px-4 py-2">{route.status}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="p-6">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                    <div className="space-y-3">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-20 bg-gray-200 rounded"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-800">Auto Route Assignment</h2>
                <div className="flex gap-4">
                    <button
                        onClick={() => setShowZoneModal(true)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                        Create Delivery Zone
                    </button>
                    <button
                        onClick={handleAutoAssign}
                        disabled={selectedRoutes.length === 0}
                        className={`px-4 py-2 rounded-lg text-white ${selectedRoutes.length === 0
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700'
                            }`}
                    >
                        Auto Assign Selected Routes
                    </button>
                </div>
            </div>

            {/* Create Zone Modal */}
            {showZoneModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <h3 className="text-xl font-semibold mb-4">
                            {editingZone ? 'Edit Delivery Zone' : 'Create New Delivery Zone'}
                        </h3>

                        {/* Basic Info */}
                        <div className="space-y-4 mb-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Zone Name
                                </label>
                                <input
                                    type="text"
                                    value={newZone.name}
                                    onChange={(e) => setNewZone({ ...newZone, name: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-lg"
                                    placeholder="Enter zone name"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Description
                                </label>
                                <textarea
                                    value={newZone.description}
                                    onChange={(e) => setNewZone({ ...newZone, description: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-lg"
                                    rows="3"
                                    placeholder="Enter zone description"
                                />
                            </div>
                        </div>

                        {/* Settings */}
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Max Concurrent Routes
                                </label>
                                <input
                                    type="number"
                                    value={newZone.max_concurrent_routes}
                                    onChange={(e) => setNewZone({ ...newZone, max_concurrent_routes: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-lg"
                                    min="1"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Max Distance Per Route (km)
                                </label>
                                <input
                                    type="number"
                                    value={newZone.max_distance_per_route}
                                    onChange={(e) => setNewZone({ ...newZone, max_distance_per_route: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-lg"
                                    min="1"
                                />
                            </div>
                        </div>

                        {/* Districts Selection */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Select Districts
                            </label>
                            <div className="border rounded-lg p-4 max-h-40 overflow-y-auto">
                                {districts.map(district => (
                                    <label key={district.district_id} className="flex items-center p-2 hover:bg-gray-50">
                                        <input
                                            type="checkbox"
                                            checked={selectedDistricts.some(d => d.district_id === district.district_id)}
                                            onChange={() => {
                                                setSelectedDistricts(prev => {
                                                    if (prev.some(d => d.district_id === district.district_id)) {
                                                        return prev.filter(d => d.district_id !== district.district_id);
                                                    }
                                                    return [...prev, district];
                                                });
                                            }}
                                            className="mr-2"
                                        />
                                        <span>{district.name}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Delivery Staff Selection */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Assign Delivery Staff
                            </label>
                            <div className="border rounded-lg p-4 max-h-40 overflow-y-auto">
                                {deliveryStaff.map(staff => (
                                    <label key={staff._id} className="flex items-center p-2 hover:bg-gray-50">
                                        <input
                                            type="checkbox"
                                            checked={selectedStaff.includes(staff._id)}
                                            onChange={() => {
                                                setSelectedStaff(prev => {
                                                    if (prev.includes(staff._id)) {
                                                        return prev.filter(id => id !== staff._id);
                                                    }
                                                    return [...prev, staff._id];
                                                });
                                            }}
                                            className="mr-2"
                                        />
                                        <span>{staff.fullName} ({staff.username})</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end gap-4">
                            <button
                                onClick={() => {
                                    setShowZoneModal(false);
                                    setEditingZone(null);
                                    setNewZone({
                                        name: '',
                                        description: '',
                                        max_concurrent_routes: 5,
                                        max_distance_per_route: 20
                                    });
                                    setSelectedDistricts([]);
                                    setSelectedStaff([]);
                                }}
                                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveZone}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                {editingZone ? 'Save Changes' : 'Create Zone'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delivery Zones Summary */}
            <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-700 mb-3">Delivery Zones</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {deliveryZones.map(zone => (
                        <div key={zone._id} className="bg-white rounded-lg shadow p-4 border border-gray-200">
                            <div className="flex justify-between items-start mb-2">
                                <h4 className="font-medium text-gray-800">{zone.name || 'Unnamed Zone'}</h4>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleEditZone(zone)}
                                        className="p-1 text-blue-600 hover:text-blue-800"
                                        title="Edit Zone"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                    </button>
                                    <button
                                        onClick={() => {
                                            setZoneToDelete(zone);
                                            setShowDeleteConfirm(true);
                                        }}
                                        className="p-1 text-red-600 hover:text-red-800"
                                        title="Delete Zone"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{zone.description}</p>
                            <p className="text-sm text-gray-600">
                                {(zone.districts || []).length} districts, {(zone.delivery_staff || []).length} staff
                            </p>
                            <div className="mt-2 flex items-center">
                                <span className={`w-2 h-2 rounded-full mr-2 ${zone.status === 'active' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                <span className="text-sm text-gray-600">{zone.status || 'unknown'}</span>
                            </div>
                            <div className="mt-2 text-sm text-gray-500">
                                <p>Max Routes: {zone.settings?.max_concurrent_routes || 5}</p>
                                <p>Max Distance: {zone.settings?.max_distance_per_route || 20}km</p>
                            </div>
                            <div className="mt-2">
                                <p className="text-sm font-medium text-gray-700">Districts:</p>
                                <div className="mt-1 text-sm text-gray-600 max-h-20 overflow-y-auto">
                                    {zone.districts?.map((district, idx) => (
                                        <span key={district.district_id} className="inline-block bg-gray-100 rounded px-2 py-1 text-xs mr-1 mb-1">
                                            {district.district_name}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <div className="mt-2">
                                <p className="text-sm font-medium text-gray-700">Staff:</p>
                                <div className="mt-1 text-sm text-gray-600 max-h-20 overflow-y-auto">
                                    {zone.delivery_staff?.map((staff, idx) => (
                                        <span key={staff._id} className="inline-block bg-blue-100 rounded px-2 py-1 text-xs mr-1 mb-1">
                                            {staff.fullName}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h3 className="text-xl font-semibold mb-4">Delete Delivery Zone</h3>
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to delete the delivery zone "{zoneToDelete?.name}"? This action cannot be undone.
                        </p>
                        <div className="flex justify-end gap-4">
                            <button
                                onClick={() => {
                                    setShowDeleteConfirm(false);
                                    setZoneToDelete(null);
                                }}
                                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleDeleteZone(zoneToDelete?._id)}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                            >
                                Delete Zone
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Pending Routes Table */}
            <div className="mt-8">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-gray-700">Pending Routes</h3>
                    <div className="flex gap-4">
                        <button
                            onClick={handleAutoAssign}
                            disabled={selectedRoutes.length === 0}
                            className={`px-4 py-2 rounded-lg text-white ${selectedRoutes.length === 0
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-blue-600 hover:bg-blue-700'
                                }`}
                        >
                            Auto Assign Selected Routes
                        </button>
                    </div>
                </div>

                {renderRouteList()}
            </div>
        </div>
    );
};

export default AutoRouteAssignment; 