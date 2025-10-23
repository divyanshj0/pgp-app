import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, StyleSheet, View } from "react-native";
import { Avatar, Card, Divider, List, Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

const API_URL = `${process.env.EXPO_PUBLIC_BACKEND_URL}/api`;

const OrderItemCard = ({ order }) => {
  const [expanded, setExpanded] = useState(false);

  const toggleExpand = () => setExpanded(!expanded);

  return (
    <Card style={styles.orderCard} mode="elevated">
      <List.Accordion
        expanded={expanded}
        onPress={toggleExpand}
        title={`Bill No. ${order.billno}`}
        description={new Date(order.date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })}
        left={(props) => (
          <Avatar.Icon
            {...props}
            size={44}
            icon="invoice-text-outline"
            style={styles.orderIcon}
            color="#fff"
          />
        )}
        right={(props) => (
          <List.Icon {...props} icon={expanded ? "chevron-up" : "chevron-down"} color="#000" />
        )}
        titleStyle={styles.orderTitle}
        descriptionStyle={styles.orderDescription}
        style={styles.accordion}
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

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert("Error", "Authentication token not found.");
        setLoading(false);
        return;
      }

      const endDate = new Date();
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 1);

      const response = await axios.get(`${API_URL}/orders`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          startDate: startDate.toISOString().split("T")[0],
          endDate: endDate.toISOString().split("T")[0],
        },
      });

      setOrders(response.data);
    } catch (error) {
      console.error("Error fetching orders:", error);
      Alert.alert("Error", "Failed to fetch orders.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#1e88e5" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text variant="headlineMedium" style={styles.mainTitle}>
          Order History
        </Text>
        <Text style={styles.subTitle}>Your orders from the last month</Text>

        {orders.length > 0 ? (
          orders.map((o) => <OrderItemCard key={o.billno} order={o} />)
        ) : (
          <Card style={styles.emptyCard}>
            <Card.Content>
              <Text style={styles.noOrdersText}>No orders found in the last month.</Text>
            </Card.Content>
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f9fbff",
  },
  container: {
    padding: 16,
  },
  mainTitle: {
    fontWeight: "700",
    color: "#1a237e",
    marginBottom: 4,
  },
  subTitle: {
    color: "#546e7a",
    marginBottom: 20,
  },
  orderCard: {
    borderRadius: 18,
    marginBottom: 20,
    overflow: "hidden",
    shadowColor: "#1976d2",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    backgroundColor: "#fff",
    borderLeftWidth: 6,
    borderLeftColor: "#1976d2", // accent bar
  },
  orderIcon: {
    backgroundColor: "#1976d2",
    marginLeft: 10,
    borderWidth: 2,
    borderColor: "#fff",
  },
  accordion: {
    backgroundColor: "#f5f8fd",
    paddingVertical: 12,
    paddingHorizontal: 6,
  },
  orderTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#263238",
  },
  orderDescription: {
    color: "#78909c",
  },
  divider: {
    marginVertical: 8,
    backgroundColor: "#d2e3fc",
    height: 1.5,
    borderRadius: 1,
  },
  itemsContainer: {
    backgroundColor: "#f5f8fd",
    paddingHorizontal: 10,
  },
  itemAvatar: {
    backgroundColor: "#1e88e5",
    marginRight: 10,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#263238",
  },
  itemDescription: {
    fontSize: 13,
    color: "#78909c",
  },
  noItems: {
    textAlign: "center",
    color: "#777",
    fontStyle: "italic",
    paddingVertical: 10,
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "#f9fbff",
  },
  emptyCard: {
    padding: 20,
    borderRadius: 12,
  },
  noOrdersText: {
    textAlign: "center",
    color: "#888",
  },
});

export default OrderHistory;
