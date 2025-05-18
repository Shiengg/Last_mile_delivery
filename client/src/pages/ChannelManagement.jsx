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
    Chip
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

const ChannelManagement = () => {
    const theme = useTheme();
    const [channels, setChannels] = useState([
        { id: 'web', name: 'Web Channel', status: 'active', orders: 150 },
        { id: 'mobile', name: 'Mobile App', status: 'active', orders: 89 },
        { id: 'physical', name: 'Physical Store', status: 'active', orders: 45 }
    ]);
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedChannel, setSelectedChannel] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        status: 'active'
    });

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

                {/* Channel List */}
                <Grid item xs={12}>
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Channel Name</TableCell>
                                    <TableCell>Description</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell>Orders</TableCell>
                                    <TableCell align="right">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {channels.map((channel) => (
                                    <TableRow key={channel.id}>
                                        <TableCell>{channel.name}</TableCell>
                                        <TableCell>{channel.description || '-'}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={channel.status}
                                                color={channel.status === 'active' ? 'success' : 'error'}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell>{channel.orders}</TableCell>
                                        <TableCell align="right">
                                            <IconButton
                                                size="small"
                                                onClick={() => handleOpenDialog(channel)}
                                            >
                                                <EditIcon />
                                            </IconButton>
                                            <IconButton size="small" color="error">
                                                <DeleteIcon />
                                            </IconButton>
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