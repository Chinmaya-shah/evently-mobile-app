import React, { useState } from 'react';
import {
  StyleSheet, Text, View, TextInput, TouchableOpacity,
  StatusBar, Alert, KeyboardAvoidingView, ScrollView, Platform,
  ImageBackground, ActivityIndicator, Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { loginUser } from '../services/api';

const { width, height } = Dimensions.get('window');

export default function LoginScreen({ navigation, onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      return Alert.alert('Error', 'Please enter both email and password.');
    }

    setLoading(true);
    try {
      const response = await loginUser(email, password);

      // Check for response.data as per your previous logic
      if (response.data) {
        if (onLoginSuccess) {
            onLoginSuccess(response.data);
        } else {
            // Fallback navigation if onLoginSuccess prop isn't passed
            navigation.navigate('AppNavigator');
        }
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Invalid credentials or connection error.';
      Alert.alert('Login Failed', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* 1. Immersive Background Image */}
      <ImageBackground
        source={{ uri: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1000&auto=format&fit=crop' }}
        style={styles.backgroundImage}
      >
        {/* 2. Gradient Overlay for Readability */}
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
              <View style={styles.logoBadge}>
                <Text style={styles.logoText}>E</Text>
              </View>
              <Text style={styles.title}>Evently</Text>
              <Text style={styles.subtitle}>Discover. Connect. Experience.</Text>
            </View>

            {/* Form Section */}
            <View style={styles.formSection}>

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
                    placeholder="Password"
                    placeholderTextColor="#A1A1AA"
                    onChangeText={setPassword}
                    value={password}
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                    <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#A1A1AA" />
                  </TouchableOpacity>
                </BlurView>
              </View>

              {/* Login Button */}
              <TouchableOpacity
                style={styles.loginButton}
                onPress={handleLogin}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#000" />
                ) : (
                  <Text style={styles.loginButtonText}>Sign In</Text>
                )}
              </TouchableOpacity>

              {/* Footer / Sign Up */}
              <View style={styles.footer}>
                <Text style={styles.footerText}>New here? </Text>
                <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
                  <Text style={styles.signUpLink}>Create Account</Text>
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
  scrollContent: { flexGrow: 1, justifyContent: 'flex-end', paddingBottom: 50 },

  headerContainer: { alignItems: 'center', marginBottom: 50, paddingHorizontal: 20 },
  logoBadge: {
    width: 70, height: 70, borderRadius: 35,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#fff', shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4, shadowRadius: 15, elevation: 10
  },
  logoText: { fontSize: 36, fontWeight: '900', color: '#000' },
  title: { fontSize: 42, fontWeight: '800', color: '#fff', letterSpacing: 1 },
  subtitle: { fontSize: 16, color: 'rgba(255,255,255,0.7)', marginTop: 8 },

  formSection: { paddingHorizontal: 24, width: '100%' },
  inputWrapper: { marginBottom: 16, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
  blurContainer: { flexDirection: 'row', alignItems: 'center', height: 60, paddingHorizontal: 16 },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, color: '#fff', fontSize: 16 },

  loginButton: {
    backgroundColor: '#fff', height: 60, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
    marginTop: 10,
    shadowColor: '#fff', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 12, elevation: 8
  },
  loginButtonText: { color: '#000', fontSize: 18, fontWeight: 'bold' },

  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 32 },
  footerText: { color: 'rgba(255,255,255,0.6)', fontSize: 14 },
  signUpLink: { color: '#fff', fontWeight: 'bold', fontSize: 14, textDecorationLine: 'underline' },
});