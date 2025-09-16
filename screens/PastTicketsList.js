// screens/PastTicketsList.js

import React, { useState, useCallback } from 'react';
import { StyleSheet, Text, View, FlatList, Alert, ActivityIndicator } from 'react-native';
import { getMyTickets } from '../services/api';
import { useFocusEffect } from '@react-navigation/native';

// A simpler, read-only TicketCard component for past events.
const PastTicketCard = ({ ticket }) => (
    <View style={styles.card}>
        <Text style={styles.cardTitle}>{ticket.event?.name || 'Event Details Not Available'}</Text>
        <Text style={styles.cardDetail}>Date: {new Date(ticket.event?.date).toLocaleDateString()}</Text>
        <View style={[styles.statusBadge, styles[ticket.status] || styles.defaultStatus]}>
            <Text style={[styles.statusText, styles[`${ticket.status}Text`] || styles.defaultStatusText]}>
                {ticket.status.replace('_', ' ').toUpperCase()}
            </Text>
        </View>
    </View>
);

export default function PastTicketsList() {
    const [tickets, setTickets] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchTickets = async () => {
        try {
            // We add the '?status=past' filter to our API call.
            const response = await getMyTickets('past');
            setTickets(response.data);
        } catch (error) {
            Alert.alert("Error", "Could not load your ticket history.");
        } finally {
            setIsLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            setIsLoading(true);
            fetchTickets();
        }, [])
    );

    if (isLoading) {
        return <View style={styles.container}><ActivityIndicator size="large" color="#FFFFFF" /></View>;
    }

    return (
        <View style={styles.container}>
            {tickets.length === 0 ? (
                <Text style={styles.emptyText}>You have no past tickets.</Text>
            ) : (
                <FlatList
                    data={tickets}
                    renderItem={({ item }) => <PastTicketCard ticket={item} />}
                    keyExtractor={(item) => item._id}
                    style={styles.list}
                    contentContainerStyle={{ paddingTop: 20 }}
                />
            )}
        </View>
    );
}

// The StyleSheet for this component
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000000', alignItems: 'center', justifyContent: 'center' },
    list: { width: '100%', paddingHorizontal: 20 },
    card: { backgroundColor: '#1E1E1E', borderRadius: 12, padding: 20, marginBottom: 20, opacity: 0.7 }, // Past events are slightly faded
    cardTitle: { fontSize: 20, fontWeight: 'bold', color: '#FFFFFF' },
    cardDetail: { fontSize: 14, color: '#AAAAAA', marginTop: 8 },
    statusBadge: { alignSelf: 'flex-start', marginTop: 15, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
    statusText: { fontSize: 12, fontWeight: 'bold' },
    used: { backgroundColor: '#CF6679' },
    declined: { backgroundColor: '#888' },
    expired: { backgroundColor: '#555' },
    defaultStatus: { backgroundColor: '#888' },
    defaultStatusText: { color: '#FFFFFF' },
    emptyText: { fontSize: 16, color: '#AAAAAA' },
});