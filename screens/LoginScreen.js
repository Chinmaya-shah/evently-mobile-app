// screens/LoginScreen.js

import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, StatusBar, Alert } from 'react-native';
import { loginUser } from '../services/api'; // We still need our API function

// Notice the component now receives 'props' as an argument.
export default function LoginScreen({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password.');
      return;
    }

    try {
      const response = await loginUser(email, password);
      // If the login is successful, we call the function passed down from App.js
      if (response.data) {
        onLoginSuccess(response.data);
      }
    } catch (error) {
      console.error('Login failed:', error.response?.data?.message || error.message);
      Alert.alert('Login Failed', error.response?.data?.message || 'An error occurred.');
    }
  };

  // The JSX is the same as what we had in App.js for the login view.
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
    </View>
  );
}

// The styles are also the same. We are just moving the code.
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
});