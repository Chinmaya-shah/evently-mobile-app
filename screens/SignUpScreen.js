// screens/SignUpScreen.js

import React, { useState } from 'react';
import {
  StyleSheet, Text, View, TextInput, TouchableOpacity, StatusBar,
  Alert, Switch, KeyboardAvoidingView, ScrollView, Platform
} from 'react-native';
import { registerUser } from '../services/api';
import { Ionicons } from '@expo/vector-icons';

export default function SignUpScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isOrganizer, setIsOrganizer] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);

  const handleSignUp = async () => {
    if (!name || !email || !password || !confirmPassword) {
      return Alert.alert('Error', 'Please fill out all fields.');
    }
    if (password.length < 8) {
      return Alert.alert('Error', 'Password must be at least 8 characters long.');
    }
    if (password !== confirmPassword) {
      return Alert.alert('Error', 'Passwords do not match.');
    }
    try {
      const role = isOrganizer ? 'Organizer' : 'Attendee';
      await registerUser(name, email, password, role);
      Alert.alert(
        'Success!',
        'Your account has been created. Please log in.',
        [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
      );
    } catch (error) {
      Alert.alert('Registration Failed', error.response?.data?.message || 'An error occurred.');
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
          <Text style={styles.title}>Create Account</Text>

          <TextInput style={styles.input} placeholder="Full Name" onChangeText={setName} value={name} />
          <TextInput style={styles.input} placeholder="Email Address" onChangeText={setEmail} value={email} keyboardType="email-address" autoCapitalize="none" />

          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.inputField}
              placeholder="Password (min. 8 characters)"
              onChangeText={setPassword}
              value={password}
              secureTextEntry={!isPasswordVisible}
            />
            <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)} style={styles.eyeIcon}>
              <Ionicons name={isPasswordVisible ? "eye-outline" : "eye-off-outline"} size={24} color="#AAAAAA" />
            </TouchableOpacity>
          </View>

          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.inputField}
              placeholder="Confirm Password"
              onChangeText={setConfirmPassword}
              value={confirmPassword}
              secureTextEntry={!isConfirmPasswordVisible}
            />
            <TouchableOpacity onPress={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)} style={styles.eyeIcon}>
              <Ionicons name={isConfirmPasswordVisible ? "eye-outline" : "eye-off-outline"} size={24} color="#AAAAAA" />
            </TouchableOpacity>
          </View>

          <View style={styles.switchContainer}>
            <Text style={styles.switchLabel}>Sign up as an Event Organizer?</Text>
            <Switch
              trackColor={{ false: '#3E3E3E', true: '#03DAC5' }}
              thumbColor={isOrganizer ? '#FFFFFF' : '#f4f3f4'}
              onValueChange={() => setIsOrganizer(previousState => !previousState)}
              value={isOrganizer}
            />
          </View>

          <TouchableOpacity style={styles.button} onPress={handleSignUp}>
            <Text style={styles.buttonText}>Sign Up</Text>
          </TouchableOpacity>

          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}>Log In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  keyboardAvoidingContainer: { flex: 1 },
  formContainer: { flexGrow: 1, justifyContent: 'center', padding: 20 },
  title: { fontSize: 36, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 30, textAlign: 'center' },
  input: { width: '100%', height: 55, backgroundColor: '#1E1E1E', borderRadius: 12, paddingHorizontal: 20, color: '#FFFFFF', marginBottom: 15, fontSize: 16 },
  passwordContainer: { width: '100%', height: 55, backgroundColor: '#1E1E1E', borderRadius: 12, marginBottom: 15, flexDirection: 'row', alignItems: 'center' },
  inputField: { flex: 1, paddingHorizontal: 20, color: '#FFFFFF', fontSize: 16 },
  eyeIcon: { padding: 10 },
  button: { width: '100%', height: 55, backgroundColor: '#FFFFFF', borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginTop: 10 },
  buttonText: { color: '#000000', fontSize: 18, fontWeight: 'bold' },
  switchContainer: { width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 20, paddingHorizontal: 5 },
  switchLabel: { color: '#FFFFFF', fontSize: 16 },
  loginContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 30 },
  loginText: { color: '#AAAAAA', fontSize: 14 },
  loginLink: { color: '#FFFFFF', fontWeight: 'bold' },
});