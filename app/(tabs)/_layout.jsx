import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';
import { Provider as PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';

function TabBarIcon(props) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}
export default function TabLayout() {
  return (
    <SafeAreaProvider>
      <PaperProvider>
        <Tabs screenOptions={{ headerShown: false }}>
          <Tabs.Screen
            name="index"
            options={{
              title: 'Home',
              tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
            }}
          />
          <Tabs.Screen
            name="OrderHistory"
            options={{
              title: 'Orders',
              tabBarIcon: ({ color }) => <TabBarIcon name="history" color={color} />,
            }}
          />
          <Tabs.Screen
            name="Cart"
            options={{
              title: 'Cart',
              tabBarIcon: ({ color }) => <TabBarIcon name="shopping-cart" color={color} />,
            }}
          />
          <Tabs.Screen
            name="Profile"
            options={{
              title: 'Profile',
              tabBarIcon: ({ color }) => <TabBarIcon name="user" color={color} />,
            }}
          />
        </Tabs>
      </PaperProvider>
    </SafeAreaProvider>
  );
}