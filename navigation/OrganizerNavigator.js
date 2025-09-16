import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import OrganizerDashboardScreen from '../screens/OrganizerDashboardScreen';
import CreateEventScreen from '../screens/CreateEventScreen';
import ProfileScreen from '../screens/ProfileScreen'; // <-- 1. IMPORT THE NEW SCREEN

const Tab = createBottomTabNavigator();

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
                    } else if (route.name === 'Profile') { // <-- 2. ADD ICON LOGIC FOR PROFILE
                        iconName = focused ? 'person-circle' : 'person-circle-outline';
                    }
                    return <Ionicons name={iconName} size={size} color={color} />;
                },
                // All styles are consistent with our theme
                tabBarActiveTintColor: '#FFFFFF',
                tabBarInactiveTintColor: '#888888',
                tabBarStyle: { backgroundColor: '#121212', borderTopColor: '#333333' },
                tabBarLabelStyle: { fontWeight: 'bold' },
                headerStyle: { backgroundColor: '#121212', borderBottomWidth: 0, elevation: 0, shadowOpacity: 0 },
                headerTintColor: '#FFFFFF',
                headerTitleStyle: { fontWeight: 'bold' },
            })}
        >
            <Tab.Screen name="Dashboard">
                {/* The logout button is no longer here, so we don't need the onLogout prop */}
                {(props) => <OrganizerDashboardScreen {...props} />}
            </Tab.Screen>
            <Tab.Screen name="Create Event" component={CreateEventScreen} />
            {/* --- 3. ADD THE NEW PROFILE SCREEN TAB --- */}
            <Tab.Screen name="Profile">
                {() => <ProfileScreen onLogout={onLogout} />}
            </Tab.Screen>
        </Tab.Navigator>
    );
}
