import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { useRouter } from 'expo-router'
const LoginModal = ({ toggleView }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const router = useRouter();
    const navigation = useNavigation();

    const handleLogin = async () => {
        try {
            const response = await axios.post('http://192.168.0.104:5000/api/login', {
                email,
                password,
            });
            navigation.replace('MainTabs');
        } catch (error) {
            if (error.response) {
                Alert.alert('Login Failed', error.response.data.message);
            } else {
                Alert.alert('Error', 'An unexpected error occurred. Please try again.');
            }
        }
    };
    const handleGoogleLogin = () => {
        // Implement Google sign-in logic here
        Alert.alert('Google Sign-in', 'Continuing with Google...');
    };

    const handleForgotPassword = () => {
        // Implement forgot password navigation here
        Alert.alert('Forgot Password', 'Navigating to forgot password screen...');
    };

    const handleSignUp = () => {
        // Implement sign-up navigation here
        Alert.alert('Sign Up', 'Navigating to sign up screen...');
    };

    return (
        <View style={styles.formContainer}>
            <View style={styles.inputView}>
                <TextInput
                    style={styles.input}
                    placeholder="Email"
                    placeholderTextColor="#999"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
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

            <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>OR</Text>
                <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity style={styles.googleButton} onPress={handleGoogleLogin}>
                <Text style={styles.googleButtonText}>Continue with Google</Text>
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
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 20,
        width: '100%',
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#ccc',
    },
    dividerText: {
        width: 'auto',
        textAlign: 'center',
        color: '#999',
        fontSize: 12,
        marginHorizontal: 10,
    },
    googleButton: {
        width: '100%',
        backgroundColor: '#dd4b39',
        borderRadius: 25,
        height: 50,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        marginBottom: 10,
    },
    googleButtonText: {
        color: 'white',
        fontWeight: 'bold',
        marginLeft: 10,
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