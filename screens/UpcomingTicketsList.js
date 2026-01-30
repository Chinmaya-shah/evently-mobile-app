import React, { useState, useCallback } from 'react';
import {
  StyleSheet, Text, View, FlatList, Alert, ActivityIndicator,
  TouchableOpacity, ImageBackground, Dimensions, Platform
} from 'react-native';
import { getMyTickets, acceptTicketInvitation, declineTicketInvitation } from '../services/api';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

// --- TICKET CARD COMPONENT ---
const TicketCard = ({ ticket, onAccept, onDecline }) => {
  const isPending = ticket.status === 'pending_acceptance';
  const eventImage = ticket.event?.eventImage || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=1000&auto=format&fit=crop';
  const eventDate = new Date(ticket.event?.date);

  return (
    <View style={styles.cardContainer}>

      {/* 1. VISUAL ZONE (Top 75%) */}
      <ImageBackground
        source={{ uri: eventImage }}
        style={styles.imageBackground}
        imageStyle={{ borderTopLeftRadius: 16, borderTopRightRadius: 16 }}
      >
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.9)']}
          style={styles.gradientOverlay}
        >
          {/* Status Badge (Only for Pending Invitations) */}
          {isPending && (
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>INVITATION RECEIVED</Text>
            </View>
          )}

          {/* Date Badge */}
          <View style={styles.dateBadge}>
            <Text style={styles.dateMonth}>
              {eventDate.toLocaleString('default', { month: 'short' }).toUpperCase()}
            </Text>
            <Text style={styles.dateDay}>{eventDate.getDate()}</Text>
          </View>

          {/* Event Info */}
          <View style={styles.infoContainer}>
            <Text style={styles.eventTitle} numberOfLines={1}>
              {ticket.event?.name || 'Unknown Event'}
            </Text>
            <View style={styles.locationRow}>
              <Feather name="map-pin" size={14} color="#AAA" />
              <Text style={styles.locationText} numberOfLines={1}>
                {ticket.event?.location || 'TBA'}
              </Text>
            </View>
          </View>
        </LinearGradient>
      </ImageBackground>

      {/* 2. CONTROL ZONE (Bottom 25%) */}
      <View style={styles.controlPanel}>
        {/* Visual Perforation Dots */}
        <View style={styles.perforationRow}>
           {[...Array(15)].map((_, i) => (
             <View key={i} style={styles.dot} />
           ))}
        </View>

        {isPending ? (
          // --- CASE A: INVITATION (Action Required) ---
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.declineBtn}
              onPress={() => onDecline(ticket._id)}
            >
              <Text style={styles.declineText}>Decline</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.acceptBtn}
              onPress={() => onAccept(ticket._id)}
            >
              <LinearGradient
                colors={['#4F46E5', '#9333EA']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.acceptGradient}
              >
                <Text style={styles.acceptText}>Accept</Text>
                <Feather name="check" size={16} color="#FFF" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        ) : (
          // --- CASE B: CONFIRMED TICKET (Clean ID View) ---
          <View style={styles.ticketMetaRow}>
            {/* Ticket ID */}
            <View style={styles.metaBlock}>
                <Text style={styles.metaLabel}>TICKET ID</Text>
                <Text style={styles.metaValue} numberOfLines={1}>
                    #{ticket._id.slice(-6).toUpperCase()}
                </Text>
            </View>

            {/* Clean Spacer or simple icon */}
             <View style={{flex: 1}} />

             {/* Simple Icon indicating it's digital */}
             <Feather name="cpu" size={24} color="#4F46E5" style={{ opacity: 0.8 }} />
          </View>
        )}
      </View>
    </View>
  );
};

export default function UpcomingTicketsList() {
    const [tickets, setTickets] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchTickets = async () => {
        try {
            const response = await getMyTickets('upcoming');
            setTickets(response.data);
        } catch (error) {
            console.error("Fetch Tickets Error:", error);
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

    const handleAccept = async (ticketId) => {
        try {
            await acceptTicketInvitation(ticketId);
            Alert.alert("Success", "Invitation accepted! Ticket added to your wallet.");
            fetchTickets();
        } catch (error) {
            Alert.alert("Error", "Could not accept the invitation.");
        }
    };

    const handleDecline = async (ticketId) => {
        try {
            await declineTicketInvitation(ticketId);
            Alert.alert("Declined", "You have declined the invitation.");
            fetchTickets();
        } catch (error) {
            Alert.alert("Error", "Could not decline the invitation.");
        }
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
            {tickets.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Feather name="calendar" size={48} color="#333" />
                    <Text style={styles.emptyTitle}>No Upcoming Tickets</Text>
                    <Text style={styles.emptySubtitle}>
                        Your future events and invitations will appear here.
                    </Text>
                </View>
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
                    contentContainerStyle={{ paddingTop: 20, paddingBottom: 100 }}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: 'transparent' },
    loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    list: { width: '100%', paddingHorizontal: 20 },

    // --- CARD STYLES ---
    cardContainer: {
        backgroundColor: '#1E1E1E',
        borderRadius: 16,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.5,
        shadowRadius: 15,
        elevation: 10,
    },
    imageBackground: {
        height: 160,
        justifyContent: 'flex-end',
    },
    gradientOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
        padding: 16,
    },

    // BADGES
    statusBadge: {
        position: 'absolute',
        top: 12,
        left: 12,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 6,
        backgroundColor: 'rgba(255, 193, 7, 0.2)',
        borderWidth: 1,
        borderColor: '#FFC107'
    },
    statusText: { color: '#FFC107', fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },

    dateBadge: {
        position: 'absolute',
        top: 12,
        right: 12,
        backgroundColor: 'rgba(255,255,255,0.9)',
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 5,
        alignItems: 'center',
    },
    dateMonth: { fontSize: 10, fontWeight: '800', color: '#000' },
    dateDay: { fontSize: 16, fontWeight: '900', color: '#000' },

    // INFO
    infoContainer: {},
    eventTitle: { color: '#FFF', fontSize: 20, fontWeight: '800', marginBottom: 4 },
    locationRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    locationText: { color: '#AAA', fontSize: 12 },

    // CONTROL PANEL
    controlPanel: {
        backgroundColor: '#18181B',
        borderBottomLeftRadius: 16,
        borderBottomRightRadius: 16,
        padding: 16,
        position: 'relative',
    },
    perforationRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        position: 'absolute',
        top: -6,
        left: 10,
        right: 10,
        overflow: 'hidden',
    },
    dot: { width: 8, height: 2, backgroundColor: '#333', borderRadius: 1 },

    // ACTIONS
    actionRow: { flexDirection: 'row', gap: 12 },
    declineBtn: {
        flex: 1,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#333',
        borderRadius: 12,
    },
    declineText: { color: '#AAA', fontWeight: '600' },
    acceptBtn: { flex: 1 },
    acceptGradient: {
        flex: 1,
        height: 44,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 12,
        gap: 8,
    },
    acceptText: { color: '#FFF', fontWeight: '700' },

    // TICKET META (CLEAN)
    ticketMetaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    metaBlock: { },
    metaLabel: { color: '#555', fontSize: 10, fontWeight: '700', marginBottom: 2 },
    metaValue: { color: '#DDD', fontSize: 14, fontWeight: '700', fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' },

    // EMPTY
    emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 100 },
    emptyTitle: { color: '#FFF', fontSize: 18, fontWeight: '700', marginTop: 16 },
    emptySubtitle: { color: '#666', fontSize: 14, marginTop: 8, textAlign: 'center', maxWidth: 250 },
});