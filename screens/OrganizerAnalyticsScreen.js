import React, { useState, useEffect, useCallback } from 'react';
import {
    StyleSheet, Text, View, ScrollView, TouchableOpacity,
    ActivityIndicator, TextInput, Linking, StatusBar, Dimensions, FlatList
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { getMyEvents, getEventAnalytics } from '../services/api';
import { useFocusEffect } from '@react-navigation/native';

const { width } = Dimensions.get('window');

// --- COMPONENT: Stat Card ---
const AnalyticsStatCard = ({ label, value, subtext, icon, color }) => (
    <View style={styles.statCard}>
        <View style={styles.statHeader}>
            <Text style={styles.statLabel}>{label}</Text>
            <Feather name={icon} size={16} color={color} />
        </View>
        <Text style={styles.statValue}>{value}</Text>
        {subtext && <Text style={[styles.statSubtext, { color }]}>{subtext}</Text>}
    </View>
);

// --- COMPONENT: Audit Log Card ---
const AuditLogCard = ({ attendee }) => {
    const openPolygonScan = () => {
        if (attendee.txHash && attendee.txHash !== 'N/A') {
            Linking.openURL(`https://amoy.polygonscan.com/tx/${attendee.txHash}`);
        }
    };

    const statusColor =
        attendee.status === 'confirmed' ? '#10B981' :
        attendee.status === 'used' ? '#6B7280' : '#EF4444';

    return (
        <View style={styles.auditCard}>
            <View style={styles.auditRow}>
                <Text style={styles.auditName}>{attendee.name}</Text>
                <View style={[styles.statusBadge, { borderColor: statusColor, backgroundColor: `${statusColor}10` }]}>
                    <Text style={[styles.statusText, { color: statusColor }]}>{attendee.status}</Text>
                </View>
            </View>
            <Text style={styles.auditEmail}>{attendee.email}</Text>
            <View style={styles.auditMetaRow}>
                <Text style={styles.auditID}>ID: {attendee.ticketId?.slice(-6).toUpperCase()}</Text>
                <Text style={styles.auditDate}>{new Date(attendee.purchaseDate).toLocaleDateString()}</Text>
            </View>
            <TouchableOpacity
                style={styles.hashButton}
                onPress={openPolygonScan}
                disabled={!attendee.txHash || attendee.txHash === 'N/A'}
            >
                <MaterialCommunityIcons name="link-variant" size={14} color="#3B82F6" />
                <Text style={styles.hashText}>
                    {attendee.txHash && attendee.txHash !== 'N/A'
                        ? `${attendee.txHash.slice(0, 10)}...${attendee.txHash.slice(-4)}`
                        : 'Transaction Pending / Sim'}
                </Text>
            </TouchableOpacity>
        </View>
    );
};

export default function OrganizerAnalyticsScreen() {
    const [events, setEvents] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState(null); // Whole event object
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Dropdown State
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    // 1. Fetch Events on Mount
    useFocusEffect(
        useCallback(() => {
            const fetchEvents = async () => {
                try {
                    const res = await getMyEvents();
                    const eventList = res.data || [];
                    setEvents(eventList);

                    // Auto-select first event if none selected
                    if (eventList.length > 0 && !selectedEvent) {
                        setSelectedEvent(eventList[0]);
                    }
                } catch (err) {
                    console.error("Failed to load events", err);
                }
            };
            fetchEvents();
        }, [])
    );

    // 2. Fetch Analytics when Event Changes
    useEffect(() => {
        if (!selectedEvent?._id) return;

        const fetchAnalyticsData = async () => {
            setLoading(true);
            try {
                console.log(`Fetching Analytics for: ${selectedEvent._id}`);
                const res = await getEventAnalytics(selectedEvent._id);
                setAnalytics(res.data);
            } catch (err) {
                console.error("Analytics API Error:", err);
                // Fallback to basic data from the event object itself if API fails
                setAnalytics({
                    totalRevenue: (selectedEvent.ticketsSold || 0) * (selectedEvent.ticketPrice || 0),
                    ticketsSold: selectedEvent.ticketsSold || 0,
                    capacity: selectedEvent.capacity || 100,
                    attendees: [] // We can't guess attendees
                });
            } finally {
                setLoading(false);
            }
        };

        fetchAnalyticsData();
    }, [selectedEvent]);

    const handleSelectEvent = (event) => {
        setSelectedEvent(event);
        setIsDropdownOpen(false);
    };

    const filteredAttendees = analytics?.attendees?.filter(a =>
        (a.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (a.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (a.ticketId || '').toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

    const formatCurrency = (amount) => `₹${(amount || 0).toLocaleString('en-IN')}`;

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
            <LinearGradient colors={['#000', '#111', '#000']} style={StyleSheet.absoluteFill} />

            {/* HEADER */}
            <View style={styles.header}>
                <Text style={styles.pageTitle}>Event Analytics</Text>

                {/* --- CUSTOM DROPDOWN --- */}
                <View style={styles.dropdownContainer}>
                    <TouchableOpacity
                        style={styles.dropdownButton}
                        onPress={() => setIsDropdownOpen(!isDropdownOpen)}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.dropdownText} numberOfLines={1}>
                            {selectedEvent ? selectedEvent.name : "Select an Event"}
                        </Text>
                        <Feather name={isDropdownOpen ? "chevron-up" : "chevron-down"} size={20} color="#22D3EE" />
                    </TouchableOpacity>

                    {/* Dropdown List (Absolute Positioned) */}
                    {isDropdownOpen && (
                        <View style={styles.dropdownList}>
                            <ScrollView nestedScrollEnabled style={{ maxHeight: 200 }}>
                                {events.map((event) => (
                                    <TouchableOpacity
                                        key={event._id}
                                        style={styles.dropdownItem}
                                        onPress={() => handleSelectEvent(event)}
                                    >
                                        <Text style={[
                                            styles.dropdownItemText,
                                            selectedEvent?._id === event._id && styles.dropdownItemTextActive
                                        ]}>
                                            {event.name}
                                        </Text>
                                        {selectedEvent?._id === event._id && (
                                            <Feather name="check" size={16} color="#22D3EE" />
                                        )}
                                    </TouchableOpacity>
                                ))}
                                {events.length === 0 && (
                                    <View style={styles.dropdownItem}>
                                        <Text style={styles.dropdownItemText}>No events found</Text>
                                    </View>
                                )}
                            </ScrollView>
                        </View>
                    )}
                </View>
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#22D3EE" />
                </View>
            ) : !analytics ? (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyText}>Select an event to view analytics.</Text>
                </View>
            ) : (
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                    {/* BENTO STATS */}
                    <View style={styles.statsRow}>
                        <LinearGradient colors={['#18181B', '#121212']} style={styles.revenueCard}>
                            <View>
                                <Text style={styles.statLabel}>Total Revenue</Text>
                                <Text style={styles.revenueValue}>{formatCurrency(analytics.totalRevenue)}</Text>
                            </View>
                            <View style={styles.iconCircle}>
                                <Feather name="dollar-sign" size={24} color="#10B981" />
                            </View>
                        </LinearGradient>
                    </View>

                    <View style={styles.statsRow}>
                        <AnalyticsStatCard
                            label="Tickets Sold"
                            value={`${analytics.ticketsSold}/${analytics.capacity}`}
                            subtext={`${analytics.capacity > 0 ? Math.round((analytics.ticketsSold / analytics.capacity) * 100) : 0}% Sold`}
                            icon="tag"
                            color="#22D3EE"
                        />
                        <AnalyticsStatCard
                            label="Check-ins"
                            value={analytics.attendees ? analytics.attendees.filter(a => a.status === 'used').length : 0}
                            subtext="Checked In"
                            icon="user-check"
                            color="#F472B6"
                        />
                    </View>

                    {/* SEARCH & AUDIT LOG */}
                    <View style={styles.auditSection}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Blockchain Audit Log</Text>
                            <MaterialCommunityIcons name="shield-check" size={20} color="#10B981" />
                        </View>

                        <View style={styles.searchContainer}>
                            <Feather name="search" size={18} color="#666" style={{ marginRight: 10 }} />
                            <TextInput
                                placeholder="Search Name, Email or ID..."
                                placeholderTextColor="#666"
                                style={styles.searchInput}
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                            />
                        </View>

                        {filteredAttendees.length === 0 ? (
                            <View style={styles.emptyState}>
                                <Text style={styles.emptyText}>
                                    {analytics.attendees?.length === 0
                                        ? "No tickets sold yet."
                                        : "No records found matching your search."}
                                </Text>
                            </View>
                        ) : (
                            filteredAttendees.map((attendee, index) => (
                                <AuditLogCard key={index} attendee={attendee} />
                            ))
                        )}
                    </View>

                </ScrollView>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    scrollContent: { paddingHorizontal: 20, paddingBottom: 100 },

    // HEADER & DROPDOWN
    header: { paddingTop: 60, paddingBottom: 20, paddingHorizontal: 20, zIndex: 100 },
    pageTitle: { fontSize: 32, fontWeight: '800', color: '#FFF', marginBottom: 16 },

    dropdownContainer: { position: 'relative', zIndex: 100 },
    dropdownButton: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        backgroundColor: '#111', borderWidth: 1, borderColor: '#333',
        paddingHorizontal: 16, paddingVertical: 14, borderRadius: 12,
    },
    dropdownText: { color: '#FFF', fontSize: 16, fontWeight: '600' },

    dropdownList: {
        position: 'absolute', top: 55, left: 0, right: 0,
        backgroundColor: '#18181B', borderRadius: 12,
        borderWidth: 1, borderColor: '#333',
        shadowColor: "#000", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.5, shadowRadius: 10, elevation: 10,
        zIndex: 200,
    },
    dropdownItem: {
        paddingVertical: 14, paddingHorizontal: 16,
        borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)',
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'
    },
    dropdownItemText: { color: '#AAA', fontSize: 16 },
    dropdownItemTextActive: { color: '#22D3EE', fontWeight: 'bold' },

    // STATS
    statsRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
    revenueCard: {
        flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        padding: 20, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)'
    },
    revenueValue: { color: '#FFF', fontSize: 24, fontWeight: '800', marginTop: 4 },
    iconCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(16, 185, 129, 0.1)', alignItems: 'center', justifyContent: 'center' },

    statCard: {
        flex: 1, backgroundColor: '#18181B', padding: 16, borderRadius: 16,
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)'
    },
    statHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    statLabel: { color: '#888', fontSize: 12, fontWeight: '600', textTransform: 'uppercase' },
    statValue: { color: '#FFF', fontSize: 20, fontWeight: '800' },
    statSubtext: { fontSize: 12, fontWeight: '700', marginTop: 4 },

    // AUDIT LOG
    auditSection: { marginTop: 24 },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
    sectionTitle: { color: '#FFF', fontSize: 20, fontWeight: '700' },

    searchContainer: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: '#111', borderRadius: 12,
        paddingHorizontal: 16, height: 50, marginBottom: 20,
        borderWidth: 1, borderColor: '#222'
    },
    searchInput: { flex: 1, color: '#FFF', fontSize: 16 },

    auditCard: {
        backgroundColor: '#121212', borderRadius: 16, padding: 16, marginBottom: 12,
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)'
    },
    auditRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
    auditName: { color: '#FFF', fontSize: 16, fontWeight: '700' },
    statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, borderWidth: 1 },
    statusText: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase' },

    auditEmail: { color: '#888', fontSize: 12, marginBottom: 12 },
    auditMetaRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
    auditID: { color: '#555', fontFamily: 'monospace', fontSize: 12 },
    auditDate: { color: '#555', fontSize: 12 },

    hashButton: {
        flexDirection: 'row', alignItems: 'center', gap: 6,
        backgroundColor: 'rgba(59, 130, 246, 0.1)', padding: 10,
        borderRadius: 8, alignSelf: 'flex-start'
    },
    hashText: { color: '#3B82F6', fontFamily: 'monospace', fontSize: 10 },

    emptyState: { padding: 40, alignItems: 'center' },
    emptyText: { color: '#444' }
});