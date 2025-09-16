// screens/UpcomingTicketsList.js

import React, { useState, useCallback } from 'react';
import { StyleSheet, Text, View, FlatList, Alert, ActivityIndicator, TouchableOpacity } from 'react-native';
import { getMyTickets, acceptTicketInvitation, declineTicketInvitation } from '../services/api';
import { useFocusEffect } from '@react-navigation/native';

// This is the interactive TicketCard component for upcoming events.
const TicketCard = ({ ticket, onAccept, onDecline }) => (
    <View style={styles.card}>
        <View>
            <Text style={styles.cardTitle}>{ticket.event?.name || 'Event Details Not Available'}</Text>
            <Text style={styles.cardDetail}>Location: {ticket.event?.location}</Text>
            <Text style={styles.cardDetail}>Date: {new Date(ticket.event?.date).toLocaleDateString()}</Text>
        </View>

        {ticket.status === 'pending_acceptance' ? (
            <View style={styles.buttonContainer}>
                <TouchableOpacity style={[styles.actionButton, styles.declineButton]} onPress={() => onDecline(ticket._id)}>
                    <Text style={styles.declineButtonText}>Decline</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionButton, styles.acceptButton]} onPress={() => onAccept(ticket._id)}>
                    <Text style={styles.acceptButtonText}>Accept</Text>
                </TouchableOpacity>
            </View>
        ) : (
            <View style={[styles.statusBadge, styles[ticket.status] || styles.defaultStatus]}>
                <Text style={[styles.statusText, styles[`${ticket.status}Text`] || styles.defaultStatusText]}>
                    {ticket.status.replace('_', ' ').toUpperCase()}
                </Text>
            </View>
        )}
    </View>
);

export default function UpcomingTicketsList() {
    const [tickets, setTickets] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // A reusable function to fetch only the upcoming tickets from the server.
    const fetchTickets = async () => {
        try {
            // We add the '?status=upcoming' filter to our API call.
            const response = await getMyTickets('upcoming');
            setTickets(response.data);
        } catch (error) {
            Alert.alert("Error", "Could not load your upcoming tickets.");
        } finally {
            setIsLoading(false);
        }
    };

    // useFocusEffect re-fetches tickets every time the user comes back to this screen.
    useFocusEffect(
        useCallback(() => {
            setIsLoading(true);
            fetchTickets();
        }, [])
    );

    const handleAccept = async (ticketId) => {
        try {
            await acceptTicketInvitation(ticketId);
            Alert.alert("Success", "Invitation accepted! The ticket will be finalized shortly.");
            fetchTickets(); // Refresh the list
        } catch (error) {
            Alert.alert("Error", "Could not accept the invitation.");
        }
    };

    const handleDecline = async (ticketId) => {
        try {
            await declineTicketInvitation(ticketId);
            Alert.alert("Declined", "You have declined the invitation.");
            fetchTickets(); // Refresh the list
        } catch (error)      {
            Alert.alert("Error", "Could not decline the invitation.");
        }
    };

    if (isLoading) {
        return <View style={styles.container}><ActivityIndicator size="large" color="#FFFFFF" /></View>;
    }

    return (
        <View style={styles.container}>
            {tickets.length === 0 ? (
                <Text style={styles.emptyText}>You have no upcoming tickets or invitations.</Text>
            ) : (
                <FlatList
                    data={tickets}
                    renderItem={({ item }) => (
                        <TicketCard
                            ticket={item}
                            onAccept={handleAccept}
                            onDecline={handleDecline}
                        />
                    )}
                    keyExtractor={(item) => item._id}
                    style={styles.list}
                    contentContainerStyle={{ paddingTop: 20 }}
                />
            )}
        </View>
    );
}

// The complete StyleSheet for this component
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000000', alignItems: 'center', justifyContent: 'center' },
    list: { width: '100%', paddingHorizontal: 20 },
    card: { backgroundColor: '#1E1E1E', borderRadius: 12, padding: 20, marginBottom: 20 },
    cardTitle: { fontSize: 20, fontWeight: 'bold', color: '#FFFFFF' },
    cardDetail: { fontSize: 14, color: '#AAAAAA', marginTop: 8 },
    statusBadge: { alignSelf: 'flex-start', marginTop: 15, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
    statusText: { fontSize: 12, fontWeight: 'bold' },
    pending_acceptance: { backgroundColor: '#FFA500' },
    accepted: { backgroundColor: '#03DAC5' },
    confirmed: { backgroundColor: '#FFFFFF' },
    used: { backgroundColor: '#CF6679' },
    expired: { backgroundColor: '#555' },
    defaultStatus: { backgroundColor: '#888' },
    confirmedText: { color: '#000000' },
    acceptedText: { color: '#000000' },
    defaultStatusText: { color: '#FFFFFF' },
    emptyText: { fontSize: 16, color: '#AAAAAA', textAlign: 'center' },
    buttonContainer: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 20, paddingTop: 15, borderTopWidth: 1, borderTopColor: '#333333' },
    actionButton: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8, marginLeft: 10 },
    acceptButton: { backgroundColor: '#FFFFFF' },
    acceptButtonText: { color: '#000000', fontWeight: 'bold' },
    declineButton: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#AAAAAA' },
    declineButtonText: { color: '#AAAAAA', fontWeight: 'bold' },
});