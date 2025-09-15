// App.js - The Main Switch (Corrected)

import React, { useState, useEffect } from 'react';
import { StatusBar, View, ActivityIndicator, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import AppNavigator from './navigation/AppNavigator';
import LoginScreen from './screens/LoginScreen';
import SignUpScreen from './screens/SignUpScreen';
import { getUserProfile } from './services/api';

const AuthStack = createStackNavigator();
const AuthNavigator = ({ onLoginSuccess }) => (
  <AuthStack.Navigator screenOptions={{ headerShown: false }}>
    <AuthStack.Screen name="Login">
      {(props) => <LoginScreen {...props} onLoginSuccess={onLoginSuccess} />}
    </AuthStack.Screen>
    <AuthStack.Screen name="SignUp" component={SignUpScreen} />
  </AuthStack.Navigator>
);


export default function App() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkUserSession = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        if (token && jwtDecode(token).exp * 1000 > Date.now()) {
          const response = await getUserProfile();
          setUser(response.data);
        }
      } catch (error) {
        console.log('No valid session found.', error);
      } finally {
        setIsLoading(false);
      }
    };
    checkUserSession();
  }, []);

  // --- THIS IS THE CRITICAL FIX ---
  // The logic is now simpler and corrects the race condition.
  const handleLoginSuccess = async (userData) => {
    // 1. First, we IMMEDIATELY save the new token to our secure vault.
    await AsyncStorage.setItem('userToken', userData.token);

    // 2. The login response already contains all the user data we need.
    // There is no need to make a second API call. We can set the user state directly.
    setUser(userData);
  };

  const handleLogout = async () => {
    setUser(null);
    await AsyncStorage.removeItem('userToken');
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#BB86FC" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar barStyle="light-content" />
      {user ? (
        <AppNavigator onLogout={handleLogout} />
      ) : (
        <AuthNavigator onLoginSuccess={handleLoginSuccess} />
      )}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#121212',
    justifyContent: 'center',
    alignItems: 'center',
  },
});