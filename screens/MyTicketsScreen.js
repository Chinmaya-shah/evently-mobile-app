// screens/MyTicketsScreen.js

import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, Text, View, FlatList, Alert, ActivityIndicator, TouchableOpacity } from 'react-native';
// We import our new API functions
import { getMyTickets, acceptTicketInvitation, declineTicketInvitation } from '../services/api';
// We import useFocusEffect to refetch data when the user revisits the tab
import { useFocusEffect } from '@react-navigation/native';

// This is a more advanced TicketCard component.
const TicketCard = ({ ticket, onAccept, onDecline }) => (
  <View style={styles.card}>
    <Text style={styles.cardTitle}>{ticket.event?.name || 'Event Details Not Available'}</Text>
    <Text style={styles.cardDetail}>Location: {ticket.event?.location}</Text>
    <Text style={styles.cardDetail}>Date: {new Date(ticket.event?.date).toLocaleDateString()}</Text>

    {/* --- CONDITIONAL UI LOGIC --- */}
    {ticket.status === 'pending_acceptance' ? (
      // If the ticket is a pending invitation, show the action buttons.
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={[styles.actionButton, styles.declineButton]} onPress={() => onDecline(ticket._id)}>
          <Text style={styles.actionButtonText}>Decline</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, styles.acceptButton]} onPress={() => onAccept(ticket._id)}>
          <Text style={styles.actionButtonText}>Accept</Text>
        </TouchableOpacity>
      </View>
    ) : (
      // Otherwise, show the status tag.
      <Text style={[styles.status, styles[ticket.status]]}>
        {ticket.status.replace('_', ' ').toUpperCase()}
      </Text>
    )}
  </View>
);


export default function MyTicketsScreen() {
  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // This is a function to fetch the tickets. We will call it in two places.
  const fetchTickets = async () => {
    try {
      const response = await getMyTickets();
      setTickets(response.data);
    } catch (error) {
      Alert.alert("Error", "Could not load your tickets.");
    } finally {
      setIsLoading(false);
    }
  };

  // useFocusEffect is a special hook from React Navigation.
  // It runs the 'fetchTickets' function every time the user focuses on this tab.
  useFocusEffect(
    useCallback(() => {
      setIsLoading(true);
      fetchTickets();
    }, [])
  );

  // This function handles the "Accept" button press.
  const handleAccept = async (ticketId) => {
    try {
      await acceptTicketInvitation(ticketId);
      Alert.alert("Success", "Invitation accepted!");
      // After accepting, we refetch the tickets to show the updated status.
      fetchTickets();
    } catch (error) {
      Alert.alert("Error", "Could not accept the invitation.");
    }
  };

  // This function handles the "Decline" button press.
  const handleDecline = async (ticketId) => {
    try {
      await declineTicketInvitation(ticketId);
      Alert.alert("Declined", "You have declined the invitation.");
      fetchTickets(); // Refetch to show the updated status.
    } catch (error) {
      Alert.alert("Error", "Could not decline the invitation.");
    }
  };

  if (isLoading) {
    return <View style={styles.container}><ActivityIndicator size="large" color="#BB86FC" /></View>;
  }

  return (
    <View style={styles.container}>
      {tickets.length === 0 ? (
        <Text style={styles.emptyText}>You do not have any tickets or invitations.</Text>
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
        />
      )}
    </View>
  );
}

// --- UPDATED STYLES ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', alignItems: 'center', justifyContent: 'center', padding: 20, },
  list: { width: '100%' },
  card: { backgroundColor: '#1E1E1E', borderRadius: 10, padding: 15, marginBottom: 15, width: '100%' },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#FFFFFF' },
  cardDetail: { fontSize: 14, color: '#AAAAAA', marginTop: 5 },
  status: { fontSize: 12, fontWeight: 'bold', marginTop: 15, alignSelf: 'flex-end', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 5, overflow: 'hidden' },
  // Status-specific styles
  pending_acceptance: { color: '#000', backgroundColor: '#FFD700' }, // Gold
  accepted: { color: '#FFF', backgroundColor: '#FFA500' },           // Orange
  declined: { color: '#FFF', backgroundColor: '#888' },             // Grey
  confirmed: { color: '#000', backgroundColor: '#03DAC5' },          // Teal
  used: { color: '#FFF', backgroundColor: '#CF6679' },              // Red
  expired: { color: '#FFF', backgroundColor: '#555' },              // Dark Grey
  emptyText: { fontSize: 16, color: '#AAAAAA' },
  // Invitation action buttons
  buttonContainer: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 15 },
  actionButton: { paddingVertical: 8, paddingHorizontal: 15, borderRadius: 5, marginLeft: 10 },
  actionButtonText: { color: '#121212', fontWeight: 'bold' },
  acceptButton: { backgroundColor: '#03DAC5' }, // Teal
  declineButton: { backgroundColor: '#CF6679' }, // Red
});