// screens/OrganizerDashboardScreen.js

import React, { useState, useCallback } from 'react';
import { StyleSheet, Text, View, FlatList, Alert, ActivityIndicator, TouchableOpacity } from 'react-native';
import { getMyEvents, deleteEvent } from '../services/api';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

// A redesigned card to display summary info for an organizer's event
const EventSummaryCard = ({ event, onEdit, onDelete }) => (
    <View style={styles.card}>
        <Text style={styles.cardTitle}>{event.name}</Text>
        <Text style={styles.cardDetail}>Date: {new Date(event.date).toLocaleDateString()}</Text>
        <View style={styles.statsContainer}>
            <Text style={styles.stat}>Tickets Sold: {event.ticketsSold} / {event.capacity}</Text>
            <Text style={styles.stat}>Revenue: ₹{event.ticketsSold * event.ticketPrice}</Text>
        </View>
        <View style={styles.actionsContainer}>
            <TouchableOpacity style={styles.editButton} onPress={() => onEdit(event._id)}>
                <Ionicons name="pencil" size={16} color="#FFFFFF" />
                <Text style={styles.actionButtonText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.deleteButton} onPress={() => onDelete(event._id)}>
                <Ionicons name="trash-bin" size={16} color="#FFFFFF" />
                <Text style={styles.actionButtonText}>Delete</Text>
            </TouchableOpacity>
        </View>
    </View>
);

// The component no longer receives or needs the onLogout prop
export default function OrganizerDashboardScreen({ navigation }) {
    const [events, setEvents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Fetches the organizer's events from the backend
    const fetchMyEvents = async () => {
        try {
            const response = await getMyEvents();
            setEvents(response.data);
        } catch (error) {
            Alert.alert("Error", "Could not load your events.");
        } finally {
            setIsLoading(false);
        }
    };

    // useFocusEffect re-fetches events every time the user comes back to this screen
    useFocusEffect(
        useCallback(() => {
            setIsLoading(true);
            fetchMyEvents();
        }, [])
    );

    // Handles the "Delete" button press with a confirmation alert
    const handleDelete = (eventId) => {
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
                            fetchMyEvents(); // Refresh the list after deleting
                        } catch (error) {
                            Alert.alert("Error", error.response?.data?.message || "Failed to delete event.");
                        }
                    },
                },
            ]
        );
    };

    // Handles the "Edit" button press by navigating to the "smart form"
    const handleEdit = (eventId) => {
        navigation.navigate('Create Event', { eventId: eventId });
    };

    if (isLoading) {
        return <View style={styles.container}><ActivityIndicator size="large" color="#FFFFFF" /></View>;
    }

    return (
        <View style={styles.container}>
            {events.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>You haven't created any events.</Text>
                    <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Create Event')}>
                        <Ionicons name="add-circle-outline" size={24} color="#000000" />
                        <Text style={styles.buttonText}> Create Your First Event</Text>
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
                    contentContainerStyle={{ paddingBottom: 20 }} // Add padding to the bottom of the list
                />
            )}
        </View>
    );
}

// The complete, cleaned StyleSheet without the old logout button styles
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000000', paddingTop: 20 },
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    list: { paddingHorizontal: 20 },
    header: { fontSize: 36, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 20 },
    emptyText: { fontSize: 16, color: '#AAAAAA', textAlign: 'center', marginBottom: 20 },
    button: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', paddingVertical: 12, paddingHorizontal: 30, borderRadius: 12 },
    buttonText: { color: '#000000', fontSize: 16, fontWeight: 'bold', marginLeft: 5 },
    card: { backgroundColor: '#1E1E1E', borderRadius: 12, padding: 20, marginBottom: 20 },
    cardTitle: { fontSize: 20, fontWeight: 'bold', color: '#FFFFFF' },
    cardDetail: { fontSize: 14, color: '#AAAAAA', marginTop: 8 },
    statsContainer: { marginTop: 15, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#333' },
    stat: { fontSize: 14, color: '#FFFFFF', marginTop: 5 },
    actionsContainer: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 20 },
    editButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#333333', paddingVertical: 8, paddingHorizontal: 15, borderRadius: 8 },
    deleteButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#5c1f24', paddingVertical: 8, paddingHorizontal: 15, borderRadius: 8, marginLeft: 10 },
    actionButtonText: { color: '#FFFFFF', fontWeight: 'bold', marginLeft: 5 },
});