// app/(tabs)/_layout.jsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";

export default function TabsLayout() {
  const [authority, setAuthority] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem("authority").then((role) => {
      setAuthority(role);
      setLoading(false);
    });
  }, []);

  if (loading)
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );

  if (authority === "ADMIN") return <Redirect href="/(tabs)/(admin)/Profile" />;
  if (authority === "USER") return <Redirect href="/(tabs)/(user)/" />;

  return <Redirect href="/login" />;
}