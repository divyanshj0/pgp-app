import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const LoginModal = ({ toggleView }) => {
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const handleLogin = async () => {
        try {
            const response = await axios.post('http://10.56.121.186:8080/auth/login', {
                phone,
                password,
            });
            const { token } = response.data;
            await AsyncStorage.setItem('token',token);
            router.replace('/(tabs)');
        } catch (error) {
            if (error.response) {
                Alert.alert('Login Failed', error.response.data.message);
            } else {
                Alert.alert('Error', 'An unexpected error occurred. Please try again.');
            }
        }
    };

    const handleForgotPassword = () => {
        // Implement forgot password navigation here
        Alert.alert('Forgot Password', 'Navigating to forgot password screen...');
    };
    return (
        <View style={styles.formContainer}>
            <View style={styles.inputView}>
                <TextInput
                    style={styles.input}
                    placeholder="phone"
                    placeholderTextColor="#999"
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="number-pad"
                    autoCapitalize="none"
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

            <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
                <Text style={styles.buttonText}>LOGIN</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleForgotPassword}>
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.signUpButton} onPress={toggleView}>
                <Text style={styles.signUpText}>Don't have an account? Sign Up</Text>
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
    forgotPasswordText: {
        color: '#0a7ea4',
        fontSize: 12,
        marginTop: 5,
    },
    signUpButton: {
        marginTop: 10,
    },
    signUpText: {
        color: '#0a7ea4',
        fontSize: 14,
    },
});

export default LoginModal;