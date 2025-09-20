// screens/KYCScreen.js

import React, { useState } from 'react';
import {
    StyleSheet, Text, View, TextInput, TouchableOpacity,
    Alert, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform
} from 'react-native';
import { submitKyc } from '../services/api';
import { Ionicons } from '@expo/vector-icons';

export default function KYCScreen({ navigation }) {
    const [fullName, setFullName] = useState('');
    const [address, setAddress] = useState('');
    const [governmentId, setGovernmentId] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmitKyc = async () => {
        if (!fullName || !address || !governmentId) {
            return Alert.alert('Error', 'Please fill out all fields.');
        }

        setIsLoading(true);
        try {
            const kycData = { fullName, address, governmentId };
            await submitKyc(kycData);

            Alert.alert(
                'Verification Submitted',
                'Your identity has been successfully verified.',
                [{ text: 'OK', onPress: () => navigation.goBack() }] // Go back to the profile screen
            );
        } catch (error) {
            Alert.alert('Submission Failed', error.response?.data?.message || 'An error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <Text style={styles.header}>Identity Verification</Text>
                <Text style={styles.subtitle}>Please provide your details exactly as they appear on your government-issued ID.</Text>

                <TextInput style={styles.input} placeholder="Full Legal Name" placeholderTextColor="#AAAAAA" value={fullName} onChangeText={setFullName} />
                <TextInput style={styles.input} placeholder="Full Address" placeholderTextColor="#AAAAAA" value={address} onChangeText={setAddress} />
                <TextInput style={styles.input} placeholder="Aadhaar Number (or other Govt. ID)" placeholderTextColor="#AAAAAA" value={governmentId} onChangeText={setGovernmentId} keyboardType="numeric" />

                <TouchableOpacity style={styles.button} onPress={handleSubmitKyc} disabled={isLoading}>
                    {isLoading ? (
                        <ActivityIndicator color="#000000" />
                    ) : (
                        <Text style={styles.buttonText}>Submit for Verification</Text>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000000' },
    scrollContainer: { flexGrow: 1, justifyContent: 'center', padding: 20 },
    header: { fontSize: 32, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 10, textAlign: 'center' },
    subtitle: { fontSize: 14, color: '#AAAAAA', textAlign: 'center', marginBottom: 40 },
    input: { width: '100%', backgroundColor: '#1E1E1E', borderRadius: 12, padding: 20, color: '#FFFFFF', marginBottom: 15, fontSize: 16 },
    button: { backgroundColor: '#FFFFFF', padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 20 },
    buttonText: { color: '#000000', fontSize: 18, fontWeight: 'bold' },
});