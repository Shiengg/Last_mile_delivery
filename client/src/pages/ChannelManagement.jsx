import React, { useState, useEffect } from 'react';
import {
    Box,
    Container,
    Typography,
    Card,
    CardContent,
    Grid,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Chip,
    CircularProgress,
    Divider
} from '@mui/material';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiX, FiCheck, FiHash, FiShoppingBag, FiPackage, FiMapPin, FiPhone, FiCalendar, FiClock, FiDollarSign, FiTruck, FiMessageSquare } from 'react-icons/fi';
import { toast } from 'react-toastify';
import axios from 'axios';
import { getProvincesWithDetail } from 'vietnam-provinces';

// Configure axios
const api = axios.create({
    baseURL: 'http://localhost:5000',
    headers: {
        'Content-Type': 'application/json'
    },
    withCredentials: true
});

// Add request interceptor to include token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Utility functions for location code conversion
const getLocationNames = () => {
    // Lấy dữ liệu từ vietnam-provinces
    const provincesData = getProvincesWithDetail();
    console.log('Provinces Data Structure:', JSON.stringify(provincesData, null, 2));

    return {
        getProvinceName: (provinceCode) => {
            const code = Number(provinceCode);
            // Tìm kiếm trực tiếp trong object
            const province = provincesData[code];
            if (!province) {
                console.log('Không tìm thấy tỉnh/thành phố với mã:', code);
                return provinceCode;
            }
            return province.name;
        },
        getDistrictName: (provinceCode, districtCode) => {
            const pCode = Number(provinceCode);
            const dCode = Number(districtCode);

            const province = provincesData[pCode];
            if (!province) {
                console.log('Không tìm thấy tỉnh/thành phố với mã:', pCode);
                return districtCode;
            }

            const district = province.districts[dCode];
            if (!district) {
                console.log('Không tìm thấy quận/huyện với mã:', dCode, 'trong tỉnh/thành phố:', province.name);
                return districtCode;
            }
            return district.name;
        },
        getWardName: (provinceCode, districtCode, wardCode) => {
            const pCode = Number(provinceCode);
            const dCode = Number(districtCode);
            const wCode = Number(wardCode);

            const province = provincesData[pCode];
            if (!province) {
                console.log('Không tìm thấy tỉnh/thành phố với mã:', pCode);
                return wardCode;
            }

            const district = province.districts[dCode];
            if (!district) {
                console.log('Không tìm thấy quận/huyện với mã:', dCode, 'trong tỉnh/thành phố:', province.name);
                return wardCode;
            }

            const ward = district.wards[wCode];
            if (!ward) {
                console.log('Không tìm thấy phường/xã với mã:', wCode, 'trong quận/huyện:', district.name);
                return wardCode;
            }
            return ward.name;
        }
    };
};

const ChannelManagement = () => {
    const [channels, setChannels] = useState([
        { id: 'ecommerce', name: 'E-commerce', status: 'active', orders: 0 },
        { id: 'warehouse', name: 'Warehouse', status: 'active', orders: 0 },
        { id: 'social-media', name: 'Social Media', status: 'active', orders: 0, platform: 'messenger' }
    ]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedChannel, setSelectedChannel] = useState(null);
    const [orders, setOrders] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState('all');
    const [channelFilter, setChannelFilter] = useState('all');
    const entriesPerPage = 10;

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        status: 'active'
    });

    const [selectedOrder, setSelectedOrder] = useState(null);
    const [orderItems, setOrderItems] = useState([]);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const locationNames = getLocationNames();

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const response = await api.get('/api/orders', {
                params: {
                    limit: 1000
                }
            });

            if (response.data.success) {
                setOrders(response.data.data);

                // Update channel statistics
                const ordersByChannel = response.data.data.reduce((acc, order) => {
                    acc[order.channel] = (acc[order.channel] || 0) + 1;
                    return acc;
                }, {});

                setChannels(prevChannels =>
                    prevChannels.map(channel => ({
                        ...channel,
                        orders: ordersByChannel[channel.id] || 0
                    }))
                );
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
            setError('Error fetching orders');
            toast.error('Failed to load orders');
        } finally {
            setLoading(false);
        }
    };

    const filteredOrders = orders.filter(order => {
        const matchesSearch = order.order_id.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
        const matchesChannel = channelFilter === 'all' || order.channel === channelFilter;
        return matchesSearch && matchesStatus && matchesChannel;
    });

    const indexOfLastEntry = currentPage * entriesPerPage;
    const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
    const currentEntries = filteredOrders.slice(indexOfFirstEntry, indexOfLastEntry);
    const totalPages = Math.ceil(filteredOrders.length / entriesPerPage);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const handleOpenDialog = (channel = null) => {
        if (channel) {
            setSelectedChannel(channel);
            setFormData({
                name: channel.name,
                description: channel.description || '',
                status: channel.status
            });
        } else {
            setSelectedChannel(null);
            setFormData({
                name: '',
                description: '',
                status: 'active'
            });
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedChannel(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Handle channel creation/update logic here
        handleCloseDialog();
    };

    const getChannelStats = () => {
        return {
            total: orders.length,
            active: orders.filter(order => order.status === 'active').length,
            inactive: orders.filter(order => order.status === 'inactive').length
        };
    };

    const handleViewOrderDetails = async (order) => {
        try {
            setLoadingDetails(true);
            setSelectedOrder(order);

            // Fetch order items
            const token = localStorage.getItem('token');
            const response = await api.get(`/api/orders/${order._id}/items`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (response.data.success) {
                setOrderItems(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching order details:', error);
            toast.error('Failed to load order details');
        } finally {
            setLoadingDetails(false);
        }
    };

    const handleCloseDetails = () => {
        setSelectedOrder(null);
        setOrderItems([]);
    };

    const handleCreateRoute = async (order) => {
        try {
            console.log('Creating route for order:', {
                order_id: order.order_id,
                channel: order.channel,
                source: order.source,
                shop_id: order.shop_id,
                destination: order.destination
            });

            // Get province data for address lookup
            const provinces = getProvincesWithDetail();

            // Get source and destination address details
            const sourceProvince = provinces[order.source.address.province_id];
            const sourceDistrict = sourceProvince?.districts[order.source.address.district_id];
            const sourceWard = sourceDistrict?.wards[order.source.address.ward_code];

            if (!sourceProvince || !sourceDistrict || !sourceWard) {
                throw new Error('Invalid source address data');
            }

            const destProvince = provinces[order.destination.address.province_id];
            const destDistrict = destProvince?.districts[order.destination.address.district_id];
            const destWard = destDistrict?.wards[order.destination.address.ward_code];

            if (!destProvince || !destDistrict || !destWard) {
                throw new Error('Invalid destination address data');
            }

            // Generate a unique shop_id using timestamp
            const timestamp = Date.now().toString().slice(-6);
            const uniqueShopId = `${order.destination.address.ward_code}${timestamp}`;

            // Create customer address data
            const customerAddressData = {
                shop_id: uniqueShopId,
                shop_name: order.destination.receiver_name,
                province_id: order.destination.address.province_id,
                district_id: order.destination.address.district_id,
                ward_code: order.destination.address.ward_code,
                house_number: order.destination.address.house_number,
                street: order.destination.address.street,
                full_address: `${order.destination.address.house_number} ${order.destination.address.street}, ${destWard.name}, ${destDistrict.name}, ${destProvince.name}`,
            };

            console.log('Customer address data:', customerAddressData);

            // Try to find existing customer address first
            let customerAddress;
            try {
                const findResponse = await api.get('/api/customer-addresses/find', {
                    params: {
                        province_id: order.destination.address.province_id,
                        district_id: order.destination.address.district_id,
                        ward_code: order.destination.address.ward_code,
                        house_number: order.destination.address.house_number,
                        street: order.destination.address.street
                    }
                });
                customerAddress = findResponse.data.data;
                console.log('Found existing customer address:', customerAddress);
            } catch (error) {
                console.log('No existing customer address found, creating new one');
            }

            // If no existing address found, create new one
            if (!customerAddress) {
                const createResponse = await api.post('/api/customer-addresses', customerAddressData);
                if (!createResponse.data.success) {
                    throw new Error('Failed to create customer address');
                }
                customerAddress = createResponse.data.data;
                console.log('Created new customer address:', customerAddress);
            }

            // Validate source shop_id
            const sourceShopId = order.source.type === 'shop' ? order.shop_id : order.source.location_id;
            console.log('Source shop ID validation:', {
                type: order.source.type,
                shop_id: order.shop_id,
                location_id: order.source.location_id,
                final_source_id: sourceShopId
            });

            if (!sourceShopId) {
                throw new Error('Source shop ID is missing');
            }

            // Create route with the customer address
            const routeData = {
                channel: order.channel,
                order_id: order.order_id,
                source: {
                    type: order.source.type,
                    location_id: order.source.type === 'shop' ? order.shop_id : order.source.location_id,
                    address: {
                        province_id: order.source.address.province_id,
                        district_id: order.source.address.district_id,
                        ward_code: order.source.address.ward_code,
                        street: order.source.address.street,
                        house_number: order.source.address.house_number
                    }
                },
                destination: {
                    receiver_name: order.destination.receiver_name,
                    receiver_phone: order.destination.receiver_phone,
                    address: {
                        province_id: order.destination.address.province_id,
                        district_id: order.destination.address.district_id,
                        ward_code: order.destination.address.ward_code,
                        street: order.destination.address.street,
                        house_number: order.destination.address.house_number
                    }
                },
                shops: [
                    {
                        shop_id: sourceShopId,
                        order: 1,
                        status: 'pending'
                    },
                    {
                        shop_id: customerAddress.shop_id,
                        order: 2,
                        status: 'pending'
                    }
                ],
                vehicle_type_id: 'MOTOBIKE', // Default vehicle type
                status: 'pending'
            };

            // Log route data before sending
            console.log('Sending route data:', JSON.stringify(routeData, null, 2));

            try {
                const routeResponse = await api.post('/api/routes', routeData);
                console.log('Route response:', routeResponse);

                if (routeResponse.data.success) {
                    toast.success('Route created successfully');
                    handleCloseDetails(); // Close the order details modal
                    fetchOrders(); // Refresh the orders list
                } else {
                    throw new Error(routeResponse.data.message || 'Failed to create route');
                }
            } catch (error) {
                // Log detailed error information
                console.error('Route creation error details:', {
                    message: error.message,
                    response: error.response?.data,
                    status: error.response?.status,
                    statusText: error.response?.statusText,
                    data: error.response?.data
                });
                throw error;
            }
        } catch (error) {
            console.error('Error creating route:', error);
            // Show more detailed error message to user
            const errorMessage = error.response?.data?.message || error.message;
            toast.error(`Failed to create route: ${errorMessage}`);
        }
    };

    if (loading) {
        return (
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                <CircularProgress />
            </Container>
        );
    }

    return (
        <div className="p-4 md:p-6 max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="mb-6">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Channel Management</h2>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Stats Section */}
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <div className="flex items-center">
                                <span className="w-2 h-2 rounded-full bg-green-500 mr-1.5"></span>
                                <span className="text-sm text-gray-600">
                                    Active: <span className="font-semibold text-green-600">{getChannelStats().active}</span>
                                </span>
                            </div>
                            <div className="w-px h-4 bg-gray-300"></div>
                            <div className="flex items-center">
                                <span className="w-2 h-2 rounded-full bg-red-500 mr-1.5"></span>
                                <span className="text-sm text-gray-600">
                                    Inactive: <span className="font-semibold text-red-600">{getChannelStats().inactive}</span>
                                </span>
                            </div>
                            <div className="w-px h-4 bg-gray-300"></div>
                            <div className="flex items-center">
                                <span className="text-sm text-gray-600">
                                    Total: <span className="font-semibold text-gray-900">{getChannelStats().total}</span>
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Filter and Search Section */}
                    <div className="flex flex-col sm:flex-row gap-4">
                        {/* Channel Filter */}
                        <div className="flex items-center gap-2">
                            <label className="text-sm text-gray-600">Channel:</label>
                            <div className="inline-flex rounded-lg shadow-sm">
                                <button
                                    type="button"
                                    onClick={() => setChannelFilter('all')}
                                    className={`px-4 py-2 text-sm font-medium rounded-l-lg border 
                                        ${channelFilter === 'all'
                                            ? 'bg-indigo-50 text-indigo-600 border-indigo-600'
                                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                        } transition-colors duration-200`}
                                >
                                    All
                                </button>
                                {channels.map((channel) => (
                                    <button
                                        key={channel.id}
                                        type="button"
                                        onClick={() => setChannelFilter(channel.id)}
                                        className={`px-4 py-2 text-sm font-medium border-y 
                                            ${channelFilter === channel.id
                                                ? 'bg-indigo-50 text-indigo-600 border-indigo-600'
                                                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                            } transition-colors duration-200 ${channel.id === channels[channels.length - 1].id ? 'rounded-r-lg' : ''
                                            }`}
                                    >
                                        {channel.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Status Filter */}
                        <div className="flex items-center gap-2">
                            <label className="text-sm text-gray-600">Status:</label>
                            <div className="inline-flex rounded-lg shadow-sm">
                                <button
                                    type="button"
                                    onClick={() => setStatusFilter('all')}
                                    className={`px-4 py-2 text-sm font-medium rounded-l-lg border 
                                        ${statusFilter === 'all'
                                            ? 'bg-blue-50 text-blue-600 border-blue-600'
                                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                        } transition-colors duration-200`}
                                >
                                    All
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setStatusFilter('active')}
                                    className={`px-4 py-2 text-sm font-medium border-y 
                                        ${statusFilter === 'active'
                                            ? 'bg-green-50 text-green-600 border-green-600'
                                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                        } transition-colors duration-200`}
                                >
                                    Active
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setStatusFilter('inactive')}
                                    className={`px-4 py-2 text-sm font-medium rounded-r-lg border 
                                        ${statusFilter === 'inactive'
                                            ? 'bg-red-50 text-red-600 border-red-600'
                                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                        } transition-colors duration-200`}
                                >
                                    Inactive
                                </button>
                            </div>
                        </div>

                        {/* Search Bar */}
                        <div className="relative flex-1">
                            <input
                                type="text"
                                placeholder="Search orders..."
                                className="w-full sm:max-w-xs pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Channel Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 mt-6">
                {channels.map((channel) => (
                    <div
                        key={channel.id}
                        className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 hover:shadow-xl transition-shadow duration-300"
                    >
                        <div className="px-6 py-5">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center">
                                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center 
                                        ${channel.id === 'ecommerce' ? 'bg-purple-100' :
                                            channel.id === 'warehouse' ? 'bg-blue-100' : 'bg-pink-100'}`}
                                    >
                                        {channel.id === 'social-media' ? (
                                            <FiMessageSquare className="w-6 h-6 text-pink-600" />
                                        ) : (
                                            <FiShoppingBag className={`w-6 h-6 
                                                ${channel.id === 'ecommerce' ? 'text-purple-600' :
                                                    channel.id === 'warehouse' ? 'text-blue-600' : 'text-pink-600'}`}
                                            />
                                        )}
                                    </div>
                                    <div className="ml-4">
                                        <h3 className="text-lg font-semibold text-gray-900">{channel.name}</h3>
                                        <p className="text-sm text-gray-500">
                                            {channel.id === 'social-media' ? 'Platform: Messenger' : `Channel ID: ${channel.id}`}
                                        </p>
                                    </div>
                                </div>
                                <Chip
                                    label={channel.status}
                                    color={channel.status === 'active' ? 'success' : 'error'}
                                    size="small"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4 mt-4">
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <p className="text-sm text-gray-500">Total Orders</p>
                                    <p className="text-2xl font-bold text-gray-900">{channel.orders}</p>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <p className="text-sm text-gray-500">Active Orders</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {orders.filter(order => order.channel === channel.id && order.status === 'active').length}
                                    </p>
                                </div>
                            </div>
                            <div className="mt-4">
                                <div className="h-2 bg-gray-200 rounded-full">
                                    <div
                                        className={`h-2 rounded-full ${channel.id === 'ecommerce' ? 'bg-purple-500' :
                                            channel.id === 'warehouse' ? 'bg-blue-500' : 'bg-pink-500'
                                            }`}
                                        style={{
                                            width: `${(channel.orders / Math.max(...channels.map(c => c.orders))) * 100}%`
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead>
                            <tr className="bg-gradient-to-r from-gray-50 to-gray-100">
                                <th scope="col" className="px-6 py-4 text-left">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Order ID</span>
                                    </div>
                                </th>
                                <th scope="col" className="px-6 py-4 text-left">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Channel</span>
                                    </div>
                                </th>
                                <th scope="col" className="px-6 py-4 text-left">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</span>
                                    </div>
                                </th>
                                <th scope="col" className="px-6 py-4 text-left">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Total Price</span>
                                    </div>
                                </th>
                                <th scope="col" className="px-6 py-4 text-left">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Created At</span>
                                    </div>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                            {currentEntries.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-16 text-center">
                                        <div className="flex flex-col items-center">
                                            <div className="rounded-full bg-gray-100 p-3 mb-4">
                                                <FiSearch className="w-6 h-6 text-gray-400" />
                                            </div>
                                            <p className="text-lg font-medium text-gray-600 mb-1">No orders found</p>
                                            <p className="text-sm text-gray-400">Try adjusting your search criteria</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                currentEntries.map((order) => (
                                    <tr key={order._id}
                                        className="hover:bg-gray-50 cursor-pointer transition-colors duration-150"
                                        onClick={() => handleViewOrderDetails(order)}
                                    >
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-medium text-gray-900">{order.order_id}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Chip
                                                label={order.channel}
                                                color="primary"
                                                size="small"
                                            />
                                        </td>
                                        <td className="px-6 py-4">
                                            <Chip
                                                label={order.status}
                                                color={
                                                    order.status === 'delivered' ? 'success' :
                                                        order.status === 'pending' ? 'warning' :
                                                            order.status === 'cancelled' ? 'error' : 'default'
                                                }
                                                size="small"
                                            />
                                        </td>
                                        <td className="px-6 py-4">
                                            ${order.total_price.toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4">
                                            {new Date(order.createdAt).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="bg-white px-6 py-4 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                        <p className="text-sm text-gray-600">
                            Showing <span className="font-medium">{indexOfFirstEntry + 1}</span> to{' '}
                            <span className="font-medium">
                                {Math.min(indexOfLastEntry, filteredOrders.length)}
                            </span> of{' '}
                            <span className="font-medium">{filteredOrders.length}</span> entries
                        </p>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                            >
                                Previous
                            </button>

                            {[...Array(totalPages)].map((_, index) => (
                                <button
                                    key={index + 1}
                                    onClick={() => handlePageChange(index + 1)}
                                    className={`px-4 py-2 text-sm font-medium rounded-md
                                        ${currentPage === index + 1
                                            ? 'bg-blue-600 text-white'
                                            : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                                        }`}
                                >
                                    {index + 1}
                                </button>
                            ))}

                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Order Details Modal */}
            <Dialog
                open={Boolean(selectedOrder)}
                onClose={handleCloseDetails}
                maxWidth="md"
                fullWidth
            >
                {selectedOrder && (
                    <>
                        <DialogTitle className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <FiPackage className="text-blue-600" />
                                <span>Order Details - {selectedOrder.order_id}</span>
                            </div>
                            <IconButton onClick={handleCloseDetails} size="small">
                                <FiX />
                            </IconButton>
                        </DialogTitle>
                        <DialogContent>
                            {loadingDetails ? (
                                <div className="flex justify-center items-center py-8">
                                    <CircularProgress />
                                </div>
                            ) : (
                                <div className="py-4">
                                    {/* Order Status and Channel */}
                                    <div className="flex justify-between items-center mb-6">
                                        <Chip
                                            label={selectedOrder.channel}
                                            color="primary"
                                            size="small"
                                            icon={<FiShoppingBag className="ml-2" />}
                                        />
                                        <Chip
                                            label={selectedOrder.status}
                                            color={
                                                selectedOrder.status === 'delivered' ? 'success' :
                                                    selectedOrder.status === 'pending' ? 'warning' :
                                                        selectedOrder.status === 'cancelled' ? 'error' : 'default'
                                            }
                                            size="small"
                                        />
                                    </div>

                                    {/* Order Information Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Source Information */}
                                        <div className="bg-gray-50 rounded-lg p-4">
                                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                                <FiMapPin className="text-blue-600" />
                                                Source Information
                                            </h3>
                                            <div className="space-y-2">
                                                <p><span className="font-medium">Type:</span> {selectedOrder.source.type}</p>
                                                <p><span className="font-medium">Location ID:</span> {selectedOrder.source.location_id}</p>
                                                <p><span className="font-medium">Address:</span></p>
                                                <div className="pl-4">
                                                    <p>Tỉnh/Thành phố: {locationNames.getProvinceName(selectedOrder.source.address.province_id)}</p>
                                                    <p>Quận/Huyện: {locationNames.getDistrictName(
                                                        selectedOrder.source.address.province_id,
                                                        selectedOrder.source.address.district_id
                                                    )}</p>
                                                    <p>Phường/Xã: {locationNames.getWardName(
                                                        selectedOrder.source.address.province_id,
                                                        selectedOrder.source.address.district_id,
                                                        selectedOrder.source.address.ward_code
                                                    )}</p>
                                                    <p>Đường: {selectedOrder.source.address.street}</p>
                                                    <p>Số nhà: {selectedOrder.source.address.house_number}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Destination Information */}
                                        <div className="bg-gray-50 rounded-lg p-4">
                                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                                <FiMapPin className="text-green-600" />
                                                Destination Information
                                            </h3>
                                            <div className="space-y-2">
                                                <p className="flex items-center gap-2">
                                                    <span className="font-medium">Receiver:</span>
                                                    {selectedOrder.destination.receiver_name}
                                                </p>
                                                <p className="flex items-center gap-2">
                                                    <FiPhone className="text-gray-500" />
                                                    {selectedOrder.destination.receiver_phone}
                                                </p>
                                                <p><span className="font-medium">Address:</span></p>
                                                <div className="pl-4">
                                                    <p>Tỉnh/Thành phố: {locationNames.getProvinceName(selectedOrder.destination.address.province_id)}</p>
                                                    <p>Quận/Huyện: {locationNames.getDistrictName(
                                                        selectedOrder.destination.address.province_id,
                                                        selectedOrder.destination.address.district_id
                                                    )}</p>
                                                    <p>Phường/Xã: {locationNames.getWardName(
                                                        selectedOrder.destination.address.province_id,
                                                        selectedOrder.destination.address.district_id,
                                                        selectedOrder.destination.address.ward_code
                                                    )}</p>
                                                    <p>Đường: {selectedOrder.destination.address.street}</p>
                                                    <p>Số nhà: {selectedOrder.destination.address.house_number}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Delivery Information */}
                                    <div className="mt-6 bg-gray-50 rounded-lg p-4">
                                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                            <FiTruck className="text-indigo-600" />
                                            Delivery Information
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div>
                                                <p className="text-sm text-gray-500">Estimated Delivery</p>
                                                <p className="font-medium flex items-center gap-1">
                                                    <FiCalendar className="text-gray-400" />
                                                    {new Date(selectedOrder.estimated_delivery_time.$date).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500">Created At</p>
                                                <p className="font-medium flex items-center gap-1">
                                                    <FiClock className="text-gray-400" />
                                                    {new Date(selectedOrder.createdAt.$date).toLocaleString()}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500">Delivery Fee</p>
                                                <p className="font-medium flex items-center gap-1">
                                                    <FiDollarSign className="text-gray-400" />
                                                    ${selectedOrder.delivery_fee.toFixed(2)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Order Items */}
                                    <div className="mt-6">
                                        <h3 className="text-lg font-semibold mb-4">Order Items</h3>
                                        <TableContainer component={Paper} variant="outlined">
                                            <Table size="small">
                                                <TableHead>
                                                    <TableRow>
                                                        <TableCell>Product</TableCell>
                                                        <TableCell>SKU</TableCell>
                                                        <TableCell align="right">Quantity</TableCell>
                                                        <TableCell align="right">Price</TableCell>
                                                        <TableCell align="right">Total</TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {orderItems.map((item, index) => (
                                                        <TableRow key={index}>
                                                            <TableCell>{item.product_name}</TableCell>
                                                            <TableCell>{item.product_sku}</TableCell>
                                                            <TableCell align="right">{item.quantity}</TableCell>
                                                            <TableCell align="right">${item.price.toFixed(2)}</TableCell>
                                                            <TableCell align="right">
                                                                ${(item.quantity * item.price).toFixed(2)}
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                    <TableRow>
                                                        <TableCell colSpan={3} />
                                                        <TableCell align="right">
                                                            <strong>Subtotal:</strong>
                                                        </TableCell>
                                                        <TableCell align="right">
                                                            <strong>${selectedOrder.total_price.toFixed(2)}</strong>
                                                        </TableCell>
                                                    </TableRow>
                                                    <TableRow>
                                                        <TableCell colSpan={3} />
                                                        <TableCell align="right">Delivery Fee:</TableCell>
                                                        <TableCell align="right">
                                                            ${selectedOrder.delivery_fee.toFixed(2)}
                                                        </TableCell>
                                                    </TableRow>
                                                    <TableRow>
                                                        <TableCell colSpan={3} />
                                                        <TableCell align="right">
                                                            <strong>Total:</strong>
                                                        </TableCell>
                                                        <TableCell align="right">
                                                            <strong>
                                                                ${(selectedOrder.total_price + selectedOrder.delivery_fee).toFixed(2)}
                                                            </strong>
                                                        </TableCell>
                                                    </TableRow>
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                    </div>

                                    {/* Notes */}
                                    {selectedOrder.notes && (
                                        <div className="mt-6">
                                            <h3 className="text-lg font-semibold mb-2">Notes</h3>
                                            <p className="text-gray-600 bg-gray-50 p-3 rounded">
                                                {selectedOrder.notes}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={handleCloseDetails}>Close</Button>
                            {selectedOrder && selectedOrder.status === 'pending' && (
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={() => handleCreateRoute(selectedOrder)}
                                    startIcon={<FiTruck />}
                                >
                                    Create Route
                                </Button>
                            )}
                        </DialogActions>
                    </>
                )}
            </Dialog>
        </div>
    );
};

export default ChannelManagement; 