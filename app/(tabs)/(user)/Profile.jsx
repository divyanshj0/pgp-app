// app/(tabs)/(user)/Profile.jsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Animated, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Button, IconButton, Surface, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCart } from '../../../context/CartContext';

const API_URL = `${process.env.EXPO_PUBLIC_BACKEND_URL}/api`;

const Profile = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const { clearCart } = useCart();
    const [fadeAnim] = useState(new Animated.Value(0));
    const [scaleAnim] = useState(new Animated.Value(0.8));

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        setLoading(true);
        try {
            const token = await AsyncStorage.getItem('token');
            if (!token) {
                Alert.alert('Error', 'Authentication token not found.');
                setLoading(false);
                router.replace('../../login');
                return;
            }
            const response = await axios.get(`${API_URL}/profile`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setUser(response.data);

            // Trigger animations
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 800,
                    useNativeDriver: true,
                }),
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    tension: 50,
                    friction: 7,
                    useNativeDriver: true,
                }),
            ]).start();

        } catch (error) {
            console.error("Fetch Profile Error:", error.response ? error.response.data : error.message);
            if (error.response && error.response.status === 401) {
                Alert.alert('Session Expired', 'Please log in again.');
                await handleLogout();
            } else {
                Alert.alert('Error', 'Failed to fetch profile data.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await AsyncStorage.removeItem('token');
                            await AsyncStorage.removeItem('@user_cart');
                            clearCart();
                            router.replace('../../login');
                        } catch (error) {
                            console.error("Logout Error:", error);
                            Alert.alert('Logout Failed', 'An error occurred during logout.');
                        }
                    }
                }
            ]
        );
    };

    if (loading) {
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator animating={true} size="large" color="#6366f1" />
                <Text style={styles.loadingText}>Loading Profile...</Text>
            </View>
        );
    }

    if (!user) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.errorContainer}>
                    <IconButton icon="alert-circle" size={64} iconColor="#ef4444" />
                    <Text style={styles.errorText}>Could not load profile data.</Text>
                    <Button 
                        mode="contained" 
                        onPress={handleLogout}
                        style={styles.retryButton}
                        buttonColor="#6366f1"
                    >
                        Go to Login
                    </Button>
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
        <SafeAreaView style={styles.container}>
            {/* Header with Gradient */}
            <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
                <LinearGradient
                    colors={['#6366f1', '#8b5cf6', '#a855f7']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.headerGradient}
                >
                    <Text variant='headlineSmall' style={styles.headerSubtitle}>My</Text>
                    <Text variant='headlineLarge' style={styles.headerTitle}>Profile</Text>
                </LinearGradient>
            </Animated.View>

            <View style={styles.content}>
                {/* Avatar Section */}
                <Animated.View 
                    style={[
                        styles.avatarSection, 
                        { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }
                    ]}
                >
                    <View style={[styles.avatarContainer, { backgroundColor: getAvatarColor(user.username) }]}>
                        <Text style={styles.avatarText}>{getInitials(user.username)}</Text>
                    </View>
                    <Text style={styles.username}>{user.username}</Text>
                    <View style={styles.verifiedBadge}>
                        <IconButton icon="check-decagram" size={16} iconColor="#10b981" style={styles.badgeIcon} />
                        <Text style={styles.verifiedText}>Verified Account</Text>
                    </View>
                </Animated.View>

                {/* Info Cards */}
                <Animated.View style={[styles.infoSection, { opacity: fadeAnim }]}>
                    {/* Phone Info Card */}
                    <Surface style={styles.infoCard} elevation={1}>
                        <View style={styles.infoIconContainer}>
                            <IconButton icon="phone" iconColor="#6366f1" size={24} />
                        </View>
                        <View style={styles.infoContent}>
                            <Text style={styles.infoLabel}>Phone Number</Text>
                            <Text style={styles.infoValue}>{user.phone || 'Not provided'}</Text>
                        </View>
                    </Surface>

                    {/* Account Type Card */}
                    <Surface style={styles.infoCard} elevation={1}>
                        <View style={styles.infoIconContainer}>
                            <IconButton icon="shield-account" iconColor="#8b5cf6" size={24} />
                        </View>
                        <View style={styles.infoContent}>
                            <Text style={styles.infoLabel}>Account Type</Text>
                            <Text style={styles.infoValue}>
                                {user.authority === 'ADMIN' ? 'Administrator' : 'User'}
                            </Text>
                        </View>
                    </Surface>
                </Animated.View>
                {/* Action Buttons */}
                <Animated.View style={[styles.actionsSection, { opacity: fadeAnim }]}>
                    <TouchableOpacity 
                        style={styles.actionButton}
                        onPress={() => router.push('/OrderHistory')}
                        activeOpacity={0.7}
                    >
                        <IconButton icon="history" iconColor="#6366f1" size={24} />
                        <Text style={styles.actionButtonText}>Order History</Text>
                        <IconButton icon="chevron-right" iconColor="#9ca3af" size={20} />
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={styles.actionButton}
                        onPress={() => router.push('/Cart')}
                        activeOpacity={0.7}
                    >
                        <IconButton icon="cart" iconColor="#8b5cf6" size={24} />
                        <Text style={styles.actionButtonText}>My Cart</Text>
                        <IconButton icon="chevron-right" iconColor="#9ca3af" size={20} />
                    </TouchableOpacity>
                </Animated.View>

                {/* Logout Button */}
                <Animated.View style={{ opacity: fadeAnim }}>
                    <Button
                        icon="logout"
                        mode="contained"
                        style={styles.logoutButton}
                        labelStyle={styles.logoutButtonLabel}
                        buttonColor="#ef4444"
                        onPress={handleLogout}
                    >
                        Logout
                    </Button>
                </Animated.View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
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
        marginBottom: 24,
        textAlign: 'center',
    },
    retryButton: {
        borderRadius: 12,
    },

    // Header Styles
    header: {
        marginBottom: 0,
    },
    headerGradient: {
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        paddingTop: 20,
        paddingBottom: 80,
        paddingHorizontal: 20,
    },
    headerSubtitle: {
        color: '#e0e7ff',
        fontWeight: '400',
    },
    headerTitle: {
        color: '#fff',
        fontWeight: '700',
        marginTop: 4,
    },

    // Content
    content: {
        flex: 1,
        marginTop: -50,
        paddingHorizontal: 16,
    },

    // Avatar Section
    avatarSection: {
        alignItems: 'center',
        marginBottom: 24,
    },
    avatarContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 4,
        borderColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 8,
    },
    avatarText: {
        color: '#fff',
        fontSize: 36,
        fontWeight: '700',
    },
    username: {
        fontSize: 24,
        fontWeight: '700',
        color: '#111827',
        marginTop: 16,
    },
    verifiedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#d1fae5',
        borderRadius: 20,
        paddingRight: 12,
        marginTop: 8,
    },
    badgeIcon: {
        margin: 0,
    },
    verifiedText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#065f46',
    },

    // Info Section
    infoSection: {
        gap: 12,
        marginBottom: 24,
    },
    infoCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    infoIconContainer: {
        backgroundColor: '#f3f4f6',
        borderRadius: 12,
        width: 48,
        height: 48,
        justifyContent: 'center',
        alignItems: 'center',
    },
    infoContent: {
        flex: 1,
    },
    infoLabel: {
        fontSize: 12,
        color: '#6b7280',
        marginBottom: 4,
    },
    infoValue: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
    },

    // Actions Section
    actionsSection: {
        gap: 12,
        marginBottom: 24,
    },
    actionButton: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 12,
        flexDirection: 'row',
        alignItems: 'center',
        elevation: 1,
    },
    actionButtonText: {
        flex: 1,
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
    },

    // Logout Button
    logoutButton: {
        borderRadius: 16,
        paddingVertical: 8,
    },
    logoutButtonLabel: {
        fontSize: 16,
        fontWeight: '600',
    },
});

export default Profile;