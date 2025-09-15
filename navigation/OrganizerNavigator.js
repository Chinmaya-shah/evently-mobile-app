// navigation/OrganizerNavigator.js

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// Import the screens that this navigator will manage
import OrganizerDashboardScreen from '../screens/OrganizerDashboardScreen';
import CreateEventScreen from '../screens/CreateEventScreen';

const Tab = createBottomTabNavigator();

// This component receives the 'onLogout' function as a prop from App.js
// so it can pass it down to the screen that contains the logout button.
export default function OrganizerNavigator({ onLogout }) {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        // Configure the icons and colors for the tab bar
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Dashboard') {
            iconName = focused ? 'stats-chart' : 'stats-chart-outline';
          } else if (route.name === 'Create Event') {
            iconName = focused ? 'add-circle' : 'add-circle-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#03DAC5', // A distinct color for the organizer
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: { backgroundColor: '#1E1E1E', borderTopColor: '#1E1E1E' },
        headerStyle: { backgroundColor: '#1E1E1E' },
        headerTintColor: '#FFFFFF',
      })}
    >
      {/* The first tab is the Dashboard screen. */}
      <Tab.Screen name="Dashboard">
        {/* We pass the onLogout function down to the dashboard screen */}
        {(props) => <OrganizerDashboardScreen {...props} onLogout={onLogout} />}
      </Tab.Screen>

      {/* The second tab is the Create Event screen. */}
      <Tab.Screen name="Create Event" component={CreateEventScreen} />
    </Tab.Navigator>
  );
}