import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import EventNavigator from './EventNavigator';
import MyTicketsScreen from '../screens/MyTicketsScreen';
import ProfileScreen from '../screens/ProfileScreen'; // <-- 1. IMPORT THE NEW SCREEN

const Tab = createBottomTabNavigator();

export default function AppNavigator({ onLogout }) {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;
                    if (route.name === 'EventsNav') {
                        iconName = focused ? 'home' : 'home-outline';
                    } else if (route.name === 'MyTickets') {
                        iconName = focused ? 'ticket' : 'ticket-outline';
                    } else if (route.name === 'Profile') { // <-- 2. ADD ICON LOGIC FOR PROFILE
                        iconName = focused ? 'person-circle' : 'person-circle-outline';
                    }
                    return <Ionicons name={iconName} size={size} color={color} />;
                },
                // All styles are consistent with our theme
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
                {() => <EventNavigator onLogout={onLogout} />}
            </Tab.Screen>
            <Tab.Screen
                name="MyTickets"
                component={MyTicketsScreen}
                options={{
                    title: 'My Tickets',
                    headerShown: true,
                    headerStyle: { backgroundColor: '#121212', borderBottomWidth: 0, elevation: 0, shadowOpacity: 0 },
                    headerTintColor: '#FFFFFF',
                    headerTitleStyle: { fontWeight: 'bold' },
                }}
            />
            {/* --- 3. ADD THE NEW PROFILE SCREEN TAB --- */}
            <Tab.Screen name="Profile" options={{
                headerShown: true,
                headerStyle: { backgroundColor: '#121212', borderBottomWidth: 0, elevation: 0, shadowOpacity: 0 },
                headerTintColor: '#FFFFFF',
            }}>
                {/* We pass the onLogout function down to the ProfileScreen */}
                {() => <ProfileScreen onLogout={onLogout} />}
            </Tab.Screen>
        </Tab.Navigator>
    );
}
