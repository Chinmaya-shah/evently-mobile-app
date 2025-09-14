// App.js - The Main Switch

import React, { useState, useEffect } from 'react';
import { StatusBar, View, ActivityIndicator, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';
import { NavigationContainer } from '@react-navigation/native';

// Import our new main navigator and the login screen
import AppNavigator from './navigation/AppNavigator';
import LoginScreen from './screens/LoginScreen';
import { getUserProfile } from './services/api';

export default function App() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // This useEffect hook for checking the session remains the same.
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

  const handleLoginSuccess = async (userData) => {
    setUser(userData);
    await AsyncStorage.setItem('userToken', userData.token);
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

  // This is the main return statement.
  return (
    <NavigationContainer>
      <StatusBar barStyle="light-content" />
      {user ? (
        // If a user IS logged in, show the main App Navigator
        <AppNavigator onLogout={handleLogout} />
      ) : (
        // If no user is logged in, show the Login Screen
        <LoginScreen onLoginSuccess={handleLoginSuccess} />
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