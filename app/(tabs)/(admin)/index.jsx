// app/(tabs)/(admin)/index.jsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, DataTable, Divider, List, Text, Title } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

const API_URL = `${process.env.EXPO_PUBLIC_BACKEND_URL}/api/admin`; // Assuming admin routes are under /api/admin

const AdminDashboard = () => {
    const [stats, setStats] = useState({ userCount: 0, recentOrderCount: 0 });
    const [undeliveredOrders, setUndeliveredOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const token = await AsyncStorage.getItem('token');
            if (!token) {
                Alert.alert('Error', 'Authentication token not found.');
                router.replace('/');
                return;
            }
            const headers = { Authorization: `Bearer ${token}` };

            // Fetch Stats
            const statsResponse = await axios.get(`${API_URL}/stats`, { headers });
            setStats(statsResponse.data);

            // Fetch Undelivered Orders
            const ordersResponse = await axios.get(`${API_URL}/orders/undelivered`, { headers });
            // Sort orders by date, newest first
            const sortedOrders = ordersResponse.data.sort((a, b) => new Date(b.date) - new Date(a.date));
            setUndeliveredOrders(sortedOrders);

        } catch (error) {
            console.error("Fetch Data Error:", error.response ? error.response.data : error.message);
            if (error.response && error.response.status === 401) {
                Alert.alert('Session Expired', 'Please log in again.');
                await handleLogout();
            } else {
                Alert.alert('Error', 'Failed to fetch dashboard data.');
            }
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchData();
    }, []);

     const handleMarkAsDelivered = async (orderId, billno) => {
        Alert.alert(
            "Confirm Delivery",
            `Mark order Bill No. ${billno} as delivered?`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Confirm", onPress: async () => {
                        try {
                            const token = await AsyncStorage.getItem('token');
                            await axios.put(`${API_URL}/orders/${orderId}/deliver`, {}, {
                                headers: { Authorization: `Bearer ${token}` },
                            });
                            Alert.alert('Success', `Order ${billno} marked as delivered.`);
                            // Refresh orders list
                            setUndeliveredOrders(prevOrders => prevOrders.filter(order => order._id !== orderId));
                        } catch (error) {
                            console.error("Mark Delivered Error:", error.response ? error.response.data : error.message);
                            Alert.alert('Error', `Failed to mark order ${billno} as delivered.`);
                        }
                    }
                }
            ]
        );
    };

    const handleLogout = async () => {
        try {
            await AsyncStorage.multiRemove(['token', 'authority', '@user_cart']);
            // If using CartContext, ensure it's cleared if needed, though less relevant for admin.
            router.replace('/');
        } catch (error) {
            console.error("Logout Error:", error);
            Alert.alert('Logout Failed', 'An error occurred during logout.');
        }
    };

    if (loading && !refreshing) {
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator animating={true} size="large" color="#1e88e5" />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView
                contentContainerStyle={styles.container}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#1e88e5"]} tintColor="#1e88e5"/>
                }
            >
                <Title style={styles.mainTitle}>Admin Dashboard</Title>

                <View style={styles.statsContainer}>
                    <Card style={styles.statCard} mode="elevated">
                        <Card.Content>
                            <Text variant="headlineMedium">{stats.userCount}</Text>
                            <Text>Total Users</Text>
                        </Card.Content>
                    </Card>
                    <Card style={styles.statCard} mode="elevated">
                        <Card.Content>
                            <Text variant="headlineMedium">{stats.recentOrderCount}</Text>
                            <Text>Orders (Last Month)</Text>
                        </Card.Content>
                    </Card>
                </View>

                <Divider style={styles.divider} />

                <Title style={styles.subTitle}>Undelivered Orders</Title>
                {undeliveredOrders.length > 0 ? (
                    <DataTable>
                        <DataTable.Header>
                            <DataTable.Title>Bill No.</DataTable.Title>
                            <DataTable.Title>Date</DataTable.Title>
                            <DataTable.Title>User</DataTable.Title>
                            <DataTable.Title>Action</DataTable.Title>
                        </DataTable.Header>

                        {undeliveredOrders.map((order) => (
                             <OrderItemRow key={order._id} order={order} onMarkDelivered={handleMarkAsDelivered} />
                        ))}
                    </DataTable>
                ) : (
                    <Text style={styles.noOrdersText}>No undelivered orders found.</Text>
                )}

            </ScrollView>
        </SafeAreaView>
    );
};

// Separate component for order row with details expansion
const OrderItemRow = ({ order, onMarkDelivered }) => {
    const [expanded, setExpanded] = useState(false);
    const toggleExpand = () => setExpanded(!expanded);

    return (
        <>
            <DataTable.Row onPress={toggleExpand}>
                <DataTable.Cell>{order.billno}</DataTable.Cell>
                <DataTable.Cell>{new Date(order.date).toLocaleDateString()}</DataTable.Cell>
                 {/* Ensure username exists, fallback if needed */}
                <DataTable.Cell>{order.user?.username || 'N/A'}</DataTable.Cell>
                <DataTable.Cell>
                     <Button
                        icon="check-circle"
                        mode="contained-tonal"
                        onPress={() => onMarkDelivered(order._id, order.billno)}
                        compact
                        style={{ paddingHorizontal: 0 }} // Adjust padding if needed
                        labelStyle={{fontSize: 12, marginHorizontal: 2}} // Make text smaller
                    >
                        Deliver
                    </Button>
                </DataTable.Cell>
            </DataTable.Row>
            {expanded && (
                <List.Section style={styles.orderDetailsSection}>
                    <Divider />
                    <List.Subheader>Order Details (Bill No: {order.billno})</List.Subheader>
                    {order.OrderItems?.map((item, index) => (
                        <List.Item
                            key={index}
                            title={`${item.category} - ${item.color}`}
                            description={`Quantity: ${item.quantity}`}
                            left={props => <List.Icon {...props} icon="package-variant" />}
                        />
                    ))}
                    <Divider />
                </List.Section>
            )}
        </>
    );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#f9fbff' },
    container: { padding: 16 },
    loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    mainTitle: { fontWeight: '700', color: '#1a237e', marginBottom: 20, textAlign: 'center' },
    statsContainer: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 20 },
    statCard: { flex: 1, marginHorizontal: 8, alignItems: 'center', backgroundColor: '#fff' },
    divider: { marginVertical: 20, height: 1, backgroundColor: '#e0e0e0' },
    subTitle: { fontWeight: '600', color: '#37474f', marginBottom: 10 },
    noOrdersText: { textAlign: 'center', color: '#78909c', marginTop: 20 },
    orderDetailsSection: { backgroundColor: '#f0f4f7', marginHorizontal: -16 }, // Slight background for details
});

export default AdminDashboard;