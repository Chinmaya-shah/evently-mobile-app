// screens/HomeScreen.js

import React, { useState, useCallback } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, FlatList, Alert, ActivityIndicator } from 'react-native';
import { getEvents } from '../services/api';
import { useFocusEffect } from '@react-navigation/native';

// A redesigned EventCard component that matches our theme
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

// The component no longer receives or needs the onLogout prop
export default function HomeScreen({ navigation }) {
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

  // useFocusEffect re-fetches events every time the user comes back to this screen
  useFocusEffect(useCallback(() => {
    setIsLoading(true);
    fetchEvents();
  }, []));

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
            // --- THE LOGOUT BUTTON (ListFooterComponent) HAS BEEN REMOVED ---
            contentContainerStyle={{ paddingBottom: 20 }} // Add padding to the bottom of the list
        />
      </View>
  );
}

// The complete, cleaned StyleSheet without the old logout button styles
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
});