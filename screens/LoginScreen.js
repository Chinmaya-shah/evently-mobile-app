// screens/LoginScreen.js

import React, { useState } from 'react';
import {
  StyleSheet, Text, View, TextInput, TouchableOpacity,
  StatusBar, Alert, KeyboardAvoidingView, ScrollView, Platform
} from 'react-native';
import { loginUser } from '../services/api';

export default function LoginScreen({ navigation, onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      return Alert.alert('Error', 'Please enter both email and password.');
    }
    try {
      const response = await loginUser(email, password);
      if (response.data) {
        onLoginSuccess(response.data);
      }
    } catch (error) {
      Alert.alert('Login Failed', error.response?.data?.message || 'An error occurred.');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingContainer}
      >
        <ScrollView contentContainerStyle={styles.formContainer}>
          <View style={styles.headerContainer}>
            <Text style={styles.logo}>E</Text>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Log in to continue to Evently</Text>
          </View>

          <View>
            <TextInput
              style={styles.input}
              placeholder="Email Address"
              placeholderTextColor="#AAAAAA"
              onChangeText={setEmail}
              value={email}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#AAAAAA"
              onChangeText={setPassword}
              value={password}
              secureTextEntry
            />
            <TouchableOpacity style={styles.button} onPress={handleLogin}>
              <Text style={styles.buttonText}>Login</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.signUpContainer}>
            <Text style={styles.signUpText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
              <Text style={styles.signUpLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

// The clean, static, black and white StyleSheet
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  keyboardAvoidingContainer: { flex: 1 },
  formContainer: { flexGrow: 1, justifyContent: 'center', padding: 20 },
  headerContainer: { alignItems: 'center', marginBottom: 50 },
  logo: { fontSize: 50, fontWeight: 'bold', color: '#FFFFFF' },
  title: { fontSize: 32, fontWeight: 'bold', color: '#FFFFFF', marginTop: 10 },
  subtitle: { fontSize: 16, color: '#AAAAAA', marginTop: 10 },
  input: { width: '100%', height: 55, backgroundColor: '#1E1E1E', borderRadius: 12, paddingHorizontal: 20, color: '#FFFFFF', marginBottom: 15, fontSize: 16 },
  button: { width: '100%', height: 55, backgroundColor: '#FFFFFF', borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginTop: 15 },
  buttonText: { color: '#000000', fontSize: 18, fontWeight: 'bold' },
  signUpContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 30 },
  signUpText: { color: '#AAAAAA', fontSize: 14 },
  signUpLink: { color: '#FFFFFF', fontWeight: 'bold' },
});