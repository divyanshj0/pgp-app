import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const API_URL = 'http://192.168.0.100:5000/api';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newFamilyMemberName, setNewFamilyMemberName] = useState('');
  const [newFamilyMemberAge, setNewFamilyMemberAge] = useState('');
  const [newFamilyMemberGender, setNewFamilyMemberGender] = useState('Male');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await axios.get(`${API_URL}/profile`);
      setUser(response.data);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to fetch profile data.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddFamilyMember = async () => {
    if (!newFamilyMemberName || !newFamilyMemberAge) {
      Alert.alert('Error', 'Please fill in all family member details.');
      return;
    }
    
    try {
      const response = await axios.post(`${API_URL}/profile/family-members`, {
        name: newFamilyMemberName,
        age: parseInt(newFamilyMemberAge, 10),
        gender: newFamilyMemberGender,
      });
      Alert.alert('Success', response.data.message);
      // Refresh user data to show the new family member
      fetchProfile();
      // Clear form
      setNewFamilyMemberName('');
      setNewFamilyMemberAge('');
      setNewFamilyMemberGender('Male');
    } catch (error) {
      console.error(error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to add family member.');
    }
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#0a7ea4" />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView style={styles.container}>
        <Text style={styles.title}>User Profile</Text>
        
        {user && (
          <View style={styles.profileSection}>
            <Text style={styles.label}>Name:</Text>
            <Text style={styles.value}>{user.firstName} {user.lastName}</Text>
            <Text style={styles.label}>Email:</Text>
            <Text style={styles.value}>{user.email}</Text>
            <Text style={styles.label}>Mobile Number:</Text>
            <Text style={styles.value}>{user.mobileNumber}</Text>
          </View>
        )}

        <Text style={styles.sectionTitle}>Family Members</Text>
        <View style={styles.familyMembersSection}>
          {user?.familyMembers?.length > 0 ? (
            user.familyMembers.map((member, index) => (
              <View key={index} style={styles.familyMemberItem}>
                <Text>{member.name} ({member.gender}, {member.age})</Text>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No family members added yet.</Text>
          )}
        </View>
        
        <Text style={styles.sectionTitle}>Add a New Family Member</Text>
        <View style={styles.addFamilyMemberSection}>
          <TextInput
            style={styles.input}
            placeholder="Name"
            value={newFamilyMemberName}
            onChangeText={setNewFamilyMemberName}
          />
          <TextInput
            style={styles.input}
            placeholder="Age"
            keyboardType="numeric"
            value={newFamilyMemberAge}
            onChangeText={setNewFamilyMemberAge}
          />
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={newFamilyMemberGender}
              onValueChange={(itemValue) => setNewFamilyMemberGender(itemValue)}
            >
              <Picker.Item label="Male" value="Male" />
              <Picker.Item label="Female" value="Female" />
              <Picker.Item label="Other" value="Other" />
            </Picker>
          </View>
          <TouchableOpacity style={styles.addButton} onPress={handleAddFamilyMember}>
            <Text style={styles.buttonText}>ADD FAMILY MEMBER</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    backgroundColor: '#f8f8f8',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  profileSection: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  label: {
    fontWeight: 'bold',
    marginTop: 10,
  },
  value: {
    fontSize: 16,
    marginBottom: 5,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: 20,
  },
  familyMembersSection: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
  },
  familyMemberItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  addFamilyMemberSection: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
  },
  input: {
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  pickerContainer: {
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 10,
  },
  addButton: {
    backgroundColor: '#0a7ea4',
    padding: 10,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  emptyText: {
    fontStyle: 'italic',
    color: '#555',
  },
});

export default Profile;