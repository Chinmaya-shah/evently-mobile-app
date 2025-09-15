// navigation/AppNavigator.js

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons'; // We use this library for the tab icons

// Import the navigators and screens that this tab navigator will manage
import EventNavigator from './EventNavigator';
import MyTicketsScreen from '../screens/MyTicketsScreen';

const Tab = createBottomTabNavigator();

// This component receives the 'onLogout' function as a prop from App.js
// so it can pass it down to the screen that contains the logout button (HomeScreen).
export default function AppNavigator({ onLogout }) {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        // --- THIS IS THE NEW, REDESIGNED STYLING ---
        headerShown: false, // The header is handled by the inner StackNavigator (EventNavigator)
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'EventsNav') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'MyTickets') {
            iconName = focused ? 'ticket' : 'ticket-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#FFFFFF', // The icon for the active tab will be white
        tabBarInactiveTintColor: '#888888', // The icon for inactive tabs will be grey
        tabBarStyle: {
            backgroundColor: '#121212', // A very dark grey background for the tab bar
            borderTopColor: '#333333', // A subtle top border to separate it from the screen
        },
        tabBarLabelStyle: {
            fontWeight: 'bold',
        }
      })}
    >
      {/* The first tab is our "Events" section, which uses its own Stack Navigator */}
      <Tab.Screen name="EventsNav" options={{ title: 'Events' }}>
        {/* We pass the onLogout function down to the EventNavigator */}
        {() => <EventNavigator onLogout={onLogout} />}
      </Tab.Screen>

      {/* The second tab is the "My Tickets" screen */}
      <Tab.Screen
        name="MyTickets"
        component={MyTicketsScreen}
        options={{
          title: 'My Tickets',
          // We want this screen to have its own simple header
          headerShown: true,
          headerStyle: {
              backgroundColor: '#121212', // Dark header
              borderBottomWidth: 0, // No line under the header
              elevation: 0,
              shadowOpacity: 0
          },
          headerTintColor: '#FFFFFF', // White title text
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      />
    </Tab.Navigator>
  );
}