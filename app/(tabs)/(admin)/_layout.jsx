// app/(tabs)/(admin)/_layout.jsx
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Tabs } from "expo-router";

export default function AdminTabs() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen
        name="index"
        options={{ title: "Home", tabBarIcon: ({ color }) => <FontAwesome name="home" size={24} color={color} /> }}
      />
      <Tabs.Screen
        name="Profile"
        options={{ title: "Profile", tabBarIcon: ({ color }) => <FontAwesome name="user" size={24} color={color} /> }}
      />
    </Tabs>
  );
}
