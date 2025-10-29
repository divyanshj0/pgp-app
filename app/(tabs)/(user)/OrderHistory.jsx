import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { LinearGradient } from "expo-linear-gradient";
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Alert, RefreshControl, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { Avatar, Chip, Divider, IconButton, Surface, Text } from "react-native-paper";

const API_URL = `${process.env.EXPO_PUBLIC_BACKEND_URL}/api`;

const OrderItemCard = ({ order }) => {
  const [expanded, setExpanded] = useState(false);

  const toggleExpand = () => setExpanded(!expanded);

  return (
    <Surface style={styles.orderCard} elevation={7}>
      <TouchableOpacity 
        activeOpacity={0.85}
        onPress={toggleExpand}
        style={styles.cardPressable}
      >
        <View style={styles.orderHeader}>
          <Avatar.Icon
            size={44}
            icon="invoice-text-outline"
            style={styles.orderIcon}
            color="#fff"
          />
          <View style={styles.orderHeaderContent}>
            <Text style={styles.orderTitle}>Bill No. {order.billno}</Text>
            <Text style={styles.orderDate}>
              {new Date(order.date).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </Text>
          </View>
          <Chip
            style={[
              styles.statusChip,
              order.status ? styles.deliveredChip : styles.bookedChip
            ]}
            icon={order.status ? "check-circle" : "clock"}
            textStyle={styles.statusText}
          >
            {order.status ? "Delivered" : "Booked"}
          </Chip>
          <IconButton
            icon={expanded ? "chevron-up" : "chevron-down"}
            size={22}
            iconColor="#6366f1"
            style={styles.chevron}
          />
        </View>
      </TouchableOpacity>
      {expanded && (
        <>
          <Divider style={styles.divider} />
          <View style={styles.itemsContainer}>
            {order.OrderItems?.length > 0 ? (
              order.OrderItems.map((item, index) => (
                <View style={styles.itemRow} key={index}>
                  <LinearGradient
                    colors={["#e3e0fa", "#f6f8ff"]}
                    style={styles.itemAvatar}
                    start={{ x: 1, y: 0 }}
                    end={{ x: 0, y: 1 }}
                  >
                    <Avatar.Icon
                      size={34}
                      icon="package"
                      style={{ backgroundColor: "transparent" }}
                      color="#8b5cf6"
                    />
                  </LinearGradient>
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemTitle}>{item.category}</Text>
                    <Text style={styles.itemColor}>Color: {item.color}</Text>
                  </View>
                  <Chip style={styles.itemQuantityChip} textStyle={styles.quantityText}>
                    x{item.quantity}
                  </Chip>
                </View>
              ))
            ) : (
              <Text style={styles.noItems}>No items in this order.</Text>
            )}
          </View>
        </>
      )}
    </Surface>
  );
};

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchOrders().finally(() => setRefreshing(false));
  }, []);

  const fetchOrders = async () => {
    const isInitialLoad = orders.length === 0;
    if (isInitialLoad) {
      setLoading(true);
    }
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert('Session Expired. Login again!');
        router.replace('../../login');
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
      console.error("Error fetching orders:", error.response ? error.response.data : error.message);
      Alert.alert("Error", "Failed to fetch orders.");
    } finally {
      if (isInitialLoad) {
        setLoading(false);
      }
    }
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#6366f1" />
        <Text style={styles.loadingText}>Loading Orders...</Text>
      </View>
    );
  }

  return (
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#6366f1"]}
            tintColor={"#6366f1"}
          />
        }
      >
        <LinearGradient
          colors={['#8b5cf6', '#6366f1']}
          style={styles.headerGradient}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
        >
          <Text variant="headlineLarge" style={styles.mainTitle}>
            Order History
          </Text>
          <Text style={styles.subTitle}>Your orders from the last month</Text>
        </LinearGradient>

        {orders.length > 0 ? (
          orders.map((o, idx) => <OrderItemCard key={o.billno} order={o} />)
        ) : (
          <Surface style={styles.emptyCard}>
            <Avatar.Icon
              icon="package-variant-closed"
              size={46}
              style={styles.emptyIcon}
              color="#e0e7ff"
            />
            <Text style={styles.noOrdersText}>No orders found in the last month.</Text>
          </Surface>
        )}
      </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex:1,
    paddingTop:0,
  },
  headerGradient: {
    paddingTop: 28,
    paddingBottom: 20,
    paddingHorizontal: 14,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    elevation: 5,
    shadowColor: "#8b5cf6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.13,
    shadowRadius: 7,
    marginBottom: 12,
    alignItems: "center"
  },
  mainTitle: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 24,
    textAlign: "center",
    letterSpacing: 1,
  },
  subTitle: {
    color: "#ebe9ff",
    fontSize: 14,
    textAlign: "center",
    marginTop: 6,
    letterSpacing: 0.2,
  },
  orderCard: {
    borderRadius: 22,
    marginHorizontal: 14,
    marginBottom: 18,
    backgroundColor: "#fff",
    flexDirection: "column",
    overflow: "hidden",
    shadowColor: "#6366f1",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    borderLeftWidth: 7,
    borderLeftColor: "#8b5cf6",
    transition: "background-color .16s"
  },
  cardPressable: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 14,
  },
  orderHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  orderIcon: {
    backgroundColor: "#8b5cf6",
    borderWidth: 2,
    borderColor: "#fff",
    marginRight: 12,
    elevation: 3,
  },
  orderHeaderContent: {
    flex: 1,
    flexDirection: "column",
    gap: 4,
  },
  orderTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#32385a",
  },
  orderDate: {
    fontSize: 13,
    color: "#6366f1",
    fontWeight: "400",
  },
  statusChip: {
    borderRadius: 12,
    marginRight: 9,
    paddingHorizontal: 9,
  },
  deliveredChip: {
    backgroundColor: "#d1fae5",
  },
  bookedChip: {
    backgroundColor: "#fef3c7",
  },
  statusText: {
    fontSize: 13,
    color:"#6366f1",
    fontWeight: "600",
  },
  chevron: {
    marginVertical: 0,
    marginRight: -6,
    backgroundColor: "transparent"
  },
  divider: {
    marginHorizontal: 18,
    height: 1.2,
    backgroundColor: "#ece2fa",
    borderRadius: 1,
    marginBottom: 6,
    marginTop: -4,
  },
  itemsContainer: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    backgroundColor: "#f6f8ff",
    gap: 8,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#fff",
    borderRadius: 9,
    elevation: 2,
    shadowColor: "#ece2fa",
    marginBottom: 4,
    paddingVertical: 7,
    paddingHorizontal: 10,
  },
  itemAvatar: {
    width: 34,
    height: 34,
    borderRadius: 19,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    backgroundColor: "#ece2fa",
    overflow: "hidden",
  },
  itemInfo: {
    flex: 1,
    flexDirection: "column",
    gap: 2,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#32385a",
  },
  itemColor: {
    fontSize: 12,
    color: "#6366f1",
    fontWeight: "400",
  },
  itemQuantityChip: {
    backgroundColor: "#e0e7ff",
    borderRadius: 12,
    alignSelf: "center",
  },
  quantityText: {
    color: "#4338ca",
    fontSize: 12,
    fontWeight: "600",
  },
  noItems: {
    textAlign: "center",
    color: "#aaa",
    fontStyle: "italic",
    paddingVertical: 8,
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f6f8ff",
  },
  loadingText: {
    marginTop: 12,
    color: "#6366f1",
    fontSize: 15,
    textAlign: "center"
  },
  emptyCard: {
    marginHorizontal: 24,
    marginTop: 32,
    padding: 32,
    borderRadius: 18,
    backgroundColor: "#fff",
    alignItems: "center",
    elevation: 3,
    shadowColor: "#6366f1",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 7,
  },
  emptyIcon: {
    marginBottom: 10,
    backgroundColor: "#e0e7ff",
  },
  noOrdersText: {
    textAlign: "center",
    color: "#888",
    fontSize: 15,
    marginTop: 6,
  },
});

export default OrderHistory;