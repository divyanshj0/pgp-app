import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { BlurView } from 'expo-blur';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, View } from 'react-native';
import { Avatar, Button, List, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCart } from '../../../context/CartContext';
const API_URL = `${process.env.EXPO_PUBLIC_BACKEND_URL}/api`;

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const {clearCart}=useCart();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Error', 'Authentication token not found.');
        setLoading(false);
        router.replace('../../login');
        return;
      }
      const response = await axios.get(`${API_URL}/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(response.data);
    } catch (error) {
      console.error("Fetch Profile Error:", error.response ? error.response.data : error.message);
      if (error.response && error.response.status === 401) {
        Alert.alert('Session Expired', 'Please log in again.');
        await handleLogout(); // Log out if token is invalid
      } else {
        Alert.alert('Error', 'Failed to fetch profile data.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('authority');
      await AsyncStorage.removeItem('@user_cart');
      clearCart();
      router.push('../../login');
    } catch (error) {
      console.error("Logout Error:", error);
      Alert.alert('Logout Failed', 'An error occurred during logout.');
    }
  };
  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator animating={true} size="large" color="#0a7ea4" />
      </View>
    );
  }

  if (!user) {
    // Handle case where user data couldn't be fetched but not loading anymore
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.emptyText}>Could not load profile data.</Text>
        <Button mode="contained" onPress={handleLogout}>Logout</Button>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.gradientBackground}>
      <View style={styles.avatarWrap}>
        <Avatar.Icon size={80} icon="account-circle" style={styles.avatarShadow} />
        <Text style={styles.username}>{user.username}</Text>
        <Text style={styles.statusBadge}>Verified</Text>
      </View>

      {/* Glass Card with Blur Effect */}
      <BlurView intensity={90} style={styles.glassCard}>
        <List.Section>
          <List.Item title="Phone" description={user.phone} titleStyle={styles.itemTitle} descriptionStyle={styles.itemDescription} left={props => <List.Icon {...props} icon="phone" color='black'/>}/>
        </List.Section>
      </BlurView>

      <Button
        icon="logout"
        mode="contained"
        style={styles.logoutButton}
        labelStyle={{ fontWeight: "bold" }}
        onPress={handleLogout}
      >
        Logout
      </Button>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  gradientBackground: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    backgroundColor: "linear-gradient(180deg, #e3f0ff 0%, #f6fafd 100%)"
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f2f5f9',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarWrap: {
    alignItems: "center",
    marginTop: 32,
    marginBottom: 20,
  },
  avatarShadow: {
    backgroundColor: "#1976d2",
    elevation: 12,
    borderWidth: 4,
    borderColor: "#ffffffaa",
    shadowColor: "#1976d2",
    shadowOpacity: 0.5,
    shadowOffset: { width: 0, height: 2 },
  },
  username: {
    color: "#263238",
    fontWeight: "700",
    fontSize: 22,
    marginVertical: 6,
    textAlign: "center",
  },
  statusBadge: {
    backgroundColor: "#43a047",
    color: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    fontWeight: "600",
    marginBottom: 12,
    fontSize: 13,
    alignSelf: "center",
    overflow: "hidden"
  },
  glassCard: {
    width: "94%",
    borderRadius: 18,
    padding: 4,
    marginVertical: 10,
    backgroundColor: "#f5f8fd",
    color:"#000",
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 7,
    elevation: 8,
    overflow: "hidden"
  },
  itemTitle:{
    color:'#000',
  },
  itemDescription:{
    color:'#000',
  },
  logoutButton: {
    marginTop: 30,
    backgroundColor: "#e53935",
    borderRadius: 12,
    shadowColor: "#e53935",
    shadowOpacity: 0.2,
    elevation: 4,
    width: "94%",
    alignSelf: "center"
  }
});


export default Profile;