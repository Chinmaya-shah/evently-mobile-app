// screens/LoginScreen.js

import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, StatusBar, Alert } from 'react-native';
import { loginUser } from '../services/api';

// The LoginScreen now receives the 'navigation' prop automatically from our navigator,
// which allows it to navigate to other screens.
export default function LoginScreen({ navigation, onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password.');
      return;
    }

    try {
      const response = await loginUser(email, password);
      // If the login is successful, we call the onLoginSuccess function passed from App.js
      if (response.data) {
        onLoginSuccess(response.data);
      }
    } catch (error) {
      console.error('Login failed:', error.response?.data?.message || error.message);
      Alert.alert('Login Failed', error.response?.data?.message || 'An error occurred.');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <Text style={styles.title}>Evently</Text>
      <Text style={styles.subtitle}>Secure Event Access</Text>
      <TextInput
        style={styles.input}
        placeholder="Email Address"
        placeholderTextColor="#888"
        onChangeText={setEmail}
        value={email}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#888"
        onChangeText={setPassword}
        value={password}
        secureTextEntry
      />
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>

      {/* --- THIS IS THE NEW PART --- */}
      <View style={styles.signUpContainer}>
        <Text style={styles.signUpText}>Don't have an account? </Text>
        {/* This button will navigate the user to our new SignUp screen */}
        <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
          <Text style={[styles.signUpText, styles.signUpLink]}>Sign Up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// The complete StyleSheet for this screen, including new styles.
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#AAAAAA',
    marginBottom: 40,
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#1E1E1E',
    borderRadius: 10,
    paddingHorizontal: 15,
    color: '#FFFFFF',
    marginBottom: 15,
    fontSize: 16,
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#BB86FC',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#121212',
    fontSize: 18,
    fontWeight: 'bold',
  },
  // --- NEW STYLES for the sign-up link ---
  signUpContainer: {
    flexDirection: 'row',
    marginTop: 20,
  },
  signUpText: {
    color: '#AAAAAA',
    fontSize: 14,
  },
  signUpLink: {
    color: '#BB86FC',
    fontWeight: 'bold',
  },
});