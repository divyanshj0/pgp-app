// app/index.jsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

const InitialRoute = () => {
    const router = useRouter();

    useEffect(() => {
        const checkAuthStatus = async () => {
            let token = null;
            let authority = null;
            try {
                token = await AsyncStorage.getItem('token');
                authority = await AsyncStorage.getItem('authority');

                if (!token || !authority) {
                    router.replace('/login');
                } else if (authority === 'ADMIN') {
                    router.replace('/(tabs)/(admin)/');
                } else if (authority === 'USER') {
                    router.replace('/(tabs)/(user)/');
                } else {
                    console.warn("Unknown authority found:", authority);
                    router.replace('/login');
                }
            } catch (e) {
                console.error("Failed to check auth status:", e);
                router.replace('/login');
            }
        };

        checkAuthStatus();
    }, [router]);
    return (
        <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#6366f1" />
        </View>
    );
};

const styles = StyleSheet.create({
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f9fafb',
    },
});

export default InitialRoute;