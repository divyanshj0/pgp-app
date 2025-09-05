import React, { useState } from 'react';
import {View, Text, TextInput, StyleSheet,TouchableOpacity, ScrollView,Alert,Platform,Button } from 'react-native';
import axios from 'axios';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';

const API_URL = 'http://172.22.66.125:8081/api'; // Make sure to replace YOUR_LOCAL_IP

const AppointmentForm = () => {
  const [name, setName] = useState('');
  const [gender, setGender] = useState('Male');
  const [age, setAge] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [reason, setReason] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [time, setTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);

  const handleDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(Platform.OS === 'ios');
    setDate(currentDate);
  };

  const handleTimeChange = (event, selectedTime) => {
    const currentTime = selectedTime || time;
    setShowTimePicker(Platform.OS === 'ios');
    setTime(currentTime);
  };
  
  const handleBooking = async () => {
    try {
      const response = await axios.post(`${API_URL}/appointments`, {
        name,
        gender,
        age,
        mobileNumber,
        reason,
        date: date.toISOString().split('T')[0], // format date for backend
        timeSlot: time.toTimeString().split(' ')[0], // format time for backend
      });
      Alert.alert('Success', response.data.message);
      // Clear form on success
      setName('');
      setGender('Male');
      setAge('');
      setMobileNumber('');
      setReason('');
      setDate(new Date());
      setTime(new Date());
    } catch (error) {
      console.error(error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to book appointment.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Book a New Appointment</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Full Name"
        value={name}
        onChangeText={setName}
      />
      
      <View style={styles.pickerContainer}>
        <Text style={styles.pickerLabel}>Gender</Text>
        <Picker
          selectedValue={gender}
          onValueChange={(itemValue) => setGender(itemValue)}
          style={styles.picker}
        >
          <Picker.Item label="Male" value="Male" />
          <Picker.Item label="Female" value="Female" />
          <Picker.Item label="Other" value="Other" />
        </Picker>
      </View>
      
      <TextInput
        style={styles.input}
        placeholder="Age"
        keyboardType="numeric"
        value={age}
        onChangeText={setAge}
      />
      
      <TextInput
        style={styles.input}
        placeholder="Mobile Number"
        keyboardType="phone-pad"
        value={mobileNumber}
        onChangeText={setMobileNumber}
      />
      
      <TextInput
        style={styles.input}
        placeholder="Reason for Appointment"
        value={reason}
        onChangeText={setReason}
      />

      <View style={styles.datetimeContainer}>
        <Text style={styles.datetimeLabel}>Date of Appointment</Text>
        <Button onPress={() => setShowDatePicker(true)} title={date.toDateString()} />
        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display="default"
            onChange={handleDateChange}
          />
        )}
      </View>

      <View style={styles.datetimeContainer}>
        <Text style={styles.datetimeLabel}>Time Slot</Text>
        <Button onPress={() => setShowTimePicker(true)} title={time.toLocaleTimeString()} />
        {showTimePicker && (
          <DateTimePicker
            value={time}
            mode="time"
            display="default"
            onChange={handleTimeChange}
          />
        )}
      </View>

      <TouchableOpacity style={styles.bookButton} onPress={handleBooking}>
        <Text style={styles.buttonText}>BOOK APPOINTMENT</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  pickerContainer: {
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 15,
    paddingHorizontal: 10,
    justifyContent: 'center',
  },
  pickerLabel: {
    fontSize: 12,
    color: '#999',
    position: 'absolute',
    top: -10,
    left: 15,
    backgroundColor: '#fff',
    paddingHorizontal: 5,
  },
  picker: {
    height: 50,
  },
  datetimeContainer: {
    marginBottom: 15,
  },
  datetimeLabel: {
    fontSize: 16,
    marginBottom: 5,
  },
  bookButton: {
    backgroundColor: '#0a7ea4',
    padding: 15,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default AppointmentForm;