import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView,StyleSheet, View,} from 'react-native';
import { Avatar,Card,Divider,List, Text,} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
// Replace with your local IP
const API_URL = 'http://192.168.0.100:5000/api';

const AppointmentItem = ({ appointment, isUpcoming }) => (
  <Card style={[styles.appointmentCard, isUpcoming && styles.upcomingCard]}>
    <Card.Title
      title={appointment.reason}
      titleStyle={styles.itemTitle}
      left={(props) => (
        <Avatar.Icon
          {...props}
          icon={isUpcoming ? 'calendar-clock' : 'history'}
          style={{ backgroundColor: isUpcoming ? '#42a5f5' : '#9e9e9e' }}
        />
      )}
    />
    <Card.Content>
      <List.Item
        title={`Date: ${new Date(appointment.date).toDateString()}`}
        left={(props) => <List.Icon {...props} icon="calendar" />}
      />
      <Divider />
      <List.Item
        title={`Time: ${appointment.timeSlot}`}
        left={(props) => <List.Icon {...props} icon="clock-outline" />}
      />
      <Divider />
      <List.Item
        title={`Patient: ${appointment.patientName}`}
        left={(props) => <List.Icon {...props} icon="account" />}
      />
    </Card.Content>
  </Card>
);

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.get(`${API_URL}/appointments`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAppointments(response.data);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to fetch appointments.');
    } finally {
      setLoading(false);
    }
  };

  const now = new Date();
  const upcomingAppointments = appointments.filter(
    (app) => new Date(app.date) >= now
  );
  const pastAppointments = appointments.filter(
    (app) => new Date(app.date) < now
  );

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#0a7ea4" />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text variant="headlineMedium" style={styles.sectionTitle}>
          Upcoming Appointments
        </Text>
        {upcomingAppointments.length > 0 ? (
          upcomingAppointments.map((item) => (
            <AppointmentItem
              key={item._id}
              appointment={item}
              isUpcoming={true}
            />
          ))
        ) : (
          <Text style={styles.emptyText}>No upcoming appointments.</Text>
        )}

        <Text variant="headlineMedium" style={styles.sectionTitle}>
          Past Appointments
        </Text>
        {pastAppointments.length > 0 ? (
          pastAppointments.map((item) => (
            <AppointmentItem
              key={item._id}
              appointment={item}
              isUpcoming={false}
            />
          ))
        ) : (
          <Text style={styles.emptyText}>No past appointments.</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f2f5f9',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginVertical: 12,
  },
  appointmentCard: {
    borderRadius: 12,
    marginBottom: 16,
    backgroundColor: '#fff',
    elevation: 2,
  },
  upcomingCard: {
    borderLeftWidth: 5,
    borderLeftColor: '#42a5f5',
  },
  itemTitle: {
    fontWeight: '600',
    fontSize: 16,
  },
  emptyText: {
    fontStyle: 'italic',
    color: '#777',
    marginBottom: 20,
    textAlign: 'center',
  },
});

export default Appointments;
