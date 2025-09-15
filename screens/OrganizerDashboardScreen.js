// screens/OrganizerDashboardScreen.js

import React, { useState, useCallback } from 'react';
import { StyleSheet, Text, View, FlatList, Alert, ActivityIndicator, TouchableOpacity } from 'react-native';
import { getMyEvents, deleteEvent } from '../services/api';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

// A more interactive card to display summary info for an organizer's event
const EventSummaryCard = ({ event, onEdit, onDelete }) => (
  <View style={styles.card}>
    <Text style={styles.cardTitle}>{event.name}</Text>
    <Text style={styles.cardDetail}>Date: {new Date(event.date).toLocaleDateString()}</Text>
    <View style={styles.statsContainer}>
      <Text style={styles.stat}>Tickets Sold: {event.ticketsSold}</Text>
      <Text style={styles.stat}>Capacity: {event.capacity}</Text>
      <Text style={styles.stat}>Revenue: ₹{event.ticketsSold * event.ticketPrice}</Text>
    </View>
    {/* --- NEW EDIT AND DELETE BUTTONS --- */}
    <View style={styles.actionsContainer}>
      <TouchableOpacity style={styles.editButton} onPress={() => onEdit(event._id)}>
        <Ionicons name="pencil" size={16} color="#fff" />
        <Text style={styles.actionButtonText}>Edit</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.deleteButton} onPress={() => onDelete(event._id)}>
         <Ionicons name="trash-bin" size={16} color="#fff" />
        <Text style={styles.actionButtonText}>Delete</Text>
      </TouchableOpacity>
    </View>
  </View>
);

export default function OrganizerDashboardScreen({ navigation, onLogout }) {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // A reusable function to fetch the organizer's events from the backend
  const fetchMyEvents = async () => {
    try {
      setIsLoading(true);
      const response = await getMyEvents();
      setEvents(response.data);
    } catch (error) {
      Alert.alert("Error", "Could not load your events.");
    } finally {
      setIsLoading(false);
    }
  };

  // useFocusEffect is a powerful hook that re-runs the fetch function
  // every time the organizer navigates back to this dashboard screen,
  // ensuring the data is always up-to-date.
  useFocusEffect(
    useCallback(() => {
      fetchMyEvents();
    }, [])
  );

  // This function handles the "Delete" button press
  const handleDelete = (eventId) => {
    // We show a confirmation alert to prevent accidental deletion. This is a critical UX feature.
    Alert.alert(
      "Delete Event",
      "Are you sure you want to delete this event? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteEvent(eventId);
              Alert.alert("Success", "Event deleted successfully.");
              // After a successful deletion, we immediately refresh the list.
              fetchMyEvents();
            } catch (error) {
              Alert.alert("Error", error.response?.data?.message || "Failed to delete event.");
            }
          },
        },
      ]
    );
  };

  // This function handles the "Edit" button press
  const handleEdit = (eventId) => {
      // We navigate to the 'Create Event' screen but pass the eventId as a parameter.
      // This will tell that screen to open in "Edit Mode".
      navigation.navigate('Create Event', { eventId: eventId });
  };

  if (isLoading) {
    return <View style={styles.container}><ActivityIndicator size="large" color="#03DAC5" /></View>;
  }

  return (
    <View style={styles.container}>
      {events.length === 0 ? (
        <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>You have not created any events yet.</Text>
            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Create Event')}>
                 <Ionicons name="add-circle-outline" size={24} color="#121212" />
                 <Text style={styles.buttonText}> Create Your First Event</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
              <Text style={styles.logoutButtonText}>Logout</Text>
            </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={events}
          renderItem={({ item }) => (
            <EventSummaryCard
                event={item}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />
          )}
          keyExtractor={(item) => item._id}
          style={styles.list}
          ListHeaderComponent={() => <Text style={styles.header}>Your Events</Text>}
          ListFooterComponent={() => (
            <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
              <Text style={styles.logoutButtonText}>Logout</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#121212', padding: 20 },
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    list: { width: '100%' },
    header: { fontSize: 32, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 20 },
    emptyText: { fontSize: 16, color: '#AAAAAA', textAlign: 'center', marginBottom: 20 },
    button: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#03DAC5', paddingVertical: 12, paddingHorizontal: 30, borderRadius: 10 },
    buttonText: { color: '#121212', fontSize: 16, fontWeight: 'bold' },
    card: { backgroundColor: '#1E1E1E', borderRadius: 10, padding: 15, marginBottom: 15 },
    cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#FFFFFF' },
    cardDetail: { fontSize: 14, color: '#AAAAAA', marginTop: 5 },
    statsContainer: { marginTop: 15, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#333' },
    stat: { fontSize: 14, color: '#FFFFFF', marginTop: 5 },
    actionsContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 15,
        borderTopWidth: 1,
        borderTopColor: '#333',
        paddingTop: 10,
    },
    editButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#444', // Neutral edit color
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 5,
        marginLeft: 10,
    },
    deleteButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#CF6679', // Red for delete
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 5,
        marginLeft: 10,
    },
    actionButtonText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        marginLeft: 5,
    },
    logoutButton: {
        backgroundColor: '#888',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 30,
        marginBottom: 20,
    },
    logoutButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold'
    },
});