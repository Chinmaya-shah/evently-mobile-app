// navigation/OrganizerNavigator.js

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// Import the screens and the new navigator that this tab navigator will manage
import OrganizerDashboardScreen from '../screens/OrganizerDashboardScreen';
import CreateEventScreen from '../screens/CreateEventScreen';
import ProfileNavigator from './ProfileNavigator'; // <-- 1. IMPORT THE NEW NAVIGATOR

const Tab = createBottomTabNavigator();

// This is the main tab bar for a logged-in Organizer.
export default function OrganizerNavigator({ onLogout }) {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;
                    if (route.name === 'Dashboard') {
                        iconName = focused ? 'stats-chart' : 'stats-chart-outline';
                    } else if (route.name === 'Create Event') {
                        iconName = focused ? 'add-circle' : 'add-circle-outline';
                    } else if (route.name === 'ProfileNav') { // <-- 2. UPDATE THE NAME TO MATCH
                        iconName = focused ? 'person-circle' : 'person-circle-outline';
                    }
                    return <Ionicons name={iconName} size={size} color={color} />;
                },
                // All styles are consistent with our minimalist black and white theme
                tabBarActiveTintColor: '#FFFFFF',
                tabBarInactiveTintColor: '#888888',
                tabBarStyle: { backgroundColor: '#121212', borderTopColor: '#333333' },
                tabBarLabelStyle: { fontWeight: 'bold' },
                headerShown: false, // All headers are now handled by the inner screens/navigators
            })}
        >
            <Tab.Screen
                name="Dashboard"
                component={OrganizerDashboardScreen}
                options={{
                    title: 'Dashboard',
                    headerShown: true, // This screen has its own simple header
                    headerStyle: { backgroundColor: '#121212', borderBottomWidth: 0, elevation: 0, shadowOpacity: 0 },
                    headerTintColor: '#FFFFFF'
                }}
            />
            <Tab.Screen
                name="Create Event"
                component={CreateEventScreen}
                options={{
                    title: 'Create Event',
                    headerShown: true,
                    headerStyle: { backgroundColor: '#121212', borderBottomWidth: 0, elevation: 0, shadowOpacity: 0 },
                    headerTintColor: '#FFFFFF'
                }}
            />
            {/* --- 3. THE PROFILE TAB NOW USES THE DEDICATED PROFILE NAVIGATOR --- */}
            <Tab.Screen name="ProfileNav" options={{ title: 'Profile' }}>
                {/* --- THIS IS THE CRITICAL FIX --- */}
                {/* We now pass all navigator props (...props) down to the ProfileNavigator. */}
                {/* This gives the ProfileScreen inside it the 'navigation' object it needs. */}
                {(props) => <ProfileNavigator {...props} onLogout={onLogout} />}
            </Tab.Screen>
        </Tab.Navigator>
    );
}