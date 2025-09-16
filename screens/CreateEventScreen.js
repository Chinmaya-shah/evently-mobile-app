// screens/CreateEventScreen.js

import React, { useState, useEffect } from 'react';
import {
  StyleSheet, Text, View, TextInput, TouchableOpacity,
  Alert, ScrollView, ActivityIndicator, Platform
} from 'react-native';
// --- 1. IMPORT THE NEW DATEPICKER COMPONENT ---
import DateTimePicker from '@react-native-community/datetimepicker';
import { createEvent, getEventById, updateEvent } from '../services/api';
import { Ionicons } from '@expo/vector-icons';

export default function CreateEventScreen({ route, navigation }) {
  // Check if an eventId was passed via navigation parameters to determine the mode.
  const eventId = route.params?.eventId;
  const isEditMode = Boolean(eventId);

  // --- 2. NEW STATE VARIABLES for the date picker ---
  const [date, setDate] = useState(new Date()); // The actual date object
  const [showDatePicker, setShowDatePicker] = useState(false); // Controls visibility of the picker

  // State for all other form fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [ticketPrice, setTicketPrice] = useState('');
  const [capacity, setCapacity] = useState('');
  const [isLoading, setIsLoading] = useState(isEditMode);

  // This function is called when the user selects a date from the picker.
  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === 'ios'); // On iOS, the user dismisses it manually
    if (selectedDate) {
      setDate(selectedDate); // Update our state with the new date
    }
  };

  // This useEffect hook runs only if we are in "Edit Mode".
  useEffect(() => {
    if (isEditMode) {
      const fetchEventData = async () => {
        try {
          const response = await getEventById(eventId);
          const event = response.data;
          setName(event.name);
          setDescription(event.description);
          setDate(new Date(event.date)); // Use the date object
          setLocation(event.location);
          setTicketPrice(event.ticketPrice.toString());
          setCapacity(event.capacity.toString());
        } catch (error) { Alert.alert("Error", "Could not load event data for editing."); }
        finally { setIsLoading(false); }
      };
      fetchEventData();
    }
  }, [eventId]);

  // This function handles the form submission.
  const handleSubmit = async () => {
    if (!name || !description || !date || !location || !ticketPrice || !capacity) {
      return Alert.alert('Error', 'Please fill out all fields.');
    }

    // We now use the 'date' object from our state and convert it to a standard format.
    const eventData = {
      name, description, date: date.toISOString(), location,
      ticketPrice: Number(ticketPrice),
      capacity: Number(capacity),
      eventImage: 'https://placehold.co/600x400/png?text=New+Event',
    };

    try {
      if (isEditMode) {
        await updateEvent(eventId, eventData);
        Alert.alert('Success', 'Your event has been updated!', [{ text: 'OK', onPress: () => navigation.navigate('Dashboard') }]);
      } else {
        await createEvent(eventData);
        Alert.alert('Success', 'Your event has been created!', [{ text: 'OK', onPress: () => navigation.navigate('Dashboard') }]);
      }
    } catch (error) {
      Alert.alert('Error', `Failed to ${isEditMode ? 'update' : 'create'} event. Please try again.`);
    }
  };

  if (isLoading) {
    return <View style={styles.loadingContainer}><ActivityIndicator size="large" color="#FFFFFF" /></View>;
  }

  return (
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 50 }}>
        <Text style={styles.header}>{isEditMode ? 'Edit Event' : 'Create New Event'}</Text>

        <TextInput style={styles.input} placeholder="Event Name" placeholderTextColor="#AAAAAA" value={name} onChangeText={setName} />
        <TextInput style={[styles.input, { height: 120 }]} placeholder="Description" placeholderTextColor="#AAAAAA" value={description} onChangeText={setDescription} multiline />

        {/* --- 3. THE DATE PICKER UI --- */}
        <TouchableOpacity style={styles.input} onPress={() => setShowDatePicker(true)}>
          <View style={styles.datePickerContainer}>
            <Ionicons name="calendar-outline" size={24} color="#AAAAAA" />
            <Text style={styles.datePickerText}>{date.toLocaleDateString()}</Text>
          </View>
        </TouchableOpacity>
        {/* This is the actual DateTimePicker component. It's only visible when showDatePicker is true. */}
        {showDatePicker && (
            <DateTimePicker
                value={date}
                mode="date"
                display="spinner"
                onChange={onDateChange}
                // --- THIS IS THE CRITICAL FIX for the invisible text ---
                themeVariant="dark" // This tells the picker to use its native dark mode style on iOS
                textColor="white"     // This explicitly sets the text color for iOS
            />
        )}

        <TextInput style={styles.input} placeholder="Location" placeholderTextColor="#AAAAAA" value={location} onChangeText={setLocation} />
        <TextInput style={styles.input} placeholder="Ticket Price (₹)" placeholderTextColor="#AAAAAA" value={ticketPrice} onChangeText={setTicketPrice} keyboardType="numeric" />
        <TextInput style={styles.input} placeholder="Capacity" placeholderTextColor="#AAAAAA" value={capacity} onChangeText={setCapacity} keyboardType="numeric" />

        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}>{isEditMode ? 'Save Changes' : 'Create Event'}</Text>
        </TouchableOpacity>
      </ScrollView>
  );
}

// --- UPDATED STYLESHEET ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000', padding: 20 },
  loadingContainer: { flex: 1, backgroundColor: '#000000', justifyContent: 'center', alignItems: 'center' },
  header: { fontSize: 36, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 30 },
  input: {
    width: '100%',
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    padding: 20,
    color: '#FFFFFF',
    marginBottom: 15,
    fontSize: 16,
    justifyContent: 'center',
    minHeight: 55, // Ensure consistent height for tappable areas
  },
  // New styles for the date picker button
  datePickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  datePickerText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginLeft: 10,
  },
  button: { backgroundColor: '#FFFFFF', padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 20 },
  buttonText: { color: '#000000', fontSize: 18, fontWeight: 'bold' },
});