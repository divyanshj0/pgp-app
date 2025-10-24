// app/(tabs)/(admin)/_layout.jsx
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Tabs } from "expo-router";
import { Provider as PaperProvider } from 'react-native-paper';

export default function AdminTabs() {
  return (
    <PaperProvider>
      <Tabs screenOptions={{ headerShown: false }}>
        <Tabs.Screen
          name="index"
          options={{ title: "Home", tabBarIcon: ({ color }) => <FontAwesome name="home" size={24} color={color} /> }}
        />
        <Tabs.Screen
          name="Users"
          options={{ title: "Users", tabBarIcon: ({ color }) => <FontAwesome name="users" size={24} color={color} /> }}
        />
        <Tabs.Screen
          name="Profile"
          options={{ title: "Profile", tabBarIcon: ({ color }) => <FontAwesome name="user" size={24} color={color} /> }}
        />
      </Tabs>
    </PaperProvider>
  );
}