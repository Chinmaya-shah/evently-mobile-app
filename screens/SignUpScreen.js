import React, { useState } from 'react';
import {
  StyleSheet, Text, View, TextInput, TouchableOpacity, StatusBar,
  Alert, Switch, KeyboardAvoidingView, ScrollView, Platform,
  ImageBackground, ActivityIndicator, Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { registerUser } from '../services/api';

const { width, height } = Dimensions.get('window');

export default function SignUpScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isOrganizer, setIsOrganizer] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);

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

    setLoading(true);
    try {
      const role = isOrganizer ? 'Organizer' : 'Attendee';
      // Register logic
      await registerUser(name, email, password, role);

      Alert.alert(
        'Success!',
        'Your account has been created. Please log in.',
        [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
      );
    } catch (error) {
      const msg = error.response?.data?.message || 'An error occurred during registration.';
      Alert.alert('Registration Failed', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* 1. Immersive Background (Complementary to Login) */}
      <ImageBackground
        source={{ uri: 'https://images.unsplash.com/photo-1533174072545-e8d4aa97edf9?q=80&w=1000&auto=format&fit=crop' }}
        style={styles.backgroundImage}
      >
        <LinearGradient
          colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.8)', '#000000']}
          style={styles.gradient}
        />

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardAvoidingContainer}
        >
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

            {/* Header Section */}
            <View style={styles.headerContainer}>
              <Text style={styles.title}>Create Account</Text>
              <Text style={styles.subtitle}>Join the Evently community.</Text>
            </View>

            {/* Form Section */}
            <View style={styles.formSection}>

              {/* Name Input */}
              <View style={styles.inputWrapper}>
                <BlurView intensity={20} tint="dark" style={styles.blurContainer}>
                  <Ionicons name="person-outline" size={20} color="#A1A1AA" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Full Name"
                    placeholderTextColor="#A1A1AA"
                    onChangeText={setName}
                    value={name}
                  />
                </BlurView>
              </View>

              {/* Email Input */}
              <View style={styles.inputWrapper}>
                <BlurView intensity={20} tint="dark" style={styles.blurContainer}>
                  <Ionicons name="mail-outline" size={20} color="#A1A1AA" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Email Address"
                    placeholderTextColor="#A1A1AA"
                    onChangeText={setEmail}
                    value={email}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </BlurView>
              </View>

              {/* Password Input */}
              <View style={styles.inputWrapper}>
                <BlurView intensity={20} tint="dark" style={styles.blurContainer}>
                  <Ionicons name="lock-closed-outline" size={20} color="#A1A1AA" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Password (min. 8 chars)"
                    placeholderTextColor="#A1A1AA"
                    onChangeText={setPassword}
                    value={password}
                    secureTextEntry={!isPasswordVisible}
                  />
                  <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)}>
                    <Ionicons name={isPasswordVisible ? "eye-off-outline" : "eye-outline"} size={20} color="#A1A1AA" />
                  </TouchableOpacity>
                </BlurView>
              </View>

              {/* Confirm Password Input */}
              <View style={styles.inputWrapper}>
                <BlurView intensity={20} tint="dark" style={styles.blurContainer}>
                  <Ionicons name="shield-checkmark-outline" size={20} color="#A1A1AA" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Confirm Password"
                    placeholderTextColor="#A1A1AA"
                    onChangeText={setConfirmPassword}
                    value={confirmPassword}
                    secureTextEntry={!isConfirmPasswordVisible}
                  />
                  <TouchableOpacity onPress={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)}>
                    <Ionicons name={isConfirmPasswordVisible ? "eye-off-outline" : "eye-outline"} size={20} color="#A1A1AA" />
                  </TouchableOpacity>
                </BlurView>
              </View>

              {/* Organizer Switch */}
              <View style={styles.inputWrapper}>
                <BlurView intensity={20} tint="dark" style={[styles.blurContainer, styles.switchRow]}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.switchLabel}>I am an Event Organizer</Text>
                    <Text style={styles.switchSubLabel}>Create and manage events</Text>
                  </View>
                  <Switch
                    trackColor={{ false: '#3E3E3E', true: '#8B5CF6' }} // Using Evently Purple
                    thumbColor={isOrganizer ? '#FFFFFF' : '#f4f3f4'}
                    onValueChange={() => setIsOrganizer(previousState => !previousState)}
                    value={isOrganizer}
                  />
                </BlurView>
              </View>

              {/* Sign Up Button */}
              <TouchableOpacity
                style={styles.button}
                onPress={handleSignUp}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#000" />
                ) : (
                  <Text style={styles.buttonText}>Sign Up</Text>
                )}
              </TouchableOpacity>

              {/* Footer / Login Link */}
              <View style={styles.loginContainer}>
                <Text style={styles.loginText}>Already have an account? </Text>
                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                  <Text style={styles.loginLink}>Log In</Text>
                </TouchableOpacity>
              </View>

            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  backgroundImage: { flex: 1, width: width, height: height },
  gradient: { ...StyleSheet.absoluteFillObject },
  keyboardAvoidingContainer: { flex: 1 },
  scrollContent: { flexGrow: 1, justifyContent: 'center', paddingVertical: 40 },

  headerContainer: { alignItems: 'center', marginBottom: 30, paddingHorizontal: 20, marginTop: 40 },
  title: { fontSize: 36, fontWeight: '800', color: '#fff', letterSpacing: 0.5 },
  subtitle: { fontSize: 16, color: 'rgba(255,255,255,0.7)', marginTop: 8 },

  formSection: { paddingHorizontal: 24, width: '100%' },
  inputWrapper: { marginBottom: 16, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
  blurContainer: { flexDirection: 'row', alignItems: 'center', height: 60, paddingHorizontal: 16 },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, color: '#fff', fontSize: 16 },

  switchRow: { justifyContent: 'space-between', height: 70 }, // Taller for 2 lines of text
  switchLabel: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  switchSubLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 12 },

  button: {
    width: '100%', height: 60, backgroundColor: '#FFFFFF', borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
    marginTop: 10,
    shadowColor: '#fff', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 12, elevation: 8
  },
  buttonText: { color: '#000000', fontSize: 18, fontWeight: 'bold' },

  loginContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 30, marginBottom: 20 },
  loginText: { color: 'rgba(255,255,255,0.6)', fontSize: 14 },
  loginLink: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 14, textDecorationLine: 'underline' },
});