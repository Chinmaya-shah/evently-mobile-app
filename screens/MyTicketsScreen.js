import React from 'react';
import { StyleSheet, View, Text, StatusBar, Platform } from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { LinearGradient } from 'expo-linear-gradient';
// FIX: Import SafeAreaView from the context library, NOT react-native
import { SafeAreaView } from 'react-native-safe-area-context';

// Import our list components
import UpcomingTicketsList from './UpcomingTicketsList';
import PastTicketsList from './PastTicketsList';

const Tab = createMaterialTopTabNavigator();

// Custom Header Component
const WalletHeader = () => (
  <View style={styles.headerContainer}>
    <Text style={styles.headerTitle}>Digital Wallet</Text>
    <Text style={styles.headerSubtitle}>Manage your access passes</Text>
  </View>
);

export default function MyTicketsScreen() {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* 1. Global Background Gradient */}
      <LinearGradient
        colors={['#000000', '#121212', '#000000']}
        style={styles.gradient}
      />

      {/* FIX: Use edges prop to only pad the top, avoiding double padding on bottom */}
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* 2. Page Title */}
        <WalletHeader />

        {/* 3. Premium Tab Navigator */}
        <Tab.Navigator
          sceneContainerStyle={{ backgroundColor: 'transparent' }}
          screenOptions={{
            tabBarActiveTintColor: '#FFFFFF',
            tabBarInactiveTintColor: '#555555',
            tabBarLabelStyle: {
              fontWeight: '700',
              fontSize: 14,
              letterSpacing: 0.5,
              textTransform: 'capitalize',
            },
            tabBarStyle: {
              backgroundColor: 'transparent',
              elevation: 0,
              shadowOpacity: 0,
              borderBottomWidth: 1,
              borderBottomColor: 'rgba(255,255,255,0.1)',
            },
            tabBarIndicatorStyle: {
              backgroundColor: '#4F46E5',
              height: 3,
              borderRadius: 3,
            },
            tabBarPressColor: 'rgba(79, 70, 229, 0.2)',
          }}
        >
          <Tab.Screen
            name="Upcoming"
            component={UpcomingTicketsList}
            options={{ tabBarLabel: 'Active Tickets' }}
          />
          <Tab.Screen
            name="History"
            component={PastTicketsList}
            options={{ tabBarLabel: 'Past Events' }}
          />
        </Tab.Navigator>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  safeArea: {
    flex: 1,
  },
  headerContainer: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: 'transparent',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#AAAAAA',
    marginTop: 4,
    fontWeight: '500',
  },
});