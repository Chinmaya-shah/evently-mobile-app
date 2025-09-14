// navigation/EventNavigator.js

import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

// Import the screens that this navigator will manage
import HomeScreen from '../screens/HomeScreen';
import EventDetailScreen from '../screens/EventDetailScreen';

const Stack = createStackNavigator();

// This component receives the 'onLogout' function as a prop from its parent
export default function EventNavigator({ onLogout }) {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#1E1E1E' },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <Stack.Screen name="Home" options={{ title: 'Events' }}>
        {/* We need to pass the onLogout function down to the HomeScreen */}
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