// screens/MyTicketsScreen.js

import React from 'react';
import { StyleSheet, View } from 'react-native';
// 1. Import the new Top Tab Navigator
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';

// 2. Import our new list components
import UpcomingTicketsList from './UpcomingTicketsList';
import PastTicketsList from './PastTicketsList';

const Tab = createMaterialTopTabNavigator();

// This component's only job is to set up and display the top tab navigator.
export default function MyTicketsScreen() {
  return (
      <View style={styles.container}>
        <Tab.Navigator
            screenOptions={{
              // --- STYLING to match our app's theme ---
              tabBarActiveTintColor: '#FFFFFF',      // White text for the active tab
              tabBarInactiveTintColor: '#AAAAAA',    // Grey text for inactive tabs
              tabBarIndicatorStyle: {
                backgroundColor: '#FFFFFF',          // White underline for the active tab
                height: 2,
              },
              tabBarStyle: {
                backgroundColor: '#000000',          // Black background for the tab bar
              },
              tabBarLabelStyle: {
                fontWeight: 'bold',
              }
            }}
        >
          {/* 3. Define the two tabs */}
          <Tab.Screen
              name="Upcoming"
              component={UpcomingTicketsList}
          />
          <Tab.Screen
              name="History"
              component={PastTicketsList}
          />
        </Tab.Navigator>
      </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000', // The background of the entire screen
  },
});