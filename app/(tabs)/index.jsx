import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";
import axios from "axios";
import { useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, View } from "react-native";
import { AutocompleteDropdown } from "react-native-autocomplete-dropdown";
import {
  Button,
  Card,
  RadioButton,
  Text,
  TextInput
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

const API_URL = "http://192.168.0.100:5000/api";

const Home = () => {
  const [familyMembers, setFamilyMembers] = useState([]);
  const [form, setForm] = useState({
    name: "",
    age: "",
    gender: "Male",
    contact: "",
    date: new Date(),
    timeSlot: "Morning",
    description: "",
  });

  const [showDatePicker, setShowDatePicker] = useState(false);

  // Fetch family members from API
  const fetchFamilyMembers = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const response = await axios.get(`${API_URL}/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFamilyMembers(response.data.familyMembers || []);
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to load family members.");
    }
  };

  useEffect(() => {
    fetchFamilyMembers();
    console.log(familyMembers)
  }, []);

  const handleDateChange = (selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setForm({ ...form, date: selectedDate });
    }
  };

  const handleSubmit = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert("Error", "You must be logged in to book an appointment.");
        return;
      }

      const payload = {
        reason: form.description || "General Consultation",
        date: form.date,
        timeSlot: form.timeSlot,
        patientName: form.name,
        age: form.age,
        gender: form.gender,
        contact: form.contact,
      };

      await axios.post(`${API_URL}/appointments`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("Appointment booked successfully!");
      setForm({
        name: "",
        age: "",
        gender: "Male",
        contact: "",
        date: new Date(),
        timeSlot: "Morning",
        description: "",
      });
    } catch (error) {
      console.error(error);
      alert("Failed to book appointment. Please try again.");
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Doctor Info */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleLarge">Dr. Smith Johnson</Text >
            <Text variant="bodyMedium">
              MBBS, MD - General Medicine{"\n"}
              10+ years of experience{"\n"}
              Specializes in Internal Medicine and Family Care.
            </Text>
          </Card.Content>
        </Card>

        <Text style={styles.header}>Book Appointment</Text>

        {/* Autocomplete Name Field */}
        <View style={{ marginBottom: 15, zIndex: 10 }}>
          <Text style={{ marginBottom: 5 }}>Patient Name</Text>
          <AutocompleteDropdown
            clearOnFocus={false}
            closeOnBlur={true}
            closeOnSubmit={false}
            dataSet={familyMembers.map((m, idx) => ({
              id: idx.toString(),
              title: `${m.firstName} ${m.lastName} | ${m.age} yrs | ${m.gender}`,
              member: m,
            }))}
            onSelectItem={(item) => {
              if (item && item.member) {
                setForm({
                  ...form,
                  name: `${item.member.firstName} ${item.member.lastName}`,
                  age: item.member.age?.toString() || "",
                  gender: item.member.gender || "Male",
                  contact: item.member.contact || "",
                });
              }
            }}
          />
        </View>

        <TextInput
          label="Name"
          value={form.name}
          onChangeText={(t) => setForm({ ...form, name: t })}
          style={styles.input}
        />
        <TextInput
          label="Age"
          value={form.age}
          keyboardType="numeric"
          onChangeText={(t) => setForm({ ...form, age: t })}
          style={styles.input}
        />

        {/* Gender */}
        <View style={styles.radioGroup}>
          <Text style={{ marginBottom: 5 }}>Gender</Text>
          <RadioButton.Group
            onValueChange={(value) => setForm({ ...form, gender: value })}
            value={form.gender}
          >
            <View style={styles.radioRow}>
              <RadioButton value="Male" />
              <Text>Male</Text>
              <RadioButton value="Female" />
              <Text>Female</Text>
              <RadioButton value="Other" />
              <Text>Other</Text>
            </View>
          </RadioButton.Group>
        </View>

        <TextInput
          label="Contact"
          value={form.contact}
          keyboardType="phone-pad"
          onChangeText={(t) => setForm({ ...form, contact: t })}
          style={styles.input}
        />

        {/* Date Picker */}
        <Button mode="outlined" onPress={() => setShowDatePicker(true)}>
          Select Date: {form.date.toDateString()}
        </Button>
        {showDatePicker && (
          <DateTimePicker
            value={form.date}
            mode="date"
            display="default"
            onChange={handleDateChange}
          />
        )}

        {/* Time Slot */}
        <View style={styles.radioGroup}>
          <Text style={{ marginBottom: 5 }}>Time Slot</Text>
          <RadioButton.Group
            onValueChange={(value) => setForm({ ...form, timeSlot: value })}
            value={form.timeSlot}
          >
            <View style={styles.radioRow}>
              <RadioButton value="Morning" />
              <Text>Morning</Text>
              <RadioButton value="Evening" />
              <Text>Evening</Text>
            </View>
          </RadioButton.Group>
        </View>

        <TextInput
          label="Description"
          value={form.description}
          onChangeText={(t) => setForm({ ...form, description: t })}
          style={styles.input}
          multiline
          numberOfLines={3}
        />

        <Button mode="contained" onPress={handleSubmit} style={styles.submitBtn}>
          Book Now
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#f9f9f9",
  },
  card: {
    marginBottom: 20,
    borderRadius: 10,
    elevation: 3,
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    marginVertical: 15,
  },
  input: {
    marginBottom: 15,
    backgroundColor: "#fff",
  },
  radioGroup: {
    marginBottom: 15,
  },
  radioRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  submitBtn: {
    marginTop: 20,
    paddingVertical: 5,
  },
});
export default Home;