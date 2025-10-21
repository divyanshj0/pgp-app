import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, View } from 'react-native';
import { Avatar, Button, Card, Divider, List, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

const API_URL = 'http://10.56.121.186:8080/api';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

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
         // Optionally redirect to login
         router.replace('/');
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
      await AsyncStorage.removeItem('token');
      router.replace('/'); // Redirect to the login/signup screen
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
    <SafeAreaView style={styles.container}>
      <View style={styles.profileHeader}>
        <Avatar.Icon size={80} icon="account-circle" style={styles.avatar} />
        <Text variant="headlineMedium" style={styles.title}>
          {user.username || 'User Profile'}
        </Text>
      </View>

      <Card style={styles.card}>
        <Card.Content>
          <List.Item
            title="Username"
            description={user.username || 'N/A'}
            left={(props) => <List.Icon {...props} icon="account" />}
          />
          <Divider />
          <List.Item
            title="Phone Number"
            description={user.phone || 'N/A'}
            left={(props) => <List.Icon {...props} icon="phone" />}
          />
          {/* Add other relevant details if available in user object */}
        </Card.Content>
      </Card>

      <Button
          mode="contained"
          onPress={handleLogout}
          style={styles.logoutButton}
          icon="logout"
        >
          Logout
        </Button>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1, // Use flex: 1 for SafeAreaView when it's the root
    padding: 20,
    backgroundColor: '#f2f5f9',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    marginBottom: 10,
    backgroundColor: '#0a7ea4',
  },
  title: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
  card: {
    borderRadius: 12,
    marginBottom: 20,
    backgroundColor: '#fff',
    elevation: 3,
  },
  logoutButton: {
    marginTop: 20,
    backgroundColor: '#d9534f', // A red color for logout
  },
  emptyText: {
    fontStyle: 'italic',
    color: '#555',
    textAlign: 'center',
    marginTop: 30,
    marginBottom: 10,
  },
});

export default Profile;