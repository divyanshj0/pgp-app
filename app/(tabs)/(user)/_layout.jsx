// app/(tabs)/(user)/_layout.jsx
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Tabs } from "expo-router";

export default function UserTabs() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen
        name="Home"
        options={{ title: "Home", tabBarIcon: ({ color }) => <FontAwesome name="home" size={24} color={color} /> }}
      />
      <Tabs.Screen
        name="OrderHistory"
        options={{ title: "Orders", tabBarIcon: ({ color }) => <FontAwesome name="history" size={24} color={color} /> }}
      />
      <Tabs.Screen
        name="Cart"
        options={{ title: "Cart", tabBarIcon: ({ color }) => <FontAwesome name="shopping-cart" size={24} color={color} /> }}
      />
      <Tabs.Screen
        name="Profile"
        options={{ title: "Profile", tabBarIcon: ({ color }) => <FontAwesome name="user" size={24} color={color} /> }}
      />
    </Tabs>
  );
}
