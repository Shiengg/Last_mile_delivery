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
    CircularProgress
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import axios from 'axios';

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

const ChannelManagement = () => {
    const theme = useTheme();
    const [channels, setChannels] = useState([
        { id: 'ecommerce', name: 'E-commerce', status: 'active', orders: 0 },
        { id: 'warehouse', name: 'Warehouse', status: 'active', orders: 0 },
        { id: 'shop_direct', name: 'Shop Direct', status: 'active', orders: 0 }
    ]);
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedChannel, setSelectedChannel] = useState(null);
    const [loading, setLoading] = useState(true);
    const [orders, setOrders] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        status: 'active'
    });

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const response = await api.get('/api/orders', {
                params: {
                    limit: 1000 // Get all orders for statistics
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
        } finally {
            setLoading(false);
        }
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

    const handleSubmit = () => {
        // Handle channel creation/update logic here
        handleCloseDialog();
    };

    if (loading) {
        return (
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                <CircularProgress />
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4" component="h1">
                    Channel Management
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenDialog()}
                >
                    Add Channel
                </Button>
            </Box>

            <Grid container spacing={3}>
                {/* Channel Statistics */}
                <Grid item xs={12}>
                    <Grid container spacing={3}>
                        {channels.map((channel) => (
                            <Grid item xs={12} sm={6} md={4} key={channel.id}>
                                <Card>
                                    <CardContent>
                                        <Typography variant="h6" component="div">
                                            {channel.name}
                                        </Typography>
                                        <Typography color="textSecondary">
                                            Orders: {channel.orders}
                                        </Typography>
                                        <Box mt={1}>
                                            <Chip
                                                label={channel.status}
                                                color={channel.status === 'active' ? 'success' : 'error'}
                                                size="small"
                                            />
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Grid>

                {/* Recent Orders List */}
                <Grid item xs={12}>
                    <Typography variant="h6" sx={{ mb: 2 }}>Recent Orders</Typography>
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Order ID</TableCell>
                                    <TableCell>Channel</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell>Total Price</TableCell>
                                    <TableCell>Created At</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {orders.slice(0, 10).map((order) => (
                                    <TableRow key={order._id}>
                                        <TableCell>{order.order_id}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={order.channel}
                                                color="primary"
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={order.status}
                                                color={order.status === 'delivered' ? 'success' :
                                                    order.status === 'pending' ? 'warning' :
                                                        order.status === 'cancelled' ? 'error' : 'default'}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell>${order.total_price.toFixed(2)}</TableCell>
                                        <TableCell>
                                            {new Date(order.createdAt).toLocaleDateString()}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Grid>
            </Grid>

            {/* Add/Edit Channel Dialog */}
            <Dialog open={openDialog} onClose={handleCloseDialog}>
                <DialogTitle>
                    {selectedChannel ? 'Edit Channel' : 'Add New Channel'}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 2 }}>
                        <TextField
                            fullWidth
                            label="Channel Name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            margin="normal"
                        />
                        <TextField
                            fullWidth
                            label="Description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            margin="normal"
                            multiline
                            rows={3}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancel</Button>
                    <Button onClick={handleSubmit} variant="contained">
                        {selectedChannel ? 'Update' : 'Create'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default ChannelManagement; 