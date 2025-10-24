// app/(tabs)/(admin)/Users.jsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { Avatar, Card, List, Text, Title } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

const API_URL = `${process.env.EXPO_PUBLIC_BACKEND_URL}/api/admin`;

const UsersScreen = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

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
        router.push(`/UserDetails/${userId}`); // Navigate to the details screen
    };

    const renderUserItem = ({ item }) => (
        <Card style={styles.userCard} onPress={() => handleUserPress(item._id)} mode="elevated">
            <List.Item
                title={item.username}
                description={`Phone: ${item.phone || 'N/A'}`} // Assuming phone is available
                left={(props) => <Avatar.Icon {...props} icon="account" size={40} />}
                titleStyle={styles.itemTitle}
            />
        </Card>
    );

    if (loading && !refreshing) {
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator animating={true} size="large" color="#1e88e5" />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <Title style={styles.mainTitle}>All Users</Title>
            <FlatList
                data={users}
                renderItem={renderUserItem}
                keyExtractor={(item) => item._id}
                contentContainerStyle={styles.listContainer}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#1e88e5"]} tintColor="#1e88e5" />
                }
                ListEmptyComponent={<Text style={styles.noUsersText}>No users found.</Text>}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#f9fbff' },
    loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    mainTitle: { fontWeight: '700', color: '#1a237e', padding: 16, textAlign: 'center' },
    listContainer: { paddingHorizontal: 16, paddingBottom: 16 },
    userCard: { marginBottom: 12, backgroundColor: '#fff' },
    itemTitle: { fontWeight: '500' },
    noUsersText: { textAlign: 'center', marginTop: 30, color: '#78909c' },
});

export default UsersScreen;