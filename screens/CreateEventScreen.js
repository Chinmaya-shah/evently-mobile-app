// screens/CreateEventScreen.js

import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, ScrollView, ActivityIndicator } from 'react-native';
// We now need all three of these API functions
import { createEvent, getEventById, updateEvent } from '../services/api';

// The screen now receives 'route' as a prop to check for parameters
export default function CreateEventScreen({ route, navigation }) {
  // Check if an eventId was passed. If it was, we are in "Edit Mode".
  const eventId = route.params?.eventId;
  const isEditMode = Boolean(eventId);

  // State for all our form fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [ticketPrice, setTicketPrice] = useState('');
  const [capacity, setCapacity] = useState('');
  const [isLoading, setIsLoading] = useState(isEditMode); // Show loader if in edit mode

  // This useEffect hook runs only if we are in "Edit Mode".
  useEffect(() => {
    if (isEditMode) {
      const fetchEventData = async () => {
        try {
          const response = await getEventById(eventId);
          const event = response.data;
          // Pre-fill all the form fields with the data from the backend
          setName(event.name);
          setDescription(event.description);
          setDate(new Date(event.date).toISOString().split('T')[0]); // Format date for input
          setLocation(event.location);
          setTicketPrice(event.ticketPrice.toString());
          setCapacity(event.capacity.toString());
        } catch (error) {
          Alert.alert("Error", "Could not load event data for editing.");
        } finally {
          setIsLoading(false);
        }
      };
      fetchEventData();
    }
  }, [eventId]); // It runs only when the component loads with an eventId

  const handleSubmit = async () => {
    if (!name || !description || !date || !location || !ticketPrice || !capacity) {
      return Alert.alert('Error', 'Please fill out all fields.');
    }

    const eventData = {
      name, description, date, location,
      ticketPrice: Number(ticketPrice),
      capacity: Number(capacity),
      eventImage: 'https://placehold.co/600x400/png?text=New+Event',
    };

    try {
      if (isEditMode) {
        // If in edit mode, call the updateEvent function
        await updateEvent(eventId, eventData);
        Alert.alert('Success', 'Your event has been updated!', [
          { text: 'OK', onPress: () => navigation.navigate('Dashboard') }
        ]);
      } else {
        // If in create mode, call the createEvent function
        await createEvent(eventData);
        Alert.alert('Success', 'Your event has been created!', [
          { text: 'OK', onPress: () => navigation.navigate('Dashboard') }
        ]);
      }
    } catch (error) {
      Alert.alert('Error', `Failed to ${isEditMode ? 'update' : 'create'} event. Please try again.`);
    }
  };

  if (isLoading) {
    return <View style={styles.loadingContainer}><ActivityIndicator size="large" color="#03DAC5" /></View>;
  }

  return (
    <ScrollView style={styles.container}>
      {/* The title changes based on the mode */}
      <Text style={styles.header}>{isEditMode ? 'Edit Event' : 'Create New Event'}</Text>

      <TextInput style={styles.input} placeholder="Event Name" placeholderTextColor="#888" value={name} onChangeText={setName} />
      <TextInput style={styles.input} placeholder="Description" placeholderTextColor="#888" value={description} onChangeText={setDescription} multiline />
      <TextInput style={styles.input} placeholder="Date (YYYY-MM-DD)" placeholderTextColor="#888" value={date} onChangeText={setDate} />
      <TextInput style={styles.input} placeholder="Location" placeholderTextColor="#888" value={location} onChangeText={setLocation} />
      <TextInput style={styles.input} placeholder="Ticket Price (₹)" placeholderTextColor="#888" value={ticketPrice} onChangeText={setTicketPrice} keyboardType="numeric" />
      <TextInput style={styles.input} placeholder="Capacity" placeholderTextColor="#888" value={capacity} onChangeText={setCapacity} keyboardType="numeric" />

      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        {/* The button text also changes based on the mode */}
        <Text style={styles.buttonText}>{isEditMode ? 'Save Changes' : 'Create Event'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', padding: 20 },
  loadingContainer: { flex: 1, backgroundColor: '#121212', justifyContent: 'center', alignItems: 'center' },
  header: { fontSize: 32, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 30 },
  input: { width: '100%', backgroundColor: '#1E1E1E', borderRadius: 10, padding: 15, color: '#FFFFFF', marginBottom: 15, fontSize: 16 },
  button: { backgroundColor: '#03DAC5', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 20 },
  buttonText: { color: '#121212', fontSize: 18, fontWeight: 'bold' },
});