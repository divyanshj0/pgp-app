// app/UserDetails/[userId].jsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { Avatar, Card, Divider, List, Text, Title } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

// Re-use OrderItemCard from user's OrderHistory or create a similar one here
const OrderItemCard = ({ order }) => {
  const [expanded, setExpanded] = useState(false);
  const toggleExpand = () => setExpanded(!expanded);

  return (
    <Card style={styles.orderCard} mode="elevated">
      <List.Accordion
        expanded={expanded}
        onPress={toggleExpand}
        title={`Bill No. ${order.billno}`}
        description={`Status: ${order.status || 'Unknown'} | ${new Date(order.date).toLocaleDateString()}`}
        left={(props) => <Avatar.Icon {...props} size={44} icon="receipt" style={styles.orderIcon} color="#fff" />}
        right={(props) => <List.Icon {...props} icon={expanded ? "chevron-up" : "chevron-down"} />}
        titleStyle={styles.orderTitle}
        descriptionStyle={styles.orderDescription}
      >
        <Divider style={styles.divider} />
        <View style={styles.itemsContainer}>
          {order.OrderItems?.length > 0 ? (
            order.OrderItems.map((item, index) => (
              <List.Item
                key={index}
                title={`${item.category} - ${item.color}`}
                description={`Qty: ${item.quantity}`}
                titleStyle={styles.itemTitle}
                descriptionStyle={styles.itemDescription}
              />
            ))
          ) : (
            <Text style={styles.noItems}>No items in this order.</Text>
          )}
        </View>
      </List.Accordion>
    </Card>
  );
};


const API_URL = `${process.env.EXPO_PUBLIC_BACKEND_URL}/api/admin`;

const UserDetailsScreen = () => {
    const { userId } = useLocalSearchParams();
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

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

            // Fetch User Orders (last month)
            // Adjust API call if backend supports date filtering
            const ordersResponse = await axios.get(`${API_URL}/orders?userId=${userId}`, { headers });
             // Sort orders by date, newest first
            const sortedOrders = ordersResponse.data.sort((a, b) => new Date(b.date) - new Date(a.date));
            setOrders(sortedOrders); // Assuming the endpoint returns orders for the user

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
                <ActivityIndicator animating={true} size="large" color="#1e88e5" />
            </View>
        );
    }

    if (!user) {
        return (
             <SafeAreaView style={styles.safeArea}>
                 <Stack.Screen options={{ title: 'User Details' }} />
                <Text style={styles.noUsersText}>User not found or could not be loaded.</Text>
             </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
             {/* Configure Header Title */}
            <Stack.Screen options={{ title: user.username || 'User Details' }} />
            <ScrollView
                contentContainerStyle={styles.container}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#1e88e5"]} tintColor="#1e88e5"/>
                }
            >
                <Card style={styles.userInfoCard} mode="outlined">
                    <Card.Title
                        title={user.username}
                        subtitle={`Phone: ${user.phone || 'N/A'}`}
                        left={(props) => <Avatar.Icon {...props} icon="account-details" size={40} />}
                        titleStyle={{fontSize: 18, fontWeight: 'bold'}}
                    />
                </Card>

                <Title style={styles.subTitle}>Order History (Last Month)</Title>

                {orders.length > 0 ? (
                    orders.map((order) => <OrderItemCard key={order._id || order.billno} order={order} />)
                ) : (
                    <Card style={styles.emptyCard}>
                        <Card.Content>
                            <Text style={styles.noOrdersText}>No orders found for this user in the last month.</Text>
                        </Card.Content>
                    </Card>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#f9fbff' },
    container: { padding: 16 },
    loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    userInfoCard: { marginBottom: 20, backgroundColor: '#fff' },
    subTitle: { fontWeight: '600', color: '#37474f', marginBottom: 15, marginTop: 10 },
    emptyCard: { padding: 15, borderRadius: 12, alignItems: 'center', backgroundColor: '#fff' },
    noOrdersText: { textAlign: 'center', color: '#78909c' },
    noUsersText: { textAlign: 'center', marginTop: 30, color: '#78909c', fontSize: 16 },
     // Styles for OrderItemCard (copied/adapted from OrderHistory)
    orderCard: {
        borderRadius: 12,
        marginBottom: 15,
        overflow: 'hidden',
        backgroundColor: "#fff",
        elevation: 2,
    },
    orderIcon: { backgroundColor: "#1976d2" },
    accordion: {},
    orderTitle: { fontSize: 16, fontWeight: '600' },
    orderDescription: { fontSize: 13, color: '#555' },
    divider: { marginVertical: 4 },
    itemsContainer: { paddingHorizontal: 16, paddingBottom: 8 },
    itemTitle: { fontSize: 14, fontWeight: '500' },
    itemDescription: { fontSize: 12, color: '#666' },
    noItems: { textAlign: 'center', color: '#777', fontStyle: 'italic', paddingVertical: 10 },
});

export default UserDetailsScreen;