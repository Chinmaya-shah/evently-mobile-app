// screens/ProfileScreen.js

import React, { useState, useEffect } from 'react';
// --- THIS IS THE CRITICAL FIX ---
// We now import 'Platform' from react-native so the app knows what it is.
import { StyleSheet, Text, View, TouchableOpacity, Alert, ActivityIndicator, Platform } from 'react-native';
import { getUserProfile } from '../services/api';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileScreen({ onLogout }) {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // This useEffect hook runs when the screen first loads to fetch the user's data.
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await getUserProfile();
                setUser(response.data);
            } catch (error) {
                Alert.alert("Error", "Could not load your profile.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchProfile();
    }, []);

    // While the data is loading, we show a simple spinner.
    if (isLoading) {
        return <View style={styles.container}><ActivityIndicator size="large" color="#FFFFFF" /></View>;
    }

    // Once loaded, we display the user's information.
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Ionicons name="person-circle-outline" size={80} color="#FFFFFF" />
                <Text style={styles.name}>{user?.name}</Text>
                <Text style={styles.email}>{user?.email}</Text>
            </View>

            <View style={styles.infoBox}>
                <Text style={styles.infoTitle}>Your Unique Platform ID</Text>
                <Text style={styles.platformId}>{user?.platformUserId}</Text>
            </View>

            {/* This space can be used for future options like "Change Password" */}

            <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
                <Text style={styles.logoutButtonText}>Logout</Text>
            </TouchableOpacity>
        </View>
    );
}

// The complete StyleSheet for the Profile screen.
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000000',
        alignItems: 'center',
        padding: 20,
    },
    header: {
        alignItems: 'center',
        marginTop: 40,
        marginBottom: 40,
    },
    name: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginTop: 15,
    },
    email: {
        fontSize: 16,
        color: '#AAAAAA',
        marginTop: 5,
    },
    infoBox: {
        width: '100%',
        backgroundColor: '#1E1E1E',
        borderRadius: 12,
        padding: 20,
        alignItems: 'center',
    },
    infoTitle: {
        fontSize: 14,
        color: '#AAAAAA',
    },
    platformId: {
        fontSize: 16,
        color: '#FFFFFF',
        fontWeight: 'bold',
        marginTop: 10,
        // This line will now work correctly because 'Platform' has been imported.
        fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    },
    logoutButton: {
        width: '100%',
        height: 55,
        backgroundColor: '#CF6679', // A distinct "danger" color for logout
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 'auto', // This pushes the button to the bottom of the screen
        marginBottom: 20,
    },
    logoutButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});