import React, { useState, useCallback } from 'react';
import {
    StyleSheet, Text, View, ScrollView, RefreshControl,
    ActivityIndicator, StatusBar
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { getMyEvents, getRecentActivities, getUserProfile } from '../services/api';

// --- HELPER: Time Ago ---
const timeAgo = (date) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return "Just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
};

// --- COMPONENT: Activity Item ---
const ActivityItem = ({ type, message, time }) => {
    let iconName = 'activity';
    let iconColor = '#AAA';
    let bgColor = '#333';

    if (type === 'ticket') {
        iconName = 'tag';
        iconColor = '#60A5FA'; // Blue
        bgColor = 'rgba(96, 165, 250, 0.1)';
    } else if (type === 'event') {
        iconName = 'calendar';
        iconColor = '#34D399'; // Green
        bgColor = 'rgba(52, 211, 153, 0.1)';
    } else if (type === 'payment') {
        iconName = 'dollar-sign';
        iconColor = '#FBBF24'; // Yellow
        bgColor = 'rgba(251, 191, 36, 0.1)';
    }

    return (
        <View style={styles.activityItem}>
            <View style={[styles.activityIconBox, { backgroundColor: bgColor }]}>
                <Feather name={iconName} size={16} color={iconColor} />
            </View>
            <View style={styles.activityContent}>
                <Text style={styles.activityMessage}>{message}</Text>
                <Text style={styles.activityTime}>{time}</Text>
            </View>
        </View>
    );
};

export default function OrganizerDashboardScreen({ navigation }) {
    const [stats, setStats] = useState({ totalTicketsSold: 0, activeEvents: 0, totalRevenue: 0 });
    const [recentActivities, setRecentActivities] = useState([]);
    const [organizerName, setOrganizerName] = useState('Organizer');
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchData = async () => {
        try {
            // 1. Fetch Profile (for name)
            const profileRes = await getUserProfile();
            setOrganizerName(profileRes.data.name || 'Organizer');

            // 2. Fetch Events & Activities
            const [myEventsRes, activitiesRes] = await Promise.all([
                getMyEvents(),
                getRecentActivities()
            ]);

            const myEvents = myEventsRes.data || [];
            const activities = activitiesRes.data || [];

            // 3. Calculate Stats locally
            const totalTicketsSold = myEvents.reduce((acc, event) => acc + (event.ticketsSold || 0), 0);
            const activeEvents = myEvents.length;
            const totalRevenue = myEvents.reduce((acc, event) => acc + ((event.ticketsSold || 0) * (event.ticketPrice || 0)), 0);

            setStats({ totalTicketsSold, activeEvents, totalRevenue });
            setRecentActivities(activities);

        } catch (error) {
            console.error("Dashboard Sync Error:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchData();
    }, []);

    useFocusEffect(
        useCallback(() => {
            setLoading(true);
            fetchData();
        }, [])
    );

    const formatCurrency = (amount) => {
        return `₹${amount.toLocaleString('en-IN')}`;
    };

    if (loading && !refreshing) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#22D3EE" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

            <LinearGradient
                colors={['#000', '#111', '#000']}
                style={StyleSheet.absoluteFill}
            />

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#22D3EE" />
                }
                showsVerticalScrollIndicator={false}
            >
                {/* 1. Header */}
                <View style={styles.header}>
                    <Text style={styles.greeting}>Welcome back,</Text>
                    <Text style={styles.organizerName}>{organizerName}</Text>
                </View>

                {/* 2. Bento Grid Stats */}
                <View style={styles.bentoGrid}>

                    {/* Hero Card: Revenue */}
                    <LinearGradient colors={['#18181B', '#121212']} style={styles.revenueCard}>
                        <View>
                            <Text style={styles.statLabel}>Total Revenue</Text>
                            <Text style={styles.revenueValue}>{formatCurrency(stats.totalRevenue)}</Text>
                        </View>
                        <View style={[styles.iconCircle, { backgroundColor: 'rgba(34, 211, 238, 0.1)' }]}>
                            <Feather name="trending-up" size={24} color="#22D3EE" />
                        </View>
                    </LinearGradient>

                    {/* Row: Tickets & Events */}
                    <View style={styles.gridRow}>
                        <LinearGradient colors={['#18181B', '#121212']} style={styles.smallCard}>
                            <Feather name="tag" size={20} color="#F472B6" style={{ marginBottom: 12 }} />
                            <Text style={styles.smallCardValue}>{stats.totalTicketsSold}</Text>
                            <Text style={styles.statLabel}>Tickets Sold</Text>
                        </LinearGradient>

                        <LinearGradient colors={['#18181B', '#121212']} style={styles.smallCard}>
                            <Feather name="calendar" size={20} color="#A78BFA" style={{ marginBottom: 12 }} />
                            <Text style={styles.smallCardValue}>{stats.activeEvents}</Text>
                            <Text style={styles.statLabel}>Active Events</Text>
                        </LinearGradient>
                    </View>
                </View>

                {/* 3. Recent Activity */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Recent Activity</Text>

                    <View style={styles.activityList}>
                        {recentActivities.length === 0 ? (
                            <View style={styles.emptyState}>
                                <Feather name="activity" size={24} color="#444" />
                                <Text style={styles.emptyText}>No recent activity logged.</Text>
                            </View>
                        ) : (
                            recentActivities.map((item, index) => (
                                <ActivityItem
                                    key={item._id || index}
                                    type={item.type}
                                    message={item.message}
                                    time={timeAgo(item.createdAt)}
                                />
                            ))
                        )}
                    </View>
                </View>

            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    loadingContainer: { flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' },
    scrollContent: { paddingBottom: 100, paddingTop: 60, paddingHorizontal: 20 },

    // HEADER
    header: { marginBottom: 30 },
    greeting: { color: '#AAA', fontSize: 16 },
    organizerName: { color: '#FFF', fontSize: 32, fontWeight: '800' },

    // BENTO GRID
    bentoGrid: { gap: 12, marginBottom: 40 },

    // Revenue Card (Full Width)
    revenueCard: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#18181B',
        padding: 24,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
    },
    revenueValue: { color: '#FFF', fontSize: 28, fontWeight: '800', marginTop: 4 },
    iconCircle: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },

    // Grid Row (2 Columns)
    gridRow: { flexDirection: 'row', gap: 12 },
    smallCard: {
        flex: 1,
        backgroundColor: '#18181B',
        padding: 20,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
    },
    smallCardValue: { color: '#FFF', fontSize: 24, fontWeight: '800', marginBottom: 4 },
    statLabel: { color: '#888', fontSize: 12, fontWeight: '600' },

    // SECTIONS
    section: { marginBottom: 20 },
    sectionTitle: { color: '#FFF', fontSize: 18, fontWeight: '700', marginBottom: 16 },

    // ACTIVITY LIST
    activityList: {
        backgroundColor: '#121212',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
        overflow: 'hidden'
    },
    activityItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)'
    },
    activityIconBox: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
    activityContent: { flex: 1 },
    activityMessage: { color: '#DDD', fontSize: 14, marginBottom: 4 },
    activityTime: { color: '#666', fontSize: 12 },

    emptyState: { padding: 40, alignItems: 'center' },
    emptyText: { color: '#666', marginTop: 10 },
});