// screens/HomeScreen.js

import React, { useState, useCallback } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, FlatList, Alert, ActivityIndicator } from 'react-native';
import { getEvents } from '../services/api';
import { useFocusEffect } from '@react-navigation/native';

// A new, redesigned EventCard component
const EventCard = ({ event, onPress }) => (
  <TouchableOpacity onPress={onPress}>
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{event.name}</Text>
      <Text style={styles.cardDetail}>Location: {event.location}</Text>
      <View style={styles.cardFooter}>
        <Text style={styles.cardDate}>{new Date(event.date).toLocaleDateString()}</Text>
        <Text style={styles.cardPrice}>₹{event.ticketPrice}</Text>
      </View>
    </View>
  </TouchableOpacity>
);

export default function HomeScreen({ navigation, onLogout }) {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchEvents = async () => {
    try {
      const response = await getEvents();
      setEvents(response.data);
    } catch (error) {
      Alert.alert("Error", "Could not load events.");
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { setIsLoading(true); fetchEvents(); }, []));

  if (isLoading) {
    return <View style={styles.container}><ActivityIndicator size="large" color="#FFFFFF" /></View>;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={events}
        renderItem={({ item }) => (
          <EventCard
            event={item}
            onPress={() => navigation.navigate('EventDetail', { eventId: item._id })}
          />
        )}
        keyExtractor={(item) => item._id}
        style={styles.list}
        ListFooterComponent={() => (
            <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
              <Text style={styles.logoutButtonText}>Logout</Text>
            </TouchableOpacity>
        )}
      />
    </View>
  );
}

// --- NEW, REDESIGNED STYLESHEET ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  list: {
    padding: 20,
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
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 15,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#333333',
  },
  cardDate: {
    fontSize: 14,
    color: '#AAAAAA',
  },
  cardPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  logoutButton: {
    backgroundColor: '#1E1E1E',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 40,
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});