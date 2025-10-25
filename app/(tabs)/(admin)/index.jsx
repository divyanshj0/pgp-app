// app/(tabs)/(admin)/index.jsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Animated, RefreshControl, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Button, Chip, Divider, IconButton, Surface, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

const API_URL = `${process.env.EXPO_PUBLIC_BACKEND_URL}/api/admin`;

const AdminDashboard = () => {
    const [stats, setStats] = useState({ userCount: 0, recentOrderCount: 0 });
    const [undeliveredOrders, setUndeliveredOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [fadeAnim] = useState(new Animated.Value(0));
    const [slideAnim] = useState(new Animated.Value(-50));

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
            const sortedOrders = ordersResponse.data.sort((a, b) => new Date(b.date) - new Date(a.date));
            setUndeliveredOrders(sortedOrders);

            // Trigger animations
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 800,
                    useNativeDriver: true,
                }),
                Animated.spring(slideAnim, {
                    toValue: 0,
                    tension: 50,
                    friction: 7,
                    useNativeDriver: true,
                }),
            ]).start();

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
            router.replace('/');
        } catch (error) {
            console.error("Logout Error:", error);
            Alert.alert('Logout Failed', 'An error occurred during logout.');
        }
    };

    if (loading && !refreshing) {
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator animating={true} size="large" color="#6366f1" />
                <Text style={styles.loadingText}>Loading Dashboard...</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView
                contentContainerStyle={styles.container}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={["#6366f1", "#8b5cf6"]}
                        tintColor="#6366f1"
                    />
                }
                showsVerticalScrollIndicator={false}
            >
                {/* Header with Gradient */}
                <Animated.View style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
                    <LinearGradient
                        colors={['#6366f1', '#8b5cf6', '#a855f7']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.headerGradient}
                    >
                        <View style={styles.headerContent}>
                            <View>
                                <Text variant='headlineSmall' style={styles.welcomeText}>Admin Dashboard</Text>
                            </View>
                        </View>
                    </LinearGradient>
                </Animated.View>

                {/* Stats Cards */}
                <Animated.View style={[styles.statsContainer, { opacity: fadeAnim }]}>
                    <StatCard
                        title="Total Users"
                        value={stats.userCount}
                        icon="account-group"
                        gradient={['#3b82f6', '#2563eb']}
                        delay={200}
                    />
                    <StatCard
                        title="Recent Orders"
                        value={stats.recentOrderCount}
                        icon="package-variant"
                        gradient={['#8b5cf6', '#7c3aed']}
                        delay={400}
                    />
                </Animated.View>

                {/* Pending Orders Section */}
                <Animated.View style={{ opacity: fadeAnim }}>
                    <View style={styles.sectionHeader}>
                        <Text variant='titleLarge' style={styles.sectionTitle}>
                            Pending Orders
                        </Text>
                        <Chip
                            icon="clock-outline"
                            style={styles.pendingChip}
                            textStyle={styles.chipText}
                        >
                            {undeliveredOrders.length}
                        </Chip>
                    </View>

                    {undeliveredOrders.length > 0 ? (
                        <Surface style={styles.ordersContainer} elevation={1}>
                            {undeliveredOrders.map((order, index) => (
                                <OrderItemCard
                                    key={order.billno}
                                    order={order}
                                    onMarkDelivered={handleMarkAsDelivered}
                                    index={index}
                                />
                            ))}
                        </Surface>
                    ) : (
                        <EmptyState />
                    )}
                </Animated.View>
            </ScrollView>
        </SafeAreaView>
    );
};

// Animated Stat Card Component
const StatCard = ({ title, value, icon, gradient, delay }) => {
    const [scaleAnim] = useState(new Animated.Value(0.8));
    const [fadeAnim] = useState(new Animated.Value(0));

    useEffect(() => {
        Animated.sequence([
            Animated.delay(delay),
            Animated.parallel([
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    tension: 50,
                    friction: 5,
                    useNativeDriver: true,
                }),
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 500,
                    useNativeDriver: true,
                }),
            ]),
        ]).start();
    }, []);

    return (
        <Animated.View style={[
            styles.statCardWrapper,
            { transform: [{ scale: scaleAnim }], opacity: fadeAnim }
        ]}>
            <LinearGradient
                colors={gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.statCardGradient}
            >
                <View style={styles.statIconContainer}>
                    <IconButton icon={icon} iconColor="#fff" size={32} />
                </View>
                <Text variant="displaySmall" style={styles.statValue}>{value}</Text>
                <Text style={styles.statTitle}>{title}</Text>
            </LinearGradient>
        </Animated.View>
    );
};

// Order Item Card Component - Simplified without dropdown animation
const OrderItemCard = ({ order, onMarkDelivered, index }) => {
    const [expanded, setExpanded] = useState(false);
    const [fadeAnim] = useState(new Animated.Value(0));

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 500,
            delay: index * 100,
            useNativeDriver: true,
        }).start();
    }, []);

    return (
        <Animated.View style={[styles.orderCard, { opacity: fadeAnim }]}>
            <TouchableOpacity
                onPress={() => setExpanded(!expanded)}
                activeOpacity={0.7}
            >
                <View style={styles.orderHeader}>
                    <View style={styles.orderHeaderLeft}>
                        <View style={styles.billnoContainer}>
                            <Text style={styles.billnoLabel}>Bill No.</Text>
                            <Text style={styles.billnoValue}>{order.billno}</Text>
                        </View>
                        <View style={styles.orderInfo}>
                            <View style={styles.infoRow}>
                                <IconButton icon="calendar" size={20} iconColor="#6366f1" style={styles.infoIcon} />
                                <Text style={styles.infoText}>
                                    {new Date(order.date).toLocaleDateString()}
                                </Text>
                            </View>
                            <View style={styles.infoRow}>
                                <IconButton icon="account" size={16} iconColor="#8b5cf6" style={styles.infoIcon} />
                                <Text style={styles.infoText}>{order.User?.username || 'N/A'}</Text>
                            </View>
                        </View>
                    </View>
                    <View style={styles.orderHeaderRight}>
                        <IconButton
                            icon={expanded ? "chevron-up" : "chevron-down"}
                            size={24}
                            iconColor="#6b7280"
                        />
                    </View>
                </View>
            </TouchableOpacity>

            {/* Expanded Details - No animation, instant toggle */}
            {expanded && (
                <View style={styles.expandedContent}>
                    <Divider style={styles.expandDivider} />
                    <View style={styles.itemsList}>
                        {order.OrderItems?.map((item, idx) => (
                            <View key={idx} style={styles.orderItem}>
                                <View style={styles.itemIconContainer}>
                                    <IconButton icon="package-variant" size={20} iconColor="#6366f1" />
                                </View>
                                <View style={styles.itemDetails}>
                                    <Text style={styles.itemCategory}>{item.category}</Text>
                                    <Text style={styles.itemColor}>Color: {item.color}</Text>
                                </View>
                                <Chip style={styles.quantityChip} textStyle={styles.quantityText}>
                                    x{item.quantity}
                                </Chip>
                            </View>
                        ))}
                    </View>
                    <Button
                        icon="check-circle"
                        mode="contained"
                        onPress={() => onMarkDelivered(order._id, order.billno)}
                        style={styles.deliverButton}
                        labelStyle={styles.deliverButtonLabel}
                        buttonColor="#10b981"
                    >
                        Mark as Delivered
                    </Button>
                </View>
            )}
        </Animated.View>
    );
};

// Empty State Component
const EmptyState = () => (
    <View style={styles.emptyState}>
        <IconButton icon="check-all" size={64} iconColor="#d1d5db" />
        <Text variant="titleMedium" style={styles.emptyTitle}>All Caught Up!</Text>
        <Text style={styles.emptyText}>No pending orders at the moment</Text>
    </View>
);

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#f9fafb'
    },
    container: {
        paddingBottom: 24
    },
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f9fafb'
    },
    loadingText: {
        marginTop: 16,
        color: '#6b7280',
        fontSize: 16
    },

    // Header Styles
    header: {
        marginBottom: 20,
    },
    headerGradient: {
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        paddingTop: 20,
        paddingBottom: 30,
        paddingHorizontal: 20,
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    welcomeText: {
        color: '#e0e7ff',
        fontWeight: '400',
    },

    // Stats Section
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        marginBottom: 24,
        gap: 12,
    },
    statCardWrapper: {
        flex: 1,
        borderRadius: 16,
        overflow: 'hidden',
    },
    statCardGradient: {
        padding: 20,
        alignItems: 'center',
        borderRadius: 16,
    },
    statIconContainer: {
        marginBottom: 8,
    },
    statValue: {
        color: '#fff',
        fontWeight: '700',
        marginBottom: 4,
    },
    statTitle: {
        color: '#e0e7ff',
        fontSize: 13,
        fontWeight: '500',
    },

    // Section Header
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        marginBottom: 16,
    },
    sectionTitle: {
        fontWeight: '700',
        color: '#111827',
    },
    pendingChip: {
        backgroundColor: '#fef3c7',
    },
    chipText: {
        color: '#92400e',
        fontWeight: '600',
    },

    // Orders Container
    ordersContainer: {
        marginHorizontal: 16,
        borderRadius: 16,
        backgroundColor: '#fff',
        padding: 8,
    },
    orderCard: {
        marginVertical: 6,
        backgroundColor: '#fafafa',
        borderRadius: 12,
        overflow: 'hidden',
    },
    orderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
    },
    orderHeaderLeft: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    billnoContainer: {
        backgroundColor: '#6366f1',
        borderRadius: 12,
        padding: 12,
        alignItems: 'center',
        minWidth: 60,
    },
    billnoLabel: {
        color: '#e0e7ff',
        fontSize: 10,
        fontWeight: '600',
    },
    billnoValue: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '700',
    },
    orderInfo: {
        gap: 4,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    infoIcon: {
        margin: 0,
    },
    infoText: {
        color: '#4b5563',
        fontSize: 16,
    },
    orderHeaderRight: {
        justifyContent: 'center',
    },

    // Expanded Section - No animation, just show/hide
    expandedContent: {
        backgroundColor: '#fff',
        paddingBottom: 4,
    },
    expandDivider: {
        marginHorizontal: 16,
        marginBottom: 12,
        marginTop: 4,
    },
    itemsList: {
        paddingHorizontal: 16,
        gap: 8,
        marginBottom: 12,
    },
    orderItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f9fafb',
        padding: 12,
        borderRadius: 10,
        gap: 12,
        minHeight: 64,
    },
    itemIconContainer: {
        backgroundColor: '#eef2ff',
        borderRadius: 8,
    },
    itemDetails: {
        flex: 1,
    },
    itemCategory: {
        fontSize: 15,
        fontWeight: '600',
        color: '#111827',
    },
    itemColor: {
        fontSize: 12,
        color: '#6b7280',
        marginTop: 2,
    },
    quantityChip: {
        backgroundColor: '#e0e7ff',
        height: 28,
    },
    quantityText: {
        color: '#4338ca',
        fontSize: 12,
        fontWeight: '600',
    },
    deliverButton: {
        marginHorizontal: 16,
        marginBottom: 16,
        marginTop: 4,
        borderRadius: 10,
    },
    deliverButtonLabel: {
        fontSize: 15,
        fontWeight: '600',
        paddingVertical: 4,
    },

    // Empty State
    emptyState: {
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyTitle: {
        color: '#4b5563',
        fontWeight: '600',
        marginTop: 16,
    },
    emptyText: {
        color: '#9ca3af',
        marginTop: 8,
    },
});

export default AdminDashboard;