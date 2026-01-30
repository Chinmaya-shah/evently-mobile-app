import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// Import the screens
import OrganizerDashboardScreen from '../screens/OrganizerDashboardScreen';
import OrganizerAnalyticsScreen from '../screens/OrganizerAnalyticsScreen';
import CreateEventScreen from '../screens/CreateEventScreen';
import MyEventsScreen from '../screens/MyEventsScreen'; // <-- 1. NEW IMPORT
import ProfileNavigator from './ProfileNavigator';

const Tab = createBottomTabNavigator();

export default function OrganizerNavigator({ onLogout }) {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;

                    if (route.name === 'Dashboard') {
                        iconName = focused ? 'grid' : 'grid-outline';
                    } else if (route.name === 'Analytics') {
                        iconName = focused ? 'stats-chart' : 'stats-chart-outline';
                    } else if (route.name === 'My Events') { // <-- 2. NEW ICON
                        iconName = focused ? 'list' : 'list-outline';
                    } else if (route.name === 'Create Event') {
                        iconName = focused ? 'add-circle' : 'add-circle-outline';
                    } else if (route.name === 'ProfileNav') {
                        iconName = focused ? 'person-circle' : 'person-circle-outline';
                    }

                    return <Ionicons name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: '#22D3EE',
                tabBarInactiveTintColor: '#888888',
                tabBarStyle: {
                    backgroundColor: '#000000',
                    borderTopColor: '#222222',
                    height: 60,
                    paddingBottom: 8,
                    paddingTop: 8
                },
                tabBarLabelStyle: { fontWeight: 'bold', fontSize: 10 },
                headerShown: false,
            })}
        >
            <Tab.Screen name="Dashboard" component={OrganizerDashboardScreen} />
            <Tab.Screen name="Analytics" component={OrganizerAnalyticsScreen} />
            <Tab.Screen name="My Events" component={MyEventsScreen} />
            <Tab.Screen name="Create Event" component={CreateEventScreen} />

            <Tab.Screen name="ProfileNav" options={{ title: 'Profile' }}>
                {(props) => <ProfileNavigator {...props} onLogout={onLogout} />}
            </Tab.Screen>
        </Tab.Navigator>
    );
}