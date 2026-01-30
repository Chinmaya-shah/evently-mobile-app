import React, { useState, useCallback } from 'react';
import {
  StyleSheet, Text, View, FlatList, ActivityIndicator,
  ImageBackground, Dimensions
} from 'react-native';
import { getMyTickets } from '../services/api';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';

// --- PAST TICKET CARD COMPONENT ---
const PastTicketCard = ({ ticket }) => {
  const eventImage = ticket.event?.eventImage || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=1000&auto=format&fit=crop';
  const eventDate = new Date(ticket.event?.date);

  // Helper for status colors
  const getStatusColor = (status) => {
    switch(status) {
        case 'used': return '#EC4899'; // Pink
        case 'declined': return '#EF4444'; // Red
        default: return '#6B7280'; // Grey
    }
  };

  const statusColor = getStatusColor(ticket.status);

  return (
    <View style={styles.cardContainer}>
      <ImageBackground
        source={{ uri: eventImage }}
        style={styles.imageBackground}
        imageStyle={{ borderRadius: 16 }}
      >
        {/* Heavy Dimming Overlay */}
        <View style={styles.dimOverlay} />

        <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.9)']}
            style={styles.contentOverlay}
        >
            <View style={styles.topRow}>
                <View style={styles.dateBadge}>
                    <Text style={styles.dateText}>
                        {eventDate.toLocaleDateString()}
                    </Text>
                </View>

                <View style={[styles.statusBadge, { borderColor: statusColor, backgroundColor: `${statusColor}20` }]}>
                    <Text style={[styles.statusText, { color: statusColor }]}>
                        {ticket.status.toUpperCase()}
                    </Text>
                </View>
            </View>

            <View style={styles.bottomRow}>
                <Text style={styles.eventTitle}>{ticket.event?.name || 'Unknown Event'}</Text>
                <View style={styles.locationRow}>
                    <Feather name="map-pin" size={12} color="#888" />
                    <Text style={styles.locationText}>{ticket.event?.location || 'Unknown'}</Text>
                </View>
            </View>
        </LinearGradient>
      </ImageBackground>
    </View>
  );
};

export default function PastTicketsList() {
    const [tickets, setTickets] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchTickets = async () => {
        try {
            const response = await getMyTickets('past');
            const allTickets = response.data || [];

            // --- LOGIC PATCH: CLIENT SIDE FILTER ---
            // Only show tickets if:
            // 1. Status is 'used', 'expired', or 'declined'
            // OR 2. Event Date is actually in the past
            const now = new Date();
            const realPastTickets = allTickets.filter(t => {
                const eventDate = new Date(t.event?.date);
                const isDatePassed = eventDate < now;
                const isInactiveStatus = ['used', 'expired', 'declined'].includes(t.status);

                return isDatePassed || isInactiveStatus;
            });

            setTickets(realPastTickets);
        } catch (error) {
            console.error("Fetch Past Tickets Error:", error);
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
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#4F46E5" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {tickets.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Feather name="clock" size={48} color="#333" />
                    <Text style={styles.emptyTitle}>No History</Text>
                    <Text style={styles.emptySubtitle}>
                        Events you have attended in the past will appear here.
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={tickets}
                    renderItem={({ item }) => <PastTicketCard ticket={item} />}
                    keyExtractor={(item) => item._id}
                    style={styles.list}
                    contentContainerStyle={{ paddingTop: 20, paddingBottom: 100 }}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: 'transparent' }, // Important for black bg
    loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    list: { width: '100%', paddingHorizontal: 20 },

    // --- CARD ---
    cardContainer: {
        height: 180,
        borderRadius: 16,
        marginBottom: 20,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    imageBackground: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    dimOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.6)',
    },
    contentOverlay: {
        flex: 1,
        justifyContent: 'space-between',
        padding: 16,
    },
    topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    dateBadge: {
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    dateText: { color: '#AAA', fontSize: 12, fontWeight: '600' },

    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
        borderWidth: 1,
    },
    statusText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },

    bottomRow: {},
    eventTitle: { color: 'rgba(255,255,255,0.8)', fontSize: 18, fontWeight: '700', marginBottom: 4 },
    locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    locationText: { color: '#666', fontSize: 12 },

    emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 100 },
    emptyTitle: { color: '#FFF', fontSize: 18, fontWeight: '700', marginTop: 16 },
    emptySubtitle: { color: '#666', fontSize: 14, marginTop: 8, textAlign: 'center', maxWidth: 250 },
});