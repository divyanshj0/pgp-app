import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, View } from 'react-native';
import { Avatar, Card, List, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

// Replace with your backend IP
const API_URL = 'http://10.56.121.186:8080/api';

const OrderItemCard = ({ order }) => (
  <Card style={styles.orderCard}>
    <Card.Title
      title={`Order #${order.billno}`}
      subtitle={`Date: ${new Date(order.date).toLocaleDateString()}`}
      titleStyle={styles.itemTitle}
      left={(props) => (
        <Avatar.Icon
          {...props}
          icon="receipt" // Use a relevant icon
          style={{ backgroundColor: '#42a5f5' }}
        />
      )}
    />
    <Card.Content>
      <Text variant="titleMedium">Items:</Text>
      {order.OrderItems && order.OrderItems.length > 0 ? (
        order.OrderItems.map((item, index) => (
          <List.Item
            key={item.id || index} // Use item.id if available, otherwise index
            title={`${item.category} - ${item.color}`}
            description={`Quantity: ${item.quantity}`}
            left={(props) => <List.Icon {...props} icon="package-variant" />} // Icon for items
          />
        ))
      ) : (
        <Text>No items in this order.</Text>
      )}
    </Card.Content>
  </Card>
);

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Error', 'Authentication token not found.');
        setLoading(false);
        return;
      }

      // Calculate start date (1 month ago)
      const endDate = new Date();
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 1);

      // Format dates as YYYY-MM-DD for the query parameters
      const startDateString = startDate.toISOString().split('T')[0];
      const endDateString = endDate.toISOString().split('T')[0];


      const response = await axios.get(`${API_URL}/orders`, {
        headers: { Authorization: `Bearer ${token}` },
         params: {
           startDate: startDateString,
           endDate: endDateString,
         },
      });
      // Backend already sorts by date descending
      setOrders(response.data);
    } catch (error) {
      console.error("Fetch Orders Error:", error.response ? error.response.data : error.message);
      Alert.alert('Error', 'Failed to fetch order history.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#0a7ea4" />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text variant="headlineMedium" style={styles.sectionTitle}>
          Order History (Last Month)
        </Text>
        {orders.length > 0 ? (
          orders.map((item) => (
            <OrderItemCard key={item.billno} order={item} /> // Use billno as key
          ))
        ) : (
          <Text style={styles.emptyText}>No orders found in the last month.</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f2f5f9',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginVertical: 12,
    textAlign: 'center',
    color:'black',
  },
  orderCard: {
    borderRadius: 12,
    marginBottom: 16,
    backgroundColor: '#fff',
    elevation: 2,
  },
  itemTitle: {
    fontWeight: '600',
    fontSize: 16,
  },
  emptyText: {
    fontStyle: 'italic',
    color: '#777',
    marginTop: 20,
    textAlign: 'center',
  },
});

export default OrderHistory;