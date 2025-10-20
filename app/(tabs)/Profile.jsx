import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import {
  ActivityIndicator,
  Avatar,
  Button,
  Card,
  Dialog,
  Portal,
  Text,
  TextInput
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

const API_URL = 'http://192.168.0.100:5000/api';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newFamilyMemberFirstName, setNewFamilyMemberFirstName] = useState('');
  const [newFamilyMemberLastName, setNewFamilyMemberLastName] = useState('');
  const [newFamilyMemberAge, setNewFamilyMemberAge] = useState('');
  const [newFamilyMemberGender, setNewFamilyMemberGender] = useState('Male');
  const [dialogVisible, setDialogVisible] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.get(`${API_URL}/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(response.data);
    } catch (error) {
      console.error(error);
      alert('Failed to fetch profile data.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddFamilyMember = async () => {
    if (!newFamilyMemberFirstName || !newFamilyMemberAge) {
      alert('Please fill in all family member details.');
      return;
    }

    const token = await AsyncStorage.getItem('token');
    try {
      const response = await axios.post(
        `${API_URL}/profile/family-members`,
        {
          firstName: newFamilyMemberFirstName,
          lastName: newFamilyMemberLastName,
          age: parseInt(newFamilyMemberAge, 10),
          gender: newFamilyMemberGender,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchProfile();
      setDialogVisible(false);
      setNewFamilyMemberFirstName('');
      setNewFamilyMemberLastName('');
      setNewFamilyMemberAge('');
      setNewFamilyMemberGender('Male');
    } catch (error) {
      console.error(error);
      alert('Failed to add family member.');
    }
  };
  const getGenderIcon = (gender) => {
    switch (gender) {
      case 'Male':
        return <Avatar.Icon size={40} icon="account" style={{ backgroundColor: '#42a5f5' }} />;
      case 'Female':
        return <Avatar.Icon size={40} icon="account" style={{ backgroundColor: '#ec407a' }} />;
      default:
        return <Avatar.Icon size={40} icon="account" style={{ backgroundColor: '#ab47bc' }} />;
    }
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator animating={true} size="large" color="#0a7ea4" />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text variant="headlineMedium" style={styles.title}>
          Profile
        </Text>

        <Text variant="titleLarge" style={styles.sectionTitle}>
          Personal Details
        </Text>
        <Card style={styles.card}>
          <Card.Title title={`${user.firstName} ${user.lastName}`} />
          <Card.Content>
            <Text>Email: {user.email}</Text>
            <Text>Mobile: {user.mobileNumber}</Text>
          </Card.Content>
        </Card>

        <View style={styles.addfamily}>
          <Text variant="titleLarge" style={styles.sectionTitle}>
            Family Members
          </Text>
          <Button
            icon="account-plus"
            mode="contained"
            style={styles.addButton}
            onPress={() => setDialogVisible(true)}
          >
            Add Member
          </Button>
        </View>
        <Card style={styles.card}>
          <Card.Content>
            {user?.familyMembers?.length > 0 ? (
              user.familyMembers.map((member, index) => (
                <View key={index} style={styles.familyMemberRow}>
                  {getGenderIcon(member.gender)}
                  <View style={{ marginLeft: 12, flex: 1 }}>
                    <Text style={styles.memberName}>
                      {member.firstName + ' ' + member.lastName}
                    </Text>
                    <Text style={styles.memberInfo}>
                      {member.gender}
                    </Text>
                    <Text style={styles.memberInfo}>
                     {member.age} yrs
                    </Text>
                  </View>
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>No family members added yet.</Text>
            )}
          </Card.Content>
        </Card>


      </ScrollView>

      {/* Dialog for adding family member */}
      <Portal>
        <Dialog visible={dialogVisible} onDismiss={() => setDialogVisible(false)}>
          <Dialog.Title>Add New Family Member</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="First Name"
              mode="outlined"
              value={newFamilyMemberFirstName}
              onChangeText={setNewFamilyMemberFirstName}
              style={styles.input}
            />
            <TextInput
              label="Last Name"
              mode="outlined"
              value={newFamilyMemberLastName}
              onChangeText={setNewFamilyMemberLastName}
              style={styles.input}
            />
            <TextInput
              label="Age"
              mode="outlined"
              keyboardType="numeric"
              value={newFamilyMemberAge}
              onChangeText={setNewFamilyMemberAge}
              style={styles.input}
            />
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={newFamilyMemberGender}
                onValueChange={(val) => setNewFamilyMemberGender(val)}
              >
                <Picker.Item label="Male" value="Male" />
                <Picker.Item label="Female" value="Female" />
                <Picker.Item label="Other" value="Other" />
              </Picker>
            </View>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDialogVisible(false)}>Cancel</Button>
            <Button onPress={handleAddFamilyMember}>Save</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
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
  title: {
    marginBottom: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  sectionTitle: {
    marginTop: 20,
    marginBottom: 10,
    fontWeight: 'bold',
  },
  card: {
    borderRadius: 12,
    marginBottom: 16,
    backgroundColor: '#fff',
    elevation: 3,
  },
  addfamily:{
    flexDirection:'row',
    alignItems:'center',
    justifyContent:'space-between',
    marginBottom:10,
  },
  familyMemberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  memberName: {
    fontWeight: '600',
    fontSize: 16,
  },
  memberInfo: {
    fontSize: 14,
    color: '#666',
  },
  input: {
    marginBottom: 12,
  },
  pickerContainer: {
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 12,
  },
  addButton: {
    marginTop: 10,
    borderRadius: 25,
  },
  emptyText: {
    fontStyle: 'italic',
    color: '#555',
    textAlign: 'center',
  },
});

export default Profile;
