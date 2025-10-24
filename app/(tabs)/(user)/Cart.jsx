import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, Divider, IconButton, List, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
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
        Alert.alert('Authentication Error', 'You must be logged in to place an order.');
        setPlacingOrder(false);
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
        <ActivityIndicator size="large" color="#1e88e5" />
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
            colors={["#1e88e5"]} // Android indicator color
            tintColor={"#1e88e5"} // iOS indicator color
          />
        }
      >
        <Text variant="headlineMedium" style={styles.mainTitle}>
          Your Cart 🛒
        </Text>

        {Object.keys(groupedItems).length === 0 ? (
          <Card style={styles.emptyCard}>
            <Card.Content>
              <Text style={styles.noItemsText}>Your cart is empty.</Text>
            </Card.Content>
          </Card>
        ) : (
          Object.entries(groupedItems).map(([category, items]) => (
            <Card key={category} style={styles.categoryCard} mode="elevated">
              <Card.Title title={category} titleStyle={styles.categoryTitle} />
              <Divider style={styles.divider} />
              <Card.Content style={styles.itemsContainer}>
                {items.map((item, index) => (
                  <List.Item
                    key={`${item.category}-${item.colorHex}-${index}`}
                    title={item.colorName}
                    description={`Qty: ${item.quantity}`}
                    titleStyle={styles.itemTitle}
                    descriptionStyle={styles.itemDescription}
                    left={() => (
                      <View style={[styles.colorSwatch, { backgroundColor: item.colorHex }]} />
                    )}
                    right={() => (
                      <View style={styles.itemActions}>
                        <IconButton
                          icon="minus-circle-outline"
                          size={20}
                          onPress={() => handleQuantityChange(item, -1)}
                        />
                        <Text style={styles.quantityText}>{item.quantity}</Text>
                        <IconButton
                          icon="plus-circle-outline"
                          size={20}
                          onPress={() => handleQuantityChange(item, 1)}
                        />
                        <IconButton
                          icon="trash-can-outline"
                          size={20}
                          onPress={() => removeFromCart(item.category, item.colorHex)}
                          iconColor="red"
                        />
                      </View>
                    )}
                  />
                ))}
              </Card.Content>
            </Card>
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f9fbff',
  },
  container: {
    padding: 16,
    paddingBottom: 80,
  },
  mainTitle: {
    fontWeight: '700',
    color: '#1a237e',
    marginBottom: 20,
    textAlign: 'center',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fbff',
  },
  emptyCard: {
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#ffffff',
    marginTop: 20,
    elevation: 2,
  },
  noItemsText: {
    textAlign: 'center',
    color: '#78909c',
    fontSize: 16,
  },
  categoryCard: {
    borderRadius: 18,
    marginBottom: 20,
    backgroundColor: '#ffffff',
    overflow: 'hidden',
    elevation: 3,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#263238',
    marginLeft: 8, 
    paddingTop: 8,
  },
  divider: {
    backgroundColor: '#e0e0e0',
  },
  itemsContainer: {
    paddingTop: 8,
    paddingBottom: 0,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#37474f', // Slightly darker grey
  },
  itemDescription: {
    fontSize: 13,
    color: '#78909c',
  },
  colorSwatch: {
    width: 24,
    height: 24,
    borderRadius: 4,
    marginRight: 15,
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: '#eee',
  },
  itemActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityText: {
    marginHorizontal: 8,
    fontSize: 16,
    fontWeight: '500',
    minWidth: 20,
    textAlign: 'center',
  },
  placeOrderButton: {
    marginTop: 25,
    paddingVertical: 8,
    backgroundColor: '#43a047', // Green
    borderRadius: 12,
    elevation: 4,
  },
  placeOrderButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Cart;