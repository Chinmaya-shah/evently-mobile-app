// screens/ProfileScreen.js

import React, { useState, useCallback } from 'react';
import {
    StyleSheet, Text, View, TouchableOpacity,
    Alert, ActivityIndicator, Platform
} from 'react-native';
import { getUserProfile } from '../services/api';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native'; // Import useFocusEffect

export default function ProfileScreen({ navigation, onLogout }) {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // We create a reusable function to fetch the latest profile data.
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

    // useFocusEffect is a powerful hook that re-runs the fetch function
    // every time the user comes back to this Profile tab. This ensures that
    // after they complete KYC, their status will be updated here.
    useFocusEffect(
        useCallback(() => {
            setIsLoading(true);
            fetchProfile();
        }, [])
    );

    if (isLoading) {
        return <View style={styles.container}><ActivityIndicator size="large" color="#FFFFFF" /></View>;
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Ionicons name="person-circle-outline" size={80} color="#FFFFFF" />
                <Text style={styles.name}>{user?.name}</Text>
                <Text style={styles.email}>{user?.email}</Text>
            </View>

            {/* --- THIS IS THE NEW, DYNAMIC VERIFICATION SECTION --- */}
            <View style={styles.verificationContainer}>
                {user?.isVerified ? (
                    // If the user IS verified, show a success message
                    <View style={styles.verifiedBox}>
                        <Ionicons name="shield-checkmark" size={24} color="#FFFFFF" />
                        <Text style={styles.verifiedText}>Identity Verified</Text>
                    </View>
                ) : (
                    // If the user is NOT verified, show the call-to-action
                    <View style={styles.notVerifiedBox}>
                        <Text style={styles.notVerifiedTitle}>Complete Your Verification</Text>
                        <Text style={styles.notVerifiedText}>Verify your identity to activate your Evently Pass.</Text>
                        <TouchableOpacity style={styles.verifyButton} onPress={() => navigation.navigate('KYC')}>
                            <Text style={styles.verifyButtonText}>Verify Now</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>

            <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
                <Text style={styles.logoutButtonText}>Logout</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000000',
        alignItems: 'center',
        padding: 20,
    },
    header: {
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 30,
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
    // --- NEW STYLES for the verification section ---
    verificationContainer: {
        width: '100%',
        marginBottom: 20,
    },
    verifiedBox: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#1A332E', // A subtle dark green
        borderColor: '#03DAC5', // Teal border
        borderWidth: 1,
        borderRadius: 12,
        padding: 20,
    },
    verifiedText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 10,
    },
    notVerifiedBox: {
        backgroundColor: '#1E1E1E',
        borderRadius: 12,
        padding: 20,
        alignItems: 'center',
    },
    notVerifiedTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    notVerifiedText: {
        fontSize: 14,
        color: '#AAAAAA',
        textAlign: 'center',
        marginTop: 10,
        marginBottom: 20,
        lineHeight: 20,
    },
    verifyButton: {
        width: '100%',
        backgroundColor: '#FFFFFF',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    verifyButtonText: {
        color: '#000000',
        fontSize: 16,
        fontWeight: 'bold',
    },
    logoutButton: {
        width: '100%',
        height: 55,
        backgroundColor: '#333333', // Dark grey for a less prominent logout
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 'auto', // Pushes the button to the bottom
        marginBottom: 20,
    },
    logoutButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});