import { Stack } from 'expo-router';
import { useState } from 'react';

const RootLayout = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Manually manage login state

  return (
    <Stack>
      {isLoggedIn ? (
        <Stack.Screen name="MainTabs" options={{ headerShown: false }} />
      ) : (
        <Stack.Screen name="index" options={{ headerShown: false }} />
      )}
    </Stack>
  );
};

export default RootLayout;