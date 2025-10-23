import axios from 'axios';
import { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
const SignUpModal = ({ toggleView }) => {
  const [username, setUsername] = useState('');
  const [phone, setphone] = useState('');
  const [password, setPassword] = useState('');

  const handleSignUpFormSubmit = async () => {
    try {
      const response = await axios.post(`${process.env.EXPO_PUBLIC_BACKEND_URL}/auth/signup`, {
        username,
        phone,
        password,
      });
      Alert.alert('Success', response.data.message);
      toggleView();
    } catch (error) {
      if (error.response) {
        Alert.alert('Sign Up Failed', error.response.data.message);
      } else {
        Alert.alert('Error', 'An unexpected error occurred. Please try again.');
      }
    }
  };

  return (
    <View style={styles.formContainer}>
      <View style={styles.inputView}>
        <TextInput
          style={styles.input}
          placeholder="username"
          placeholderTextColor="#999"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />
      </View>
      <View style={styles.inputView}>
        <TextInput
          style={styles.input}
          placeholder="Mobile Number"
          placeholderTextColor="#999"
          value={phone}
          onChangeText={setphone}
          keyboardType="phone-pad"
        />
      </View>
      <View style={styles.inputView}>
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#999"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
      </View>

      <TouchableOpacity style={styles.loginButton} onPress={handleSignUpFormSubmit}>
        <Text style={styles.buttonText}>SIGN UP</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={toggleView}>
        <Text style={styles.signUpText}>Back to Login</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  formContainer: {
    width: '100%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  inputView: {
    width: '100%',
    backgroundColor: '#f1f1f1',
    borderRadius: 25,
    height: 50,
    marginBottom: 20,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  input: {
    height: 50,
    color: '#333',
  },
  loginButton: {
    width: '100%',
    backgroundColor: '#0a7ea4',
    borderRadius: 25,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  signUpText: {
    color: '#0a7ea4',
    fontSize: 14,
  },
});

export default SignUpModal;