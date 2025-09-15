import axios from 'axios';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, ScrollView, StyleSheet, Text, View } from 'react-native';

// Replace YOUR_LOCAL_IP with your actual local IP address
const API_URL = 'http://192.168.0.100:5000/api';

const AppointmentItem = ({ appointment }) => (
  <View style={styles.appointmentItem}>
    <Text style={styles.itemTitle}>{appointment.reason}</Text>
    <Text>Date: {new Date(appointment.date).toDateString()}</Text>
    <Text>Time: {appointment.timeSlot}</Text>
    <Text>Patient: {appointment.patientName}</Text>
  </View>
);

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await axios.get(`${API_URL}/appointments`);
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
    <ScrollView style={styles.container}>
      <Text style={styles.sectionTitle}>Upcoming Appointments</Text>
      {upcomingAppointments.length > 0 ? (
        <FlatList
          data={upcomingAppointments}
          keyExtractor={(item) => item._id.toString()}
          renderItem={({ item }) => <AppointmentItem appointment={item} />}
        />
      ) : (
        <Text style={styles.emptyText}>No upcoming appointments.</Text>
      )}

      <Text style={styles.sectionTitle}>Past Appointments</Text>
      {pastAppointments.length > 0 ? (
        <FlatList
          data={pastAppointments}
          keyExtractor={(item) => item._id.toString()}
          renderItem={({ item }) => <AppointmentItem appointment={item} />}
        />
      ) : (
        <Text style={styles.emptyText}>No past appointments.</Text>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f8f8',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 10,
  },
  appointmentItem: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  itemTitle: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  emptyText: {
    fontStyle: 'italic',
    color: '#555',
    marginBottom: 20,
  },
});

export default Appointments;