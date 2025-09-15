// App.js - The Main Switch (with Animations)

import React, { useState, useEffect } from 'react';
import { StatusBar, View, ActivityIndicator, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';
import { NavigationContainer } from '@react-navigation/native';
// We import CardStyleInterpolators to control the animation between screens
import { createStackNavigator, CardStyleInterpolators } from '@react-navigation/stack';

// Import all our navigators and screens
import AppNavigator from './navigation/AppNavigator';
import OrganizerNavigator from './navigation/OrganizerNavigator';
import LoginScreen from './screens/LoginScreen';
import SignUpScreen from './screens/SignUpScreen';
import { getUserProfile } from './services/api';

const AuthStack = createStackNavigator();

// This is our self-contained navigator for the authentication flow.
// It is now configured with a smooth transition animation.
const AuthNavigator = ({ onLoginSuccess }) => (
  <AuthStack.Navigator
    screenOptions={{
      headerShown: false,
      // --- THIS IS THE CRITICAL FIX for smooth transitions ---
      // We use a simple cross-fade animation between the Login and Sign Up screens.
      cardStyleInterpolator: CardStyleInterpolators.forFadeFromBottomAndroid,
    }}
  >
    <AuthStack.Screen name="Login">
      {(props) => <LoginScreen {...props} onLoginSuccess={onLoginSuccess} />}
    </AuthStack.Screen>
    <AuthStack.Screen name="SignUp" component={SignUpScreen} />
  </AuthStack.Navigator>
);


export default function App() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // This hook checks for a saved user session when the app starts.
  useEffect(() => {
    const checkUserSession = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        if (token && jwtDecode(token).exp * 1000 > Date.now()) {
          const response = await getUserProfile();
          setUser(response.data);
        }
      } catch (error) {
        console.log('No valid session found.');
        await AsyncStorage.removeItem('userToken');
      } finally {
        setIsLoading(false);
      }
    };
    checkUserSession();
  }, []);

  // This function is passed to the LoginScreen to update the app's state.
  const handleLoginSuccess = async (userData) => {
    await AsyncStorage.setItem('userToken', userData.token);
    setUser(userData);
  };

  // This function is passed down to the main navigators for the logout button.
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
        // --- ROLE-BASED NAVIGATION ---
        // We check the role of the logged-in user to show the correct interface.
        user.role === 'Organizer' ? (
          <OrganizerNavigator onLogout={handleLogout} />
        ) : (
          <AppNavigator onLogout={handleLogout} />
        )
      ) : (
        // If no one is logged in, we show the Authentication Navigator.
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