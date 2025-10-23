import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState } from 'react';

const CartContext = createContext();

const CART_STORAGE_KEY = '@user_cart';

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);

    // Load cart items from AsyncStorage on initial load
    useEffect(() => {
        const loadCart = async () => {
            try {
                const storedCart = await AsyncStorage.getItem(CART_STORAGE_KEY);
                if (storedCart !== null) {
                    setCartItems(JSON.parse(storedCart));
                }
            } catch (e) {
                console.error('Failed to load cart.', e);
            } finally {
                setLoading(false);
            }
        };
        loadCart();
    }, []);

    // Save cart items to AsyncStorage whenever they change
    useEffect(() => {
        const saveCart = async () => {
            if (!loading) { // Avoid saving initial empty state before loading
                try {
                    await AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
                } catch (e) {
                    console.error('Failed to save cart.', e);
                }
            }
        };
        saveCart();
    }, [cartItems, loading]);

    const addToCart = (item) => {
        setCartItems(prevItems => {
            // Check if item (same category and color) already exists
            const existingItemIndex = prevItems.findIndex(
                cartItem => cartItem.category === item.category && cartItem.colorHex === item.colorHex
            );

            if (existingItemIndex > -1) {
                // Update quantity
                const updatedItems = [...prevItems];
                updatedItems[existingItemIndex].quantity = item.quantity;
                return updatedItems;
            } else {
                // Add new item
                return [...prevItems, item];
            }
        });
    };
    const removeFromCart = (category, colorHex) => {
        setCartItems(prevItems =>
            prevItems.filter(item => !(item.category === category && item.colorHex === colorHex))
        );
    };

    const updateItemQuantity = (category, colorHex, newQuantity) => {
        const quantityNum = parseInt(newQuantity, 10);
        if (isNaN(quantityNum) || quantityNum <= 0) {
            // If new quantity is invalid or zero, remove the item
            removeFromCart(category, colorHex);
            return;
        }

        setCartItems(prevItems =>
            prevItems.map(item =>
                item.category === category && item.colorHex === colorHex
                    ? { ...item, quantity: quantityNum }
                    : item
            )
        );
    };

    const clearCart = () => {
        setCartItems([]);
    };


    return (
        <CartContext.Provider value={{ cartItems, addToCart, clearCart, removeFromCart, updateItemQuantity, loading }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);