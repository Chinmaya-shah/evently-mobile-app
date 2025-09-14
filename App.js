// App.js - The Main Switch

import React, { useState, useEffect } from 'react';
import { StatusBar, View, ActivityIndicator, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// Import our main navigator for when the user is logged in
import AppNavigator from './navigation/AppNavigator';
// Import the screens for the logged-out state
import LoginScreen from './screens/LoginScreen';
import SignUpScreen from './screens/SignUpScreen'; // <-- Import the new screen
import { getUserProfile } from './services/api';

// Create a separate stack navigator for the authentication flow (Login, Sign Up, etc.)
const AuthStack = createStackNavigator();

// This is a new component that defines the screens available BEFORE a user logs in.
const AuthNavigator = ({ onLoginSuccess }) => (
  <AuthStack.Navigator screenOptions={{ headerShown: false }}>
    <AuthStack.Screen name="Login">
      {/* We pass navigation and onLoginSuccess props down to the LoginScreen */}
      {(props) => <LoginScreen {...props} onLoginSuccess={onLoginSuccess} />}
    </AuthStack.Screen>
    {/* Add the SignUpScreen to this stack */}
    <AuthStack.Screen name="SignUp" component={SignUpScreen} />
  </AuthStack.Navigator>
);


export default function App() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // This useEffect hook checks for a saved user session when the app starts.
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

  // This function is passed to the LoginScreen to update the app's state on success.
  const handleLoginSuccess = async (userData) => {
    // We need the full user profile data, not just the login response
    const profileResponse = await getUserProfile();
    setUser(profileResponse.data);
    await AsyncStorage.setItem('userToken', userData.token);
  };

  // This function is passed down to the main AppNavigator for the logout button.
  const handleLogout = async () => {
    setUser(null);
    await AsyncStorage.removeItem('userToken');
  };

  // While checking the session, we show a loading spinner.
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#BB86FC" />
      </View>
    );
  }

  // This is the main return statement that acts as our switch.
  return (
    <NavigationContainer>
      <StatusBar barStyle="light-content" />
      {user ? (
        // If a user IS logged in, show the main App Navigator with all its tabs.
        <AppNavigator onLogout={handleLogout} />
      ) : (
        // If no user is logged in, show the Authentication Navigator (Login and Sign Up).
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