import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { CartProvider } from '../context/CartContext';

const RootLayout = () => {
  return (
    <CartProvider>
      <SafeAreaProvider>
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)/(user)" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)/(admin)" options={{ headerShown: false }} />
        </Stack>
      </SafeAreaProvider>
    </CartProvider>
  );
};

export default RootLayout;