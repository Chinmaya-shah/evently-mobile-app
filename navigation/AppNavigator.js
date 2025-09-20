// navigation/AppNavigator.js

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// Import the navigators and screens that this tab navigator will manage
import EventNavigator from './EventNavigator';
import MyTicketsScreen from '../screens/MyTicketsScreen';
import ProfileNavigator from './ProfileNavigator'; // We now use the dedicated Profile Navigator

const Tab = createBottomTabNavigator();

// This is the main tab bar for a logged-in Attendee.
export default function AppNavigator({ onLogout }) {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false, // Headers are handled by the inner navigators
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;
                    if (route.name === 'EventsNav') {
                        iconName = focused ? 'home' : 'home-outline';
                    } else if (route.name === 'MyTickets') {
                        iconName = focused ? 'ticket' : 'ticket-outline';
                    } else if (route.name === 'ProfileNav') { // Updated name for consistency
                        iconName = focused ? 'person-circle' : 'person-circle-outline';
                    }
                    return <Ionicons name={iconName} size={size} color={color} />;
                },
                // All styles are consistent with our minimalist black and white theme
                tabBarActiveTintColor: '#FFFFFF',
                tabBarInactiveTintColor: '#888888',
                tabBarStyle: {
                    backgroundColor: '#121212',
                    borderTopColor: '#333333',
                },
                tabBarLabelStyle: {
                    fontWeight: 'bold',
                }
            })}
        >
            <Tab.Screen name="EventsNav" options={{ title: 'Events' }}>
                {/* We no longer need to pass the onLogout prop here */}
                {(props) => <EventNavigator {...props} />}
            </Tab.Screen>
            <Tab.Screen
                name="MyTickets"
                component={MyTicketsScreen}
                options={{
                    title: 'My Tickets',
                    headerShown: true, // This screen has its own simple header
                    headerStyle: { backgroundColor: '#121212', borderBottomWidth: 0, elevation: 0, shadowOpacity: 0 },
                    headerTintColor: '#FFFFFF',
                    headerTitleStyle: { fontWeight: 'bold' },
                }}
            />
            {/* The Profile tab now renders the entire ProfileNavigator */}
            <Tab.Screen name="ProfileNav" options={{ title: 'Profile' }}>
                {/* --- THIS IS THE CRITICAL FIX --- */}
                {/* We now pass all navigator props (...props) down to the ProfileNavigator. */}
                {/* This gives the ProfileScreen inside it the 'navigation' object it needs. */}
                {(props) => <ProfileNavigator {...props} onLogout={onLogout} />}
            </Tab.Screen>
        </Tab.Navigator>
    );
}