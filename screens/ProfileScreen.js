import React, { useState, useCallback } from 'react';
import {
    StyleSheet, Text, View, TouchableOpacity,
    Alert, ActivityIndicator, Image, ScrollView, StatusBar
} from 'react-native';
import { getUserProfile } from '../services/api';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

export default function ProfileScreen({ navigation, onLogout }) {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchProfile = async () => {
        try {
            const response = await getUserProfile();
            setUser(response.data);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            setIsLoading(true);
            fetchProfile();
        }, [])
    );

    const handleEditImage = () => {
        // Placeholder for image upload logic
        Alert.alert("Coming Soon", "Profile image uploading will be enabled in the next update.");
    };

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#4F46E5" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

            {/* Global Background */}
            <LinearGradient
                colors={['#000', '#111', '#000']}
                style={StyleSheet.absoluteFill}
            />

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* 1. Header Section */}
                <View style={styles.header}>
                    <View style={styles.avatarContainer}>
                        <LinearGradient
                            colors={['#4F46E5', '#EC4899']}
                            style={styles.avatarGradient}
                        >
                            <View style={styles.avatarBorder}>
                                <Image
                                    source={{ uri: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop' }}
                                    style={styles.avatarImage}
                                />
                            </View>
                        </LinearGradient>

                        {/* Edit Badge */}
                        <TouchableOpacity style={styles.editBadge} onPress={handleEditImage}>
                            <Feather name="camera" size={14} color="#FFF" />
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.name}>{user?.name || 'User'}</Text>
                    <Text style={styles.email}>{user?.email || 'email@example.com'}</Text>

                    {/* Status Pill (Replaces Stats Row) */}
                    <View style={styles.statusPill}>
                        <View style={[styles.statusDot, { backgroundColor: user?.isVerified ? '#10B981' : '#F59E0B' }]} />
                        <Text style={styles.statusText}>
                            {user?.isVerified ? 'Active Member' : 'Verification Pending'}
                        </Text>
                    </View>
                </View>

                {/* 2. Verification Status Card */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Identity Verification</Text>

                    {user?.isVerified ? (
                        // VERIFIED STATE
                        <BlurView intensity={20} tint="dark" style={styles.verifiedCard}>
                            <LinearGradient
                                colors={['rgba(16, 185, 129, 0.1)', 'transparent']}
                                style={styles.cardGradient}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                            >
                                <View style={styles.verifiedIconBox}>
                                    <MaterialIcons name="verified-user" size={24} color="#10B981" />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.cardTitleVerified}>Identity Verified</Text>
                                    <Text style={styles.cardDesc}>Your Evently Pass is fully active.</Text>
                                </View>
                            </LinearGradient>
                        </BlurView>
                    ) : (
                        // UNVERIFIED STATE
                        <TouchableOpacity
                            onPress={() => navigation.navigate('KYC')}
                            activeOpacity={0.9}
                        >
                            <LinearGradient
                                colors={['#1E1E1E', '#111']}
                                style={styles.unverifiedCard}
                            >
                                <View style={styles.unverifiedHeader}>
                                    <View style={styles.warningIconBox}>
                                        <Feather name="alert-circle" size={24} color="#F59E0B" />
                                    </View>
                                    <Text style={styles.cardTitleUnverified}>Action Required</Text>
                                </View>

                                <Text style={styles.cardDesc}>
                                    Complete your KYC verification to unlock ticket purchases and NFC entry.
                                </Text>

                                <View style={styles.verifyButton}>
                                    <Text style={styles.verifyButtonText}>Verify Now</Text>
                                    <Feather name="arrow-right" size={16} color="#000" />
                                </View>
                            </LinearGradient>
                        </TouchableOpacity>
                    )}
                </View>

                {/* 3. Settings / Menu Options */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Account</Text>

                    <TouchableOpacity style={styles.menuItem}>
                        <View style={styles.menuIconBox}>
                            <Feather name="settings" size={20} color="#FFF" />
                        </View>
                        <Text style={styles.menuText}>Settings</Text>
                        <Feather name="chevron-right" size={20} color="#666" />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem}>
                        <View style={styles.menuIconBox}>
                            <Feather name="help-circle" size={20} color="#FFF" />
                        </View>
                        <Text style={styles.menuText}>Help & Support</Text>
                        <Feather name="chevron-right" size={20} color="#666" />
                    </TouchableOpacity>
                </View>

            </ScrollView>

            {/* 4. Logout Button */}
            <View style={styles.footer}>
                <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
                    <Feather name="log-out" size={20} color="#EF4444" />
                    <Text style={styles.logoutText}>Log Out</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    loadingContainer: { flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' },
    scrollContent: { paddingBottom: 100 },

    // HEADER
    header: { alignItems: 'center', paddingTop: 60, paddingBottom: 30 },
    avatarContainer: { marginBottom: 20, position: 'relative' },
    avatarGradient: { width: 110, height: 110, borderRadius: 55, alignItems: 'center', justifyContent: 'center' },
    avatarBorder: { width: 104, height: 104, borderRadius: 52, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center' },
    avatarImage: { width: 96, height: 96, borderRadius: 48 },

    // Edit Badge (Camera Icon)
    editBadge: {
        position: 'absolute', bottom: 0, right: 0,
        backgroundColor: '#333', width: 32, height: 32,
        borderRadius: 16, alignItems: 'center', justifyContent: 'center',
        borderWidth: 2, borderColor: '#000'
    },

    name: { fontSize: 28, fontWeight: '800', color: '#FFF', marginBottom: 4 },
    email: { fontSize: 14, color: '#AAA', marginBottom: 16 },

    // STATUS PILL (Replaces Stats)
    statusPill: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: '#111', paddingHorizontal: 12, paddingVertical: 6,
        borderRadius: 20, borderWidth: 1, borderColor: '#222', gap: 8
    },
    statusDot: { width: 8, height: 8, borderRadius: 4 },
    statusText: { color: '#DDD', fontSize: 12, fontWeight: '600' },

    // SECTIONS
    section: { paddingHorizontal: 24, marginBottom: 30 },
    sectionTitle: { color: '#666', fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 },

    // CARDS
    verifiedCard: { borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(16, 185, 129, 0.3)' },
    cardGradient: { flexDirection: 'row', alignItems: 'center', padding: 16 },
    verifiedIconBox: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(16, 185, 129, 0.1)', alignItems: 'center', justifyContent: 'center', marginRight: 16 },
    cardTitleVerified: { color: '#10B981', fontSize: 16, fontWeight: '700' },

    unverifiedCard: { borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#333' },
    unverifiedHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    warningIconBox: { marginRight: 12 },
    cardTitleUnverified: { color: '#FFF', fontSize: 18, fontWeight: '700' },
    cardDesc: { color: '#AAA', fontSize: 14, lineHeight: 20 },

    verifyButton: {
        marginTop: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        backgroundColor: '#FFF', paddingVertical: 12, borderRadius: 12, gap: 8
    },
    verifyButtonText: { color: '#000', fontWeight: 'bold', fontSize: 14 },

    // MENU
    menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#1A1A1A' },
    menuIconBox: { width: 32, alignItems: 'center', marginRight: 12 },
    menuText: { flex: 1, color: '#FFF', fontSize: 16 },

    // FOOTER
    footer: { padding: 24, paddingBottom: 40 },
    logoutButton: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        paddingVertical: 16, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.2)',
        gap: 10
    },
    logoutText: { color: '#EF4444', fontWeight: 'bold', fontSize: 16 }
});