// app/(tabs)/(admin)/Users.jsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Animated, FlatList, RefreshControl, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Chip, IconButton, Surface, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

const API_URL = `${process.env.EXPO_PUBLIC_BACKEND_URL}/api/admin`;

const UsersScreen = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [fadeAnim] = useState(new Animated.Value(0));
    const [slideAnim] = useState(new Animated.Value(-50));

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const token = await AsyncStorage.getItem('token');
            if (!token) {
                Alert.alert('Error', 'Authentication token not found.');
                router.replace('/');
                return;
            }
            const headers = { Authorization: `Bearer ${token}` };

            const response = await axios.get(`${API_URL}/users`, { headers });
            setUsers(response.data);

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
            console.error("Fetch Users Error:", error.response ? error.response.data : error.message);
            Alert.alert('Error', 'Failed to fetch users.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchUsers();
    }, []);

    const handleUserPress = (userId) => {
        router.push(`/UserDetails/${userId}`);
    };

    const renderUserItem = ({ item, index }) => (
        <UserCard user={item} index={index} onPress={() => handleUserPress(item.id)} />
    );

    if (loading && !refreshing) {
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator animating={true} size="large" color="#6366f1" />
                <Text style={styles.loadingText}>Loading Users...</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
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
                            <Text variant='headlineSmall' style={styles.headerSubtitle}>Manage Users</Text>
                        </View>
                        <View style={styles.userCountBadge}>
                            <IconButton icon="account-group" iconColor="#6366f1" size={24} />
                            <Text style={styles.userCountText}>{users.length}</Text>
                        </View>
                    </View>
                </LinearGradient>
            </Animated.View>

            <Animated.View style={[styles.contentContainer, { opacity: fadeAnim }]}>
                <FlatList
                    data={users}
                    renderItem={renderUserItem}
                    keyExtractor={(item) => item.id?.toString()}
                    contentContainerStyle={styles.listContainer}
                    refreshControl={
                        <RefreshControl 
                            refreshing={refreshing} 
                            onRefresh={onRefresh} 
                            colors={["#6366f1", "#8b5cf6"]} 
                            tintColor="#6366f1" 
                        />
                    }
                    ListEmptyComponent={<EmptyState />}
                    showsVerticalScrollIndicator={false}
                />
            </Animated.View>
        </SafeAreaView>
    );
};

// User Card Component with Animation
const UserCard = ({ user, index, onPress }) => {
    const [fadeAnim] = useState(new Animated.Value(0));
    const [scaleAnim] = useState(new Animated.Value(0.9));

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 500,
                delay: index * 80,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                tension: 50,
                friction: 7,
                delay: index * 80,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

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
        <Animated.View 
            style={[
                styles.userCardWrapper, 
                { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }
            ]}
        >
            <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
                <Surface style={styles.userCard} elevation={1}>
                    <View style={styles.userCardContent}>
                        {/* Avatar */}
                        <View style={[styles.avatarContainer, { backgroundColor: getAvatarColor(user.username) }]}>
                            <Text style={styles.avatarText}>{getInitials(user.username)}</Text>
                        </View>

                        {/* User Info */}
                        <View style={styles.userInfo}>
                            <Text style={styles.username}>{user.username || 'Unknown'}</Text>
                            <View style={styles.userMeta}>
                                <IconButton icon="phone" size={14} iconColor="#6b7280" style={styles.metaIcon} />
                                <Text style={styles.phone}>{user.phone || 'No phone'}</Text>
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

                        {/* Arrow Icon */}
                        <IconButton 
                            icon="chevron-right" 
                            size={24} 
                            iconColor="#9ca3af" 
                            style={styles.arrowIcon}
                        />
                    </View>
                </Surface>
            </TouchableOpacity>
        </Animated.View>
    );
};

// Empty State Component
const EmptyState = () => (
    <View style={styles.emptyState}>
        <IconButton icon="account-off" size={64} iconColor="#d1d5db" />
        <Text variant="titleMedium" style={styles.emptyTitle}>No Users Found</Text>
        <Text style={styles.emptyText}>Users will appear here once they register</Text>
    </View>
);

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#f9fafb'
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
    headerSubtitle: {
        color: '#e0e7ff',
        fontWeight: '400',
    },
    userCountBadge: {
        backgroundColor: '#fff',
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        paddingRight: 16,
        paddingLeft: 4,
    },
    userCountText: {
        fontSize: 20,
        fontWeight: '700',
        color: '#6366f1',
    },

    // Content Container
    contentContainer: {
        flex: 1,
    },
    listContainer: {
        paddingHorizontal: 16,
        paddingBottom: 16,
    },

    // User Card Styles
    userCardWrapper: {
        marginBottom: 12,
    },
    userCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        overflow: 'hidden',
    },
    userCardContent: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        gap: 12,
    },
    avatarContainer: {
        width: 56,
        height: 56,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        color: '#fff',
        fontSize: 20,
        fontWeight: '700',
    },
    userInfo: {
        flex: 1,
        gap: 4,
    },
    username: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
    },
    userMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
    },
    metaIcon: {
        margin: 0,
    },
    phone: {
        fontSize: 13,
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
    arrowIcon: {
        margin: 0,
    },

    // Empty State
    emptyState: {
        alignItems: 'center',
        paddingVertical: 80,
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

export default UsersScreen;