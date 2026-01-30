import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack'; // <-- 1. Import Stack
import { Ionicons } from '@expo/vector-icons';

// Import the screens
import OrganizerDashboardScreen from '../screens/OrganizerDashboardScreen';
import OrganizerAnalyticsScreen from '../screens/OrganizerAnalyticsScreen';
import CreateEventScreen from '../screens/CreateEventScreen';
import MyEventsScreen from '../screens/MyEventsScreen';
import ProfileNavigator from './ProfileNavigator';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator(); // <-- 2. Create Stack Instance

// --- INTERNAL COMPONENT: THE 4 TABS ---
function OrganizerTabs({ onLogout }) {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;

                    if (route.name === 'Dashboard') {
                        iconName = focused ? 'grid' : 'grid-outline';
                    } else if (route.name === 'Create Event') {
                        iconName = focused ? 'add-circle' : 'add-circle-outline';
                    } else if (route.name === 'My Events') {
                        iconName = focused ? 'list' : 'list-outline';
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
            {/* 1. Dashboard */}
            <Tab.Screen name="Dashboard" component={OrganizerDashboardScreen} />

            {/* 2. Create (Left-Center) */}
            <Tab.Screen
                name="Create Event"
                component={CreateEventScreen}
                options={{
                    title: 'Create',
                    headerShown: true,
                    headerStyle: { backgroundColor: '#000000', borderBottomWidth: 0, elevation: 0, shadowOpacity: 0 },
                    headerTintColor: '#FFFFFF'
                }}
            />

            {/* 3. My Events (Right-Center) */}
            <Tab.Screen name="My Events" component={MyEventsScreen} />

            {/* 4. Profile */}
            <Tab.Screen name="ProfileNav" options={{ title: 'Profile' }}>
                {(props) => <ProfileNavigator {...props} onLogout={onLogout} />}
            </Tab.Screen>
        </Tab.Navigator>
    );
}

// --- MAIN EXPORT: THE STACK (Wraps Tabs + Analytics) ---
export default function OrganizerNavigator({ onLogout }) {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            {/* The Main Tabs */}
            <Stack.Screen name="OrganizerTabs">
                {(props) => <OrganizerTabs {...props} onLogout={onLogout} />}
            </Stack.Screen>

            {/* The Analytics Screen (Pushed on top of tabs) */}
            <Stack.Screen
                name="Analytics"
                component={OrganizerAnalyticsScreen}
                options={{
                    presentation: 'card', // iOS slide-in animation
                }}
            />
        </Stack.Navigator>
    );
}