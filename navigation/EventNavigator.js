// navigation/EventNavigator.js

import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import HomeScreen from '../screens/HomeScreen';
import EventDetailScreen from '../screens/EventDetailScreen';

const Stack = createStackNavigator();

export default function EventNavigator({ onLogout }) {
    return (
        <Stack.Navigator
            screenOptions={{
                // --- NEW, REDESIGNED STYLES ---
                headerStyle: {
                    backgroundColor: '#121212', // A very dark grey header
                    borderBottomWidth: 0, // No line under the header
                    elevation: 0,
                    shadowOpacity: 0,
                },
                headerTintColor: '#FFFFFF', // White title text and back arrow
                headerTitleStyle: { fontWeight: 'bold' },
            }}
        >
            <Stack.Screen name="Home" options={{ title: 'Events' }}>
                {(props) => <HomeScreen {...props} onLogout={onLogout} />}
            </Stack.Screen>
            <Stack.Screen
                name="EventDetail"
                component={EventDetailScreen}
                options={{ title: 'Event Details' }}
            />
        </Stack.Navigator>
    );
}