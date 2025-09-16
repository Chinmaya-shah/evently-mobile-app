// screens/EventDetailScreen.js

import React, { useState, useEffect } from 'react';
import {
  StyleSheet, Text, View, Alert, ActivityIndicator,
  TouchableOpacity, ScrollView, TextInput
} from 'react-native';
import { getEventById, purchaseTicket, requestGroupTickets } from '../services/api';

export default function EventDetailScreen({ route, navigation }) {
  const { eventId } = route.params;
  const [event, setEvent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [attendeeEmails, setAttendeeEmails] = useState([]);

  // This function updates an email in our state array when the user types.
  const handleEmailChange = (text, index) => {
    const newEmails = [...attendeeEmails];
    newEmails[index] = text;
    setAttendeeEmails(newEmails);
  };

  // This function updates the quantity and the number of email fields.
  const handleQuantityChange = (newQuantity) => {
    if (newQuantity >= 1 && newQuantity <= 5) {
      setQuantity(newQuantity);
      setAttendeeEmails(new Array(newQuantity - 1).fill(''));
    }
  };

  // This useEffect fetches the event details when the screen loads.
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await getEventById(eventId);
        setEvent(response.data);
      } catch (error) {
        console.error("Failed to fetch event details:", error);
        Alert.alert("Error", "Could not load event details.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchEvent();
  }, [eventId]);

  // This function handles the purchase of a single ticket.
  const handlePurchase = async () => {
    setIsPurchasing(true);
    try {
      const response = await purchaseTicket(event._id);
      if (response.data) {
        Alert.alert(
            "Purchase Successful!",
            `Your ticket for ${event.name} has been minted.`,
            [{ text: "OK", onPress: () => navigation.goBack() }]
        );
      }
    } catch (error) {
      Alert.alert("Purchase Failed", error.response?.data?.message || "An error occurred.");
    } finally {
      setIsPurchasing(false);
    }
  };

  // This function handles creating a group reservation.
  const handleGroupPurchase = async () => {
    if (attendeeEmails.some(email => email.trim() === '')) {
      Alert.alert("Error", "Please fill out all email fields for your friends.");
      return;
    }
    setIsPurchasing(true);
    try {
      const response = await requestGroupTickets(event._id, attendeeEmails);
      if (response.data) {
        Alert.alert(
            "Reservation Created!",
            `Invitations have been sent. This booking will be finalized shortly.`,
            [{ text: "OK", onPress: () => navigation.goBack() }]
        );
      }
    } catch (error) {
      Alert.alert("Reservation Failed", error.response?.data?.message || "An error occurred.");
    } finally {
      setIsPurchasing(false);
    }
  };


  if (isLoading) {
    return <View style={styles.loadingContainer}><ActivityIndicator size="large" color="#FFFFFF" /></View>;
  }

  if (!event) {
    return <View style={styles.container}><Text style={styles.errorText}>Event not found.</Text></View>;
  }

  return (
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.container}>
        <Text style={styles.title}>{event?.name}</Text>
        <Text style={styles.detail}><Text style={styles.detailLabel}>Location:</Text> {event?.location}</Text>
        <Text style={styles.detail}><Text style={styles.detailLabel}>Date:</Text> {new Date(event?.date).toDateString()}</Text>
        <Text style={styles.description}>{event?.description}</Text>

        <View style={styles.quantityContainer}>
          <Text style={styles.quantityLabel}>Tickets:</Text>
          <TouchableOpacity style={styles.quantityButton} onPress={() => handleQuantityChange(quantity - 1)}><Text style={styles.quantityButtonText}>-</Text></TouchableOpacity>
          <Text style={styles.quantityValue}>{quantity}</Text>
          <TouchableOpacity style={styles.quantityButton} onPress={() => handleQuantityChange(quantity + 1)}><Text style={styles.quantityButtonText}>+</Text></TouchableOpacity>
        </View>

        {quantity > 1 && (
            <View style={styles.groupContainer}>
              <Text style={styles.groupTitle}>Enter Your Friend's Email(s):</Text>
              {attendeeEmails.map((email, index) => (
                  <TextInput
                      key={index}
                      style={styles.input}
                      placeholder={`Friend ${index + 1} Email`}
                      placeholderTextColor="#AAAAAA"
                      value={email}
                      onChangeText={(text) => handleEmailChange(text, index)}
                      keyboardType="email-address"
                      autoCapitalize="none"
                  />
              ))}
            </View>
        )}

        {quantity === 1 ? (
            <TouchableOpacity style={styles.button} onPress={handlePurchase} disabled={isPurchasing}>
              {isPurchasing ? <ActivityIndicator color="#000000" /> : <Text style={styles.buttonText}>Buy for Myself (₹{event?.ticketPrice})</Text>}
            </TouchableOpacity>
        ) : (
            <TouchableOpacity style={styles.button} onPress={handleGroupPurchase} disabled={isPurchasing}>
              {isPurchasing ? <ActivityIndicator color="#000000" /> : <Text style={styles.buttonText}>Reserve for Group (₹{event?.ticketPrice * quantity})</Text>}
            </TouchableOpacity>
        )}
      </ScrollView>
  );
}

// --- NEW, REDESIGNED STYLESHEET ---
const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: '#000000',
  },
  container: {
    backgroundColor: '#000000',
    padding: 20,
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 25,
  },
  detail: {
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 10,
  },
  detailLabel: {
    color: '#AAAAAA', // A softer grey for labels
  },
  description: {
    fontSize: 16,
    color: '#AAAAAA',
    marginTop: 20,
    marginBottom: 40,
    lineHeight: 24, // Improves readability
  },
  button: {
    width: '100%',
    height: 55,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  buttonText: {
    color: '#000000',
    fontSize: 18,
    fontWeight: 'bold',
  },
  errorText: {
    color: '#FFFFFF',
    fontSize: 18,
    alignSelf: 'center',
    marginTop: 50,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
    paddingVertical: 20,
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
  },
  quantityLabel: {
    fontSize: 18,
    color: '#FFFFFF',
    marginRight: 20,
  },
  quantityButton: {
    width: 40,
    height: 40,
    backgroundColor: '#333333',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  quantityValue: {
    fontSize: 22,
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginHorizontal: 20,
  },
  groupContainer: {
    width: '100%',
    marginBottom: 20,
  },
  groupTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 15,
  },
  input: {
    width: '100%',
    height: 55,
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    paddingHorizontal: 20,
    color: '#FFFFFF',
    marginBottom: 10,
    fontSize: 16,
  },
});