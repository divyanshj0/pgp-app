import { useState } from 'react';
import {
    ImageBackground,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text
} from 'react-native';
import LoginModal from '../components/LoginModal';
import SignUpModal from '../components/SignUpModal';

const HomeScreen = () => {
  const [isLoginView, setIsLoginView] = useState(true);

  const toggleView = () => {
    setIsLoginView(!isLoginView);
  };

  return (
    <ImageBackground
      source={require('../assets/images/coffee-splash.png')}
      style={styles.background}
    >
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingContainer}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="never"
        >
          <Text style={styles.appName}>Doctor's Appointment</Text>
          <Text style={styles.tagline}>Book your consultation with ease.</Text>

          {isLoginView ? (
            <LoginModal toggleView={toggleView} />
          ) : (
            <SignUpModal toggleView={toggleView} />
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  keyboardAvoidingContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'flex-start',
    padding: 20,
  },
  appName: {
    fontSize: 42,
    fontWeight: 'bold',
    color: 'white',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
    marginBottom: 10,
  },
  tagline: {
    fontSize: 18,
    color: 'white',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
    marginBottom: 30,
  }
});

export default HomeScreen;