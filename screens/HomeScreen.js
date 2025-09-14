// screens/HomeScreen.js

import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, FlatList, Alert } from 'react-native';
import { getEvents } from '../services/api';

// This EventCard component is correct.
const EventCard = ({ event, onPress }) => (
  <TouchableOpacity onPress={onPress}>
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{event.name}</Text>
      <Text style={styles.cardDetail}>Location: {event.location}</Text>
      <Text style={styles.cardDetail}>Date: {new Date(event.date).toLocaleDateString()}</Text>
      <Text style={styles.cardPrice}>₹{event.ticketPrice}</Text>
    </View>
  </TouchableOpacity>
);

// This is the corrected HomeScreen component.
export default function HomeScreen({ navigation, onLogout }) {
  const [events, setEvents] = useState([]);

  // --- THIS IS THE CORRECTED PART ---
  // This useEffect will run once when the HomeScreen is first shown
  // and will fetch the list of events from the backend.
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await getEvents();
        setEvents(response.data);
      } catch (error) {
        console.error("Failed to fetch events:", error);
        Alert.alert("Error", "Could not load events.");
      }
    };
    fetchEvents();
  }, []); // The empty array [] means this runs only once.

  return (
    <View style={styles.container}>
      {/* The FlatList is correct and will now have data to display. */}
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
      />
      <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

// The styles are correct.
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    // We remove the paddingTop here because the navigator will handle the header area.
    paddingHorizontal: 20,
  },
  buttonText: {
    color: '#121212',
    fontSize: 18,
    fontWeight: 'bold',
  },
  logoutButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#CF6679',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  list: {
    width: '100%',
  },
  card: {
    backgroundColor: '#1E1E1E',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    width: '100%',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  cardDetail: {
    fontSize: 14,
    color: '#AAAAAA',
    marginTop: 5,
  },
  cardPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#BB86FC',
    marginTop: 10,
    alignSelf: 'flex-end',
  },
});