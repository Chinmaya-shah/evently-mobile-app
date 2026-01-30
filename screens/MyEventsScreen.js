import React, { useState, useCallback } from 'react';
import {
    StyleSheet, Text, View, FlatList, TouchableOpacity,
    Image, Alert, ActivityIndicator, StatusBar, Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { getMyEvents, deleteEvent } from '../services/api';
import { useFocusEffect } from '@react-navigation/native';

const { width } = Dimensions.get('window');

// --- EVENT LIST CARD ---
const EventManagementCard = ({ event, onEdit, onDelete, onAnalytics }) => {
    const hasSoldTickets = event.ticketsSold > 0;

    return (
        <View style={styles.card}>
            <Image
                source={{ uri: event.eventImage }}
                style={styles.cardImage}
            />

            <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.9)']}
                style={styles.cardOverlay}
            >
                <View style={styles.cardContent}>
                    <View style={{flex: 1, marginRight: 10}}>
                        <Text style={styles.cardTitle} numberOfLines={1}>{event.name}</Text>
                        <Text style={styles.cardDate}>
                            {new Date(event.date).toLocaleDateString()} • {event.location}
                        </Text>

                        <View style={[
                            styles.statusBadge,
                            hasSoldTickets ? styles.statusActive : styles.statusDraft
                        ]}>
                            <Text style={[
                                styles.statusText,
                                hasSoldTickets ? styles.textActive : styles.textDraft
                            ]}>
                                {hasSoldTickets ? `${event.ticketsSold} SOLD` : 'NO SALES'}
                            </Text>
                        </View>
                    </View>

                    {/* ACTIONS ROW */}
                    <View style={styles.actionRow}>
                        {/* 1. ANALYTICS BUTTON */}
                        <TouchableOpacity
                            style={styles.analyticsBtn}
                            onPress={() => onAnalytics(event._id)}
                        >
                            <Feather name="bar-chart-2" size={18} color="#22D3EE" />
                        </TouchableOpacity>

                        {/* 2. EDIT BUTTON */}
                        <TouchableOpacity
                            style={styles.editBtn}
                            onPress={() => onEdit(event._id)}
                        >
                            <Feather name="edit-2" size={18} color="#FFF" />
                        </TouchableOpacity>

                        {/* 3. DELETE BUTTON */}
                        <TouchableOpacity
                            style={[styles.deleteBtn, hasSoldTickets && styles.disabledBtn]}
                            onPress={() => onDelete(event._id, hasSoldTickets)}
                            disabled={hasSoldTickets}
                        >
                            <Feather name="trash-2" size={18} color={hasSoldTickets ? "#555" : "#EF4444"} />
                        </TouchableOpacity>
                    </View>
                </View>
            </LinearGradient>
        </View>
    );
};

export default function MyEventsScreen({ navigation }) {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchEvents = async () => {
        try {
            setLoading(true);
            const res = await getMyEvents();
            setEvents(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchEvents();
        }, [])
    );

    const handleEdit = (eventId) => {
        navigation.navigate('Create Event', { eventId });
    };

    const handleAnalytics = (eventId) => {
        // NAVIGATE TO ANALYTICS WITH ID
        navigation.navigate('Analytics', { eventId });
    };

    const handleDelete = async (eventId, hasSoldTickets) => {
        if (hasSoldTickets) {
            Alert.alert("Cannot Delete", "You cannot delete an event that has already sold tickets. You can only edit the details.");
            return;
        }

        Alert.alert(
            "Delete Event",
            "Are you sure? This action cannot be undone.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await deleteEvent(eventId);
                            fetchEvents();
                            Alert.alert("Success", "Event deleted.");
                        } catch (error) {
                            Alert.alert("Error", "Failed to delete event.");
                        }
                    }
                }
            ]
        );
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#22D3EE" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
            <LinearGradient colors={['#000', '#111', '#000']} style={StyleSheet.absoluteFill} />

            <View style={styles.header}>
                <Text style={styles.pageTitle}>My Events</Text>
                <TouchableOpacity style={styles.createBtn} onPress={() => navigation.navigate('Create Event')}>
                    <Feather name="plus" size={24} color="#000" />
                </TouchableOpacity>
            </View>

            <FlatList
                data={events}
                keyExtractor={(item) => item._id}
                renderItem={({ item }) => (
                    <EventManagementCard
                        event={item}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onAnalytics={handleAnalytics}
                    />
                )}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Feather name="calendar" size={48} color="#333" />
                        <Text style={styles.emptyText}>You haven't created any events yet.</Text>
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    loadingContainer: { flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' },

    // HEADER
    header: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingTop: 60, paddingBottom: 20, paddingHorizontal: 20
    },
    pageTitle: { fontSize: 32, fontWeight: '800', color: '#FFF' },
    createBtn: {
        width: 44, height: 44, borderRadius: 22,
        backgroundColor: '#22D3EE', alignItems: 'center', justifyContent: 'center'
    },

    listContent: { paddingHorizontal: 20, paddingBottom: 100 },

    // CARD
    card: {
        height: 180, borderRadius: 16, marginBottom: 20, overflow: 'hidden',
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)'
    },
    cardImage: { width: '100%', height: '100%' },
    cardOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'flex-end', padding: 16 },

    cardContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
    cardTitle: { color: '#FFF', fontSize: 20, fontWeight: '800', marginBottom: 4 },
    cardDate: { color: '#AAA', fontSize: 12, marginBottom: 8 },

    statusBadge: {
        alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4,
        borderRadius: 6, borderWidth: 1
    },
    statusActive: { borderColor: '#10B981', backgroundColor: 'rgba(16, 185, 129, 0.1)' },
    statusDraft: { borderColor: '#666', backgroundColor: 'rgba(255, 255, 255, 0.05)' },

    textActive: { color: '#10B981', fontSize: 10, fontWeight: '800' },
    textDraft: { color: '#AAA', fontSize: 10, fontWeight: '800' },

    // ACTIONS
    actionRow: { flexDirection: 'row', gap: 10 },

    // Analytics Button (Cyan Glow)
    analyticsBtn: {
        width: 40, height: 40, borderRadius: 20,
        backgroundColor: 'rgba(34, 211, 238, 0.1)', alignItems: 'center', justifyContent: 'center',
        borderWidth: 1, borderColor: 'rgba(34, 211, 238, 0.3)'
    },
    editBtn: {
        width: 40, height: 40, borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center',
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)'
    },
    deleteBtn: {
        width: 40, height: 40, borderRadius: 20,
        backgroundColor: 'rgba(239, 68, 68, 0.1)', alignItems: 'center', justifyContent: 'center',
        borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.2)'
    },
    disabledBtn: {
        backgroundColor: '#222', borderColor: '#333'
    },

    emptyState: { alignItems: 'center', marginTop: 100 },
    emptyText: { color: '#666', marginTop: 16 }
});