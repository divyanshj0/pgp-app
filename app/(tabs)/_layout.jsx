import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';

function TabBarIcon(props) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}
export default function TabLayout() {
  return (
    <SafeAreaProvider>
      <Tabs screenOptions={{headerShown:false}}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
          }}
        />
        <Tabs.Screen
          name="Appointments"
          options={{
            title: 'Appointments',
            tabBarIcon: ({ color }) => <TabBarIcon name="calendar" color={color} />,
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
    </SafeAreaProvider>
  );
}