import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { CartProvider } from '../context/CartContext';

const RootLayout = () => {
  return (
    <CartProvider>
      <SafeAreaProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
           <Stack.Screen name="login" />
           <Stack.Screen name="(tabs)/(user)" />
           <Stack.Screen name="(tabs)/(admin)" />
           <Stack.Screen name="UserDetails/[userId]" />
        </Stack>
      </SafeAreaProvider>
    </CartProvider>
  );
};

export default RootLayout;