// screens/MyTicketsScreen.js

import React, { useState, useCallback } from 'react';
import { StyleSheet, Text, View, FlatList, Alert, ActivityIndicator, TouchableOpacity } from 'react-native';
import { getMyTickets, acceptTicketInvitation, declineTicketInvitation } from '../services/api';
import { useFocusEffect } from '@react-navigation/native'; // A hook to refetch data when the tab is focused

// A new, redesigned TicketCard component
const TicketCard = ({ ticket, onAccept, onDecline }) => (
  <View style={styles.card}>
    <View>
        <Text style={styles.cardTitle}>{ticket.event?.name || 'Event Details Not Available'}</Text>
        <Text style={styles.cardDetail}>Location: {ticket.event?.location}</Text>
        <Text style={styles.cardDetail}>Date: {new Date(ticket.event?.date).toLocaleDateString()}</Text>
    </View>

    {/* --- CONDITIONAL UI LOGIC --- */}
    {ticket.status === 'pending_acceptance' ? (
      // If the ticket is a pending invitation, show the action buttons.
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={[styles.actionButton, styles.declineButton]} onPress={() => onDecline(ticket._id)}>
          <Text style={styles.declineButtonText}>Decline</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, styles.acceptButton]} onPress={() => onAccept(ticket._id)}>
          <Text style={styles.acceptButtonText}>Accept</Text>
        </TouchableOpacity>
      </View>
    ) : (
      // Otherwise, show the colored status tag.
      <View style={[styles.statusBadge, styles[ticket.status] || styles.defaultStatus]}>
        <Text style={[styles.statusText, styles[`${ticket.status}Text`] || styles.defaultStatusText]}>
          {ticket.status.replace('_', ' ').toUpperCase()}
        </Text>
      </View>
    )}
  </View>
);


export default function MyTicketsScreen() {
  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // A reusable function to fetch the latest ticket data from the server.
  const fetchTickets = async () => {
    try {
      const response = await getMyTickets();
      setTickets(response.data);
    } catch (error) {
      console.error("Failed to fetch tickets:", error);
      Alert.alert("Error", "Could not load your tickets.");
    } finally {
      setIsLoading(false);
    }
  };

  // useFocusEffect runs the 'fetchTickets' function every time the user navigates to this tab.
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
      Alert.alert("Success", "Invitation accepted! The ticket will be finalized shortly.");
      fetchTickets(); // Refetch the tickets to show the updated status.
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
        <Text style={styles.emptyText}>You have no tickets or invitations.</Text>
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

// --- NEW, REDESIGNED STYLESHEET ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    width: '100%',
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  cardDetail: {
    fontSize: 14,
    color: '#AAAAAA',
    marginTop: 8,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    marginTop: 15,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  // Status-specific styles for the tags
  pending_acceptance: { backgroundColor: '#FFA500' }, // Orange
  accepted: { backgroundColor: '#03DAC5' },           // Teal
  declined: { backgroundColor: '#888' },             // Grey
  confirmed: { backgroundColor: '#FFFFFF' },         // White
  used: { backgroundColor: '#CF6679' },              // Red
  expired: { backgroundColor: '#555' },              // Dark Grey
  defaultStatus: { backgroundColor: '#888' },
  // Status-specific text colors
  confirmedText: { color: '#000000' },
  acceptedText: { color: '#000000' },
  defaultStatusText: { color: '#FFFFFF' },
  emptyText: {
    fontSize: 16,
    color: '#AAAAAA',
  },
  // Invitation action buttons
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#333333',
  },
  actionButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginLeft: 10,
  },
  acceptButton: {
    backgroundColor: '#FFFFFF',
  },
  acceptButtonText: {
    color: '#000000',
    fontWeight: 'bold',
  },
  declineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#AAAAAA',
  },
  declineButtonText: {
    color: '#AAAAAA',
    fontWeight: 'bold',
  },
});