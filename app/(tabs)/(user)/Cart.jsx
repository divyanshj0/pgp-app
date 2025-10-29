import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { LinearGradient } from "expo-linear-gradient";
import { router } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Chip, Divider, IconButton, Surface, Text } from 'react-native-paper';
import { useCart } from '../../../context/CartContext';
const API_URL = `${process.env.EXPO_PUBLIC_BACKEND_URL}/api`;

const Cart = () => {
  const { cartItems, clearCart, loading: cartLoading, removeFromCart, updateItemQuantity } = useCart();
  const [placingOrder, setPlacingOrder] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 500);
  }, []);

  const handlePlaceOrder = async () => {
    if (cartItems.length === 0) {
      Alert.alert('Empty Cart', 'Your cart is empty. Add items to place an order.');
      return;
    }

    setPlacingOrder(true);
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Session Expired login Again!');
        router.replace('../../login');
        return;
      }

      const orderItems = cartItems.map(item => ({
        category: item.category,
        color: item.color,
        quantity: item.quantity,
      }));

      const response = await axios.post(`${API_URL}/orders`, { items: orderItems }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 201) {
        Alert.alert('Order Placed', `Your order (Bill No. ${response.data.billno}) has been placed successfully!`);
        clearCart();
      } else {
        throw new Error('Failed to place order');
      }
    } catch (error) {
      console.error('Error placing order:', error.response ? error.response.data : error.message);
      Alert.alert('Order Error', error.response?.data?.error || 'Failed to place order. Please try again.');
    } finally {
      setPlacingOrder(false);
    }
  };

  const handleQuantityChange = (item, change) => {
    const newQuantity = item.quantity + change;
    if (newQuantity >= 1) {
      updateItemQuantity(item.category, item.colorHex, newQuantity);
    } else {
      removeFromCart(item.category, item.colorHex);
    }
  };

  const groupedItems = cartItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {});

  if (cartLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
        <Text style={styles.loadingText}>Loading Cart...</Text>
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
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text variant="headlineLarge" style={styles.mainTitle}>
          Your Cart 🛒
        </Text>
        <Text style={styles.subTitle}>Review and update your selections</Text>
      </LinearGradient>

      {Object.keys(groupedItems).length === 0 ? (
        <Surface style={styles.emptyCard}>
          <IconButton
            icon="cart-off"
            size={46}
            style={styles.emptyIcon}
            color="#e0e7ff"
          />
          <Text style={styles.noItemsText}>Your cart is empty.</Text>
        </Surface>
      ) : (
        Object.entries(groupedItems).map(([category, items]) => (
          <Surface key={category} style={styles.categoryCard} elevation={3}>
            <View style={styles.categoryHeader}>
              <Text style={styles.categoryTitle}>{category}</Text>
              <Chip style={styles.chip} textStyle={styles.chipText}>{items.length} Shades</Chip>
            </View>
            <Divider style={styles.divider} />
            <View style={styles.itemsContainer}>
              {items.map((item, index) => (
                <View style={styles.itemRow} key={`${item.category}-${item.colorHex}-${index}`}>
                  <View style={styles.itemInfo}>
                    <View style={[styles.colorSwatch, { backgroundColor: item.colorHex }]} />
                    <Text style={styles.itemTitle}>{item.colorName}</Text>
                    <Text style={styles.itemDescription}>Qty: {item.quantity}</Text>
                  </View>
                  <View style={styles.itemActions}>
                    <IconButton
                      icon="minus-circle-outline"
                      size={22}
                      onPress={() => handleQuantityChange(item, -1)}
                      style={styles.iconBtn}
                    />
                    <Text style={styles.quantityText}>{item.quantity}</Text>
                    <IconButton
                      icon="plus-circle-outline"
                      size={22}
                      onPress={() => handleQuantityChange(item, 1)}
                      style={styles.iconBtn}
                    />
                    <IconButton
                      icon="trash-can-outline"
                      size={22}
                      onPress={() => removeFromCart(item.category, item.colorHex)}
                      iconColor="#ef4444"
                      style={styles.iconBtn}
                    />
                  </View>
                </View>
              ))}
            </View>
          </Surface>
        ))
      )}

      {Object.keys(groupedItems).length > 0 && (
        <Button
          mode="contained"
          onPress={handlePlaceOrder}
          style={styles.placeOrderButton}
          labelStyle={styles.placeOrderButtonText}
          loading={placingOrder}
          disabled={placingOrder || refreshing}
          icon="cart-check"
        >
          Place Order
        </Button>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fbff',
  },
  headerGradient: {
    paddingTop: 28,
    paddingBottom: 18,
    paddingHorizontal: 12,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    elevation: 5,
    shadowColor: "#8b5cf6",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    marginBottom: 12,
    alignItems: "center"
  },
  mainTitle: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 23,
    textAlign: "center",
    letterSpacing: 1,
  },
  subTitle: {
    color: "#ebe9ff",
    fontSize: 14,
    textAlign: "center",
    marginTop: 7,
    letterSpacing: 0.2,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fbff',
  },
  loadingText: {
    marginTop: 10,
    color: "#6366f1",
    fontSize: 15,
    textAlign: "center"
  },
  emptyCard: {
    paddingVertical: 38,
    paddingHorizontal: 18,
    borderRadius: 18,
    alignItems: 'center',
    backgroundColor: '#fff',
    marginTop: 36,
    elevation: 3,
    shadowColor: "#6366f1",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.14,
    shadowRadius: 10,
  },
  emptyIcon: {
    marginBottom: 12,
    backgroundColor: "#e0e7ff",
  },
  noItemsText: {
    textAlign: 'center',
    color: '#78909c',
    fontSize: 16,
  },
  categoryCard: {
    borderRadius: 18,
    marginHorizontal: 14,
    marginBottom: 18,
    backgroundColor: '#fff',
    flexDirection: "column",
    overflow: 'hidden',
    elevation: 3,
    shadowColor: "#6366f1",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.075,
    shadowRadius: 7,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 6,
    backgroundColor: "#faf7ff"
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#32385a',
  },
  chip: {
    backgroundColor: "#e0e7ff",
    alignSelf: "flex-end"
  },
  chipText: {
    color: "#4338ca",
    fontWeight: "600"
  },
  divider: {
    backgroundColor: '#e0e0e0',
    marginHorizontal: 14,
    marginVertical: 7,
  },
  itemsContainer: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 7,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    marginBottom: 9,
    elevation: 2,
    shadowColor: "#e0e7ff",
    paddingVertical: 8,
    paddingHorizontal: 10,
    gap: 10,
  },
  colorSwatch: {
    width: 38,
    height: 38,
    borderRadius: 11,
    marginRight: 10,
    alignSelf: 'center',
    borderWidth: 1.5,
    borderColor: '#dee1e8',
    shadowColor: "#ebe9ff",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.19,
    shadowRadius: 5,
  },
  itemInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems:'center',
    gap: 2,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#28294d',
  },
  itemDescription: {
    fontSize: 13,
    color: '#78909c',
  },
  itemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2
  },
  iconBtn: {
    marginHorizontal: 2,
    marginVertical: -6,
    backgroundColor: "transparent"
  },
  quantityText: {
    marginHorizontal: 7,
    fontSize: 19,
    fontWeight: '700',
    minWidth: 22,
    color: "#6366f1",
    textAlign: 'center',
  },
  placeOrderButton: {
    marginTop: 24,
    marginHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "#10b981",
    borderRadius: 16,
    elevation: 5,
    shadowColor: "#10b981",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.10,
    shadowRadius: 6,
  },
  placeOrderButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: "#fff",
    letterSpacing: 0.3,
  },
});

export default Cart;