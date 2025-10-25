// app/UserDetails/[userId].jsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Animated, RefreshControl, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Chip, IconButton, Surface, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

const API_URL = `${process.env.EXPO_PUBLIC_BACKEND_URL}/api/admin`;

const UserDetailsScreen = () => {
    const { userId } = useLocalSearchParams();
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [fadeAnim] = useState(new Animated.Value(0));
    const [slideAnim] = useState(new Animated.Value(-50));

    const fetchData = async () => {
        if (!userId) {
            Alert.alert("Error", "User ID not found.");
            router.back();
            return;
        }
        setLoading(true);
        try {
            const token = await AsyncStorage.getItem('token');
            if (!token) throw new Error('Authentication token not found.');
            const headers = { Authorization: `Bearer ${token}` };

            // Fetch User Details
            const userResponse = await axios.get(`${API_URL}/users/${userId}`, { headers });
            setUser(userResponse.data);

            // Fetch User Orders
            const ordersResponse = await axios.get(`${API_URL}/orders?userId=${userId}`, { headers });
            const sortedOrders = ordersResponse.data.sort((a, b) => new Date(b.date) - new Date(a.date));
            setOrders(sortedOrders);

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
            console.error("Fetch User Details Error:", error.response ? error.response.data : error.message);
            Alert.alert('Error', 'Failed to fetch user data.');
            if (error.message === 'Authentication token not found.' || error.response?.status === 401) {
                router.replace('/');
            }
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [userId]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchData();
    }, [userId]);

    if (loading && !refreshing) {
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator animating={true} size="large" color="#6366f1" />
                <Text style={styles.loadingText}>Loading User Details...</Text>
            </View>
        );
    }

    if (!user) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <Stack.Screen options={{ headerShown: false }} />
                <View style={styles.errorContainer}>
                    <IconButton icon="account-off" size={64} iconColor="#d1d5db" />
                    <Text style={styles.errorText}>User not found or could not be loaded.</Text>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Text style={styles.backButtonText}>Go Back</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    // Generate color based on username
    const getAvatarColor = (username) => {
        const colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#ef4444'];
        const index = username?.charCodeAt(0) % colors.length || 0;
        return colors[index];
    };

    const getInitials = (username) => {
        if (!username) return '?';
        return username.substring(0, 2).toUpperCase();
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <Stack.Screen options={{ headerShown: false }} />
            
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
                {/* Header with Gradient and Back Button */}
                <Animated.View style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
                    <LinearGradient
                        colors={['#6366f1', '#8b5cf6', '#a855f7']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.headerGradient}
                    >
                        <View style={styles.headerTop}>
                            <TouchableOpacity onPress={() => router.back()} style={styles.backButtonContainer}>
                                <IconButton icon="arrow-left" iconColor="#fff" size={24} />
                            </TouchableOpacity>
                            <Text variant='titleMedium' style={styles.headerLabel}>User Details</Text>
                            <View style={{ width: 48 }} />
                        </View>
                    </LinearGradient>
                </Animated.View>

                {/* User Profile Card */}
                <Animated.View style={[styles.profileCard, { opacity: fadeAnim }]}>
                    <Surface style={styles.profileSurface} elevation={2}>
                        <View style={styles.profileHeader}>
                            <View style={[styles.avatarContainer, { backgroundColor: getAvatarColor(user.username) }]}>
                                <Text style={styles.avatarText}>{getInitials(user.username)}</Text>
                            </View>
                            <View style={styles.profileInfo}>
                                <Text style={styles.profileName}>{user.username}</Text>
                                <View style={styles.phoneRow}>
                                    <IconButton icon="phone" size={16} iconColor="#6b7280" style={styles.phoneIcon} />
                                    <Text style={styles.phoneText}>{user.phone || 'No phone'}</Text>
                                </View>
                                {user.authority && (
                                    <Chip 
                                        icon={user.authority === 'admin' ? 'shield-crown' : 'account'} 
                                        style={[
                                            styles.authorityChip,
                                            user.authority === 'admin' ? styles.adminChip : styles.userChip
                                        ]}
                                        textStyle={styles.chipText}
                                    >
                                        {user.authority}
                                    </Chip>
                                )}
                            </View>
                        </View>
                    </Surface>
                </Animated.View>

                {/* Orders Section */}
                <Animated.View style={[styles.ordersSection, { opacity: fadeAnim }]}>
                    <View style={styles.sectionHeader}>
                        <Text variant='titleLarge' style={styles.sectionTitle}>Order History</Text>
                        <Chip 
                            icon="invoice-text-outline" 
                            style={styles.orderCountChip}
                            textStyle={styles.orderCountText}
                        >
                            {orders.length}
                        </Chip>
                    </View>

                    {orders.length > 0 ? (
                        orders.map((order, index) => (
                            <OrderItemCard key={order.id || order.billno} order={order} index={index} />
                        ))
                    ) : (
                        <EmptyOrderState />
                    )}
                </Animated.View>
            </ScrollView>
        </SafeAreaView>
    );
};

// Order Item Card Component
const OrderItemCard = ({ order, index }) => {
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
            <TouchableOpacity onPress={() => setExpanded(!expanded)} activeOpacity={0.7}>
                <View style={styles.orderHeader}>
                    <View style={styles.orderHeaderLeft}>
                        <View style={styles.billnoContainer}>
                            <Text style={styles.billnoLabel}>Bill No.</Text>
                            <Text style={styles.billnoValue}>{order.billno}</Text>
                        </View>
                        <View style={styles.orderInfo}>
                            <View style={styles.infoRow}>
                                <IconButton icon="calendar" size={16} iconColor="#6366f1" style={styles.infoIcon} />
                                <Text style={styles.infoText}>
                                    {new Date(order.date).toLocaleDateString()}
                                </Text>
                            </View>
                            <View style={styles.infoRow}>
                                <Chip 
                                    icon={order.status ? 'check-circle' : 'clock-outline'}
                                    style={[styles.statusChip, order.status ? styles.deliveredChip : styles.bookedChip]}
                                    textStyle={styles.statusText}
                                >
                                    {order.status ? 'Delivered' : 'Booked'}
                                </Chip>
                            </View>
                        </View>
                    </View>
                    <IconButton 
                        icon={expanded ? "chevron-up" : "chevron-down"} 
                        size={24} 
                        iconColor="#6b7280" 
                    />
                </View>
            </TouchableOpacity>

            {/* Expanded Details */}
            {expanded && (
                <View style={styles.expandedContent}>
                    <View style={styles.itemsList}>
                        {order.OrderItems?.length > 0 ? (
                            order.OrderItems.map((item, idx) => (
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
                            ))
                        ) : (
                            <Text style={styles.noItems}>No items in this order.</Text>
                        )}
                    </View>
                </View>
            )}
        </Animated.View>
    );
};

// Empty Order State Component
const EmptyOrderState = () => (
    <View style={styles.emptyState}>
        <IconButton icon="package-variant-closed" size={64} iconColor="#d1d5db" />
        <Text variant="titleMedium" style={styles.emptyTitle}>No Orders Yet</Text>
        <Text style={styles.emptyText}>This user hasn't placed any orders</Text>
    </View>
);

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#f9fafb',
    },
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f9fafb',
    },
    loadingText: {
        marginTop: 16,
        color: '#6b7280',
        fontSize: 16,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
    },
    errorText: {
        fontSize: 16,
        color: '#6b7280',
        marginTop: 16,
        textAlign: 'center',
    },
    backButton: {
        marginTop: 24,
        backgroundColor: '#6366f1',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
    },
    backButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },

    // Header Styles
    header: {
        marginBottom: 20,
    },
    headerGradient: {
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        paddingTop: 10,
        paddingBottom: 30,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 8,
    },
    backButtonContainer: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 12,
    },
    headerLabel: {
        color: '#fff',
        fontWeight: '600',
    },

    // Content
    container: {
        paddingBottom: 24,
    },

    // Profile Card
    profileCard: {
        marginHorizontal: 16,
        marginTop: -10,
        marginBottom: 24,
    },
    profileSurface: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
    },
    profileHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    avatarContainer: {
        width: 72,
        height: 72,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        color: '#fff',
        fontSize: 28,
        fontWeight: '700',
    },
    profileInfo: {
        flex: 1,
        gap: 6,
    },
    profileName: {
        fontSize: 20,
        fontWeight: '700',
        color: '#111827',
    },
    phoneRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
    },
    phoneIcon: {
        margin: 0,
    },
    phoneText: {
        fontSize: 14,
        color: '#6b7280',
    },
    authorityChip: {
        alignSelf: 'flex-start',
        height: 24,
        marginTop: 4,
    },
    adminChip: {
        backgroundColor: '#fef3c7',
    },
    userChip: {
        backgroundColor: '#dbeafe',
    },
    chipText: {
        fontSize: 11,
        fontWeight: '600',
    },

    // Orders Section
    ordersSection: {
        paddingHorizontal: 16,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontWeight: '700',
        color: '#111827',
    },
    orderCountChip: {
        backgroundColor: '#e0e7ff',
    },
    orderCountText: {
        color: '#4338ca',
        fontWeight: '600',
    },

    // Order Card
    orderCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        marginBottom: 12,
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
        gap: 6,
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
        fontSize: 13,
    },
    statusChip: {
        height: 32,
    },
    deliveredChip: {
        backgroundColor: '#d1fae5',
    },
    bookedChip: {
        backgroundColor: '#fef3c7',
    },
    statusText: {
        fontSize: 11,
        fontWeight: '600',
    },

    // Expanded Content
    expandedContent: {
        backgroundColor: '#fafafa',
        paddingBottom: 4,
    },
    itemsList: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 8,
    },
    orderItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 12,
        borderRadius: 10,
        gap: 12,
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
    noItems: {
        textAlign: 'center',
        color: '#9ca3af',
        fontStyle: 'italic',
        paddingVertical: 10,
    },

    // Empty State
    emptyState: {
        alignItems: 'center',
        paddingVertical: 60,
        paddingHorizontal: 32,
    },
    emptyTitle: {
        color: '#4b5563',
        fontWeight: '600',
        marginTop: 16,
    },
    emptyText: {
        color: '#9ca3af',
        marginTop: 8,
        textAlign: 'center',
    },
});

export default UserDetailsScreen;
