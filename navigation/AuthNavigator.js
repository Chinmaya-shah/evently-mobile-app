// Filename: evently-mobile-app/navigation/AuthNavigator.js
// Purpose: A stack navigator to handle all pre-authentication screens (Login, SignUp).

import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

// Import the screens this navigator will manage
import LoginScreen from '../screens/LoginScreen';
import SignUpScreen from '../screens/SignUpScreen';

const Stack = createStackNavigator();

const AuthNavigator = () => {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false, // We want a clean, full-screen experience
            }}
        >
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="SignUp" component={SignUpScreen} />
        </Stack.Navigator>
    );
};

export default AuthNavigator;