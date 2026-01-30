import React, { useState, useEffect } from 'react';
import {
  StyleSheet, Text, View, Alert, ActivityIndicator,
  TouchableOpacity, ScrollView, TextInput, Dimensions,
  ImageBackground, StatusBar, Platform, KeyboardAvoidingView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons, Feather, MaterialIcons } from '@expo/vector-icons';
import { getEventById, purchaseTicket, requestGroupTickets } from '../services/api';

const { width, height } = Dimensions.get('window');

export default function EventDetailScreen({ route, navigation }) {
  const { eventId } = route.params;
  const [event, setEvent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [attendeeEmails, setAttendeeEmails] = useState([]);

  // --- LOGIC HANDLERS ---

  const handleEmailChange = (text, index) => {
    const newEmails = [...attendeeEmails];
    newEmails[index] = text;
    setAttendeeEmails(newEmails);
  };

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity >= 1 && newQuantity <= 5) {
      setQuantity(newQuantity);
      // Adjust email array size based on quantity (quantity - 1 guests)
      const currentEmails = [...attendeeEmails];
      if (newQuantity > quantity) {
        // Add empty slots
        for (let i = 0; i < newQuantity - quantity; i++) currentEmails.push('');
      } else {
        // Remove slots
        currentEmails.splice(newQuantity - 1);
      }
      setAttendeeEmails(currentEmails);
    }
  };

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

  // --- RENDER HELPERS ---

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  if (!event) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>Event not found.</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{marginTop: 20}}>
            <Text style={{color: '#4F46E5'}}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const totalPrice = event.ticketPrice * quantity;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <ScrollView contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>

        {/* 1. Immersive Header Image */}
        <ImageBackground
          source={{ uri: event.eventImage || 'https://via.placeholder.com/800x600' }}
          style={styles.headerImage}
        >
          <LinearGradient
            colors={['rgba(0,0,0,0.3)', 'transparent', '#000']}
            style={styles.gradient}
          />

          {/* Back Button Overlay */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <BlurView intensity={30} tint="dark" style={styles.backButtonBlur}>
                <Ionicons name="arrow-back" size={24} color="#FFF" />
            </BlurView>
          </TouchableOpacity>
        </ImageBackground>

        {/* 2. Content Container (Overlapping) */}
        <View style={styles.contentContainer}>

          {/* Title & Category */}
          <View style={styles.headerSection}>
            <Text style={styles.categoryBadge}>{event.category || 'EVENT'}</Text>
            <Text style={styles.title}>{event.name}</Text>
          </View>

          {/* Info Grid */}
          <View style={styles.infoGrid}>
            <View style={styles.infoRow}>
                <View style={styles.iconBox}>
                    <Feather name="calendar" size={20} color="#4F46E5" />
                </View>
                <View>
                    <Text style={styles.infoLabel}>Date</Text>
                    <Text style={styles.infoValue}>{new Date(event.date).toDateString()}</Text>
                </View>
            </View>

            <View style={styles.infoRow}>
                <View style={styles.iconBox}>
                    <Feather name="map-pin" size={20} color="#EC4899" />
                </View>
                <View>
                    <Text style={styles.infoLabel}>Location</Text>
                    <Text style={styles.infoValue}>{event.location}</Text>
                </View>
            </View>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About Event</Text>
            <Text style={styles.description}>{event.description || 'No description provided.'}</Text>
          </View>

          {/* Ticket Configuration */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tickets</Text>

            <View style={styles.ticketSelector}>
                <Text style={styles.ticketLabel}>Number of Guests</Text>
                <View style={styles.counterControl}>
                    <TouchableOpacity
                        onPress={() => handleQuantityChange(quantity - 1)}
                        style={styles.counterBtn}
                    >
                        <Feather name="minus" size={18} color="#FFF" />
                    </TouchableOpacity>

                    <Text style={styles.counterValue}>{quantity}</Text>

                    <TouchableOpacity
                        onPress={() => handleQuantityChange(quantity + 1)}
                        style={[styles.counterBtn, { backgroundColor: '#4F46E5' }]}
                    >
                        <Feather name="plus" size={18} color="#FFF" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Friend Email Inputs (Group) */}
            {quantity > 1 && (
                <View style={styles.groupInputs}>
                    <Text style={styles.groupHelperText}>
                        Send tickets to your friends:
                    </Text>
                    {attendeeEmails.map((email, index) => (
                        <View key={index} style={styles.inputWrapper}>
                             <Feather name="mail" size={18} color="#666" style={{marginRight: 10}} />
                             <TextInput
                                style={styles.input}
                                placeholder={`Guest ${index + 1} Email`}
                                placeholderTextColor="#666"
                                value={email}
                                onChangeText={(text) => handleEmailChange(text, index)}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                        </View>
                    ))}
                </View>
            )}
          </View>

        </View>
      </ScrollView>

      {/* 3. Floating Bottom Bar */}
      <BlurView intensity={20} tint="dark" style={styles.bottomBar}>
        <View>
            <Text style={styles.priceLabel}>Total Price</Text>
            <Text style={styles.totalPrice}>
                {totalPrice === 0 ? 'FREE' : `₹${totalPrice}`}
            </Text>
        </View>

        <TouchableOpacity
            style={styles.bookButton}
            onPress={quantity === 1 ? handlePurchase : handleGroupPurchase}
            disabled={isPurchasing}
        >
            {isPurchasing ? (
                <ActivityIndicator color="#FFF" />
            ) : (
                <>
                    <Text style={styles.bookButtonText}>
                        {quantity === 1 ? 'Book Now' : 'Reserve Group'}
                    </Text>
                    <Feather name="arrow-right" size={20} color="#FFF" />
                </>
            )}
        </TouchableOpacity>
      </BlurView>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  loadingContainer: { flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' },
  errorText: { color: '#FFF', fontSize: 16 },

  // Header
  headerImage: { width: '100%', height: 400 },
  gradient: { ...StyleSheet.absoluteFillObject },
  backButton: { position: 'absolute', top: 50, left: 20, borderRadius: 20, overflow: 'hidden' },
  backButtonBlur: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },

  // Content
  contentContainer: {
    marginTop: -40,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    backgroundColor: '#000',
    paddingHorizontal: 24,
    paddingTop: 30,
    minHeight: height * 0.6
  },

  headerSection: { marginBottom: 24 },
  categoryBadge: { color: '#4F46E5', fontSize: 12, fontWeight: '800', letterSpacing: 1, marginBottom: 8, textTransform: 'uppercase' },
  title: { color: '#FFF', fontSize: 32, fontWeight: '800', lineHeight: 38 },

  infoGrid: { flexDirection: 'column', gap: 16, marginBottom: 32 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  iconBox: { width: 44, height: 44, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.05)', alignItems: 'center', justifyContent: 'center' },
  infoLabel: { color: '#666', fontSize: 12, marginBottom: 2 },
  infoValue: { color: '#DDD', fontSize: 16, fontWeight: '600' },

  section: { marginBottom: 32 },
  sectionTitle: { color: '#FFF', fontSize: 18, fontWeight: '700', marginBottom: 16 },
  description: { color: '#AAA', fontSize: 15, lineHeight: 24 },

  // Tickets
  ticketSelector: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#111', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#222' },
  ticketLabel: { color: '#DDD', fontSize: 16, fontWeight: '600' },
  counterControl: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  counterBtn: { width: 32, height: 32, borderRadius: 10, backgroundColor: '#333', alignItems: 'center', justifyContent: 'center' },
  counterValue: { color: '#FFF', fontSize: 18, fontWeight: 'bold', width: 20, textAlign: 'center' },

  groupInputs: { marginTop: 16, gap: 12 },
  groupHelperText: { color: '#666', fontSize: 14, marginBottom: 4 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#111', borderRadius: 12, paddingHorizontal: 16, height: 50, borderWidth: 1, borderColor: '#222' },
  input: { flex: 1, color: '#FFF', fontSize: 16 },

  // Bottom Bar
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    height: 100,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 24, paddingBottom: 20, paddingTop: 10,
    borderTopWidth: 1, borderColor: 'rgba(255,255,255,0.1)'
  },
  priceLabel: { color: '#888', fontSize: 12 },
  totalPrice: { color: '#FFF', fontSize: 24, fontWeight: '800' },
  bookButton: {
    backgroundColor: '#4F46E5',
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 24, paddingVertical: 16,
    borderRadius: 16,
    shadowColor: '#4F46E5', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8
  },
  bookButtonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' }
});