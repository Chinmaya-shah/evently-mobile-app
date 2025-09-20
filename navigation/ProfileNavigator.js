// navigation/ProfileNavigator.js

import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

// Import the screens that this navigator will manage
import ProfileScreen from '../screens/ProfileScreen';
import KYCScreen from '../screens/KYCScreen';

const ProfileStack = createStackNavigator();

// This component receives the 'onLogout' function as a prop from its parent
export default function ProfileNavigator({ onLogout }) {
    return (
        <ProfileStack.Navigator
            screenOptions={{
                // We use our standard black and white theme for the header
                headerStyle: { backgroundColor: '#121212', borderBottomWidth: 0, elevation: 0, shadowOpacity: 0 },
                headerTintColor: '#FFFFFF',
                headerTitleStyle: { fontWeight: 'bold' },
            }}
        >
            {/* The first screen is the main Profile page */}
            <ProfileStack.Screen name="ProfileMain" options={{ title: 'Profile' }}>
                {/* We need to pass the onLogout function down to the ProfileScreen */}
                {(props) => <ProfileScreen {...props} onLogout={onLogout} />}
            </ProfileStack.Screen>

            {/* The second screen is the KYC form */}
            <ProfileStack.Screen
                name="KYC"
                component={KYCScreen}
                options={{ title: 'Identity Verification' }}
            />
        </ProfileStack.Navigator>
    );
}