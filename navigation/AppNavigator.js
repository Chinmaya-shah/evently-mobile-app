// navigation/AppNavigator.js

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons'; // Import the icon library

// Import the navigators and screens for our tabs
import EventNavigator from './EventNavigator';
import MyTicketsScreen from '../screens/MyTicketsScreen';

const Tab = createBottomTabNavigator();

// This component receives the onLogout function to pass it down to the EventNavigator
export default function AppNavigator({ onLogout }) {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false, // The header is handled by the inner StackNavigator
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'EventsNav') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'MyTickets') {
            iconName = focused ? 'ticket' : 'ticket-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#BB86FC',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: { backgroundColor: '#1E1E1E', borderTopColor: '#1E1E1E' },
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
          headerShown: true, // We want a simple header for this screen
          headerStyle: { backgroundColor: '#1E1E1E' },
          headerTintColor: '#FFFFFF',
        }}
      />
    </Tab.Navigator>
  );
}