import React, { useState, useCallback } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity, FlatList,
  ActivityIndicator, ImageBackground, Dimensions, TextInput, StatusBar, Platform, ScrollView
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons, Feather, MaterialIcons } from '@expo/vector-icons';
import { getEvents } from '../services/api';

const { width, height } = Dimensions.get('window');

// --- CONFIGURATION ---
const CATEGORIES = ["All", "Music", "Tech", "Nightlife", "Business", "Arts", "Health"];

export default function HomeScreen({ navigation }) {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // --- DATA FETCHING ---
  const fetchEvents = async () => {
    try {
      const response = await getEvents();
      // Sort by date (newest/upcoming first) or any other logic
      const data = response.data || [];
      setEvents(data);
      applyFilters(data, searchQuery, selectedCategory);
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(useCallback(() => {
    setIsLoading(true);
    fetchEvents();
  }, []));

  // --- FILTER LOGIC ---
  const applyFilters = (allEvents, query, category) => {
    let result = allEvents;

    // 1. Category Filter
    if (category !== 'All') {
      result = result.filter(e =>
        e.category?.toLowerCase().includes(category.toLowerCase()) ||
        (category === 'Nightlife' && e.category?.toLowerCase().includes('party'))
      );
    }

    // 2. Search Filter
    if (query) {
      const lowerQuery = query.toLowerCase();
      result = result.filter(e =>
        e.name?.toLowerCase().includes(lowerQuery) ||
        e.location?.toLowerCase().includes(lowerQuery)
      );
    }

    setFilteredEvents(result);
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
    applyFilters(events, text, selectedCategory);
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    applyFilters(events, searchQuery, category);
  };

  // --- RENDER COMPONENTS ---

  const renderSpotlight = () => {
    // If searching, hide spotlight to show results. If no events, hide.
    if (searchQuery.length > 0 || events.length === 0) return null;

    const spotlightEvent = events[0]; // First event is Spotlight

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => navigation.navigate('EventDetail', { eventId: spotlightEvent._id })}
        style={styles.spotlightContainer}
      >
        <ImageBackground
          source={{ uri: spotlightEvent.eventImage || 'https://via.placeholder.com/800x600' }}
          style={styles.spotlightImage}
          imageStyle={{ borderRadius: 24 }}
        >
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.9)']}
            style={styles.spotlightGradient}
          >
            <View style={styles.spotlightBadge}>
              <MaterialIcons name="local-fire-department" size={16} color="#FFD700" />
              <Text style={styles.spotlightBadgeText}>SPOTLIGHT</Text>
            </View>

            <Text style={styles.spotlightTitle} numberOfLines={2}>{spotlightEvent.name}</Text>

            <View style={styles.spotlightMeta}>
              <View style={styles.metaItem}>
                <Feather name="calendar" size={16} color="#A1A1AA" />
                <Text style={styles.metaText}>{new Date(spotlightEvent.date).toDateString()}</Text>
              </View>
              <View style={styles.metaItem}>
                <Feather name="map-pin" size={16} color="#A1A1AA" />
                <Text style={styles.metaText}>{spotlightEvent.location}</Text>
              </View>
            </View>
          </LinearGradient>
        </ImageBackground>
      </TouchableOpacity>
    );
  };

  const renderEventCard = ({ item }) => (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => navigation.navigate('EventDetail', { eventId: item._id })}
      style={styles.cardContainer}
    >
      <ImageBackground
        source={{ uri: item.eventImage || 'https://via.placeholder.com/400x300' }}
        style={styles.cardImage}
        imageStyle={{ borderRadius: 20 }}
      >
        <LinearGradient
          colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.9)']}
          style={styles.cardGradient}
        >
          {/* Price Tag */}
          <View style={styles.priceTag}>
            <Text style={styles.priceText}>
              {item.ticketPrice === 0 ? 'FREE' : `₹${item.ticketPrice}`}
            </Text>
          </View>

          {/* Date Badge */}
          <View style={styles.dateBadge}>
            <Text style={styles.dateMonth}>
              {new Date(item.date).toLocaleString('default', { month: 'short' }).toUpperCase()}
            </Text>
            <Text style={styles.dateDay}>
              {new Date(item.date).getDate()}
            </Text>
          </View>

          {/* Text Content */}
          <View style={styles.cardContent}>
            <Text style={styles.cardCategory}>{item.category || 'Event'}</Text>
            <Text style={styles.cardTitle} numberOfLines={1}>{item.name}</Text>
            <View style={styles.cardLocation}>
              <Feather name="map-pin" size={12} color="#A1A1AA" />
              <Text style={styles.cardLocationText} numberOfLines={1}>{item.location}</Text>
            </View>
          </View>

        </LinearGradient>
      </ImageBackground>
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <View style={styles.headerWrapper}>

      {/* 1. Top Bar */}
      <View style={styles.topBar}>
        <View>
          <Text style={styles.greetingText}>Good Evening,</Text>
          <Text style={styles.logoText}>Explorer</Text>
        </View>
        <TouchableOpacity style={styles.profileButton}>
            {/* Placeholder for profile image or icon */}
            <LinearGradient colors={['#4F46E5', '#9333EA']} style={styles.profileGradient}>
                <Feather name="user" size={20} color="#FFF" />
            </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* 2. Search Bar */}
      <View style={styles.searchContainer}>
        <BlurView intensity={20} tint="dark" style={styles.searchBlur}>
          <Feather name="search" size={20} color="#A1A1AA" style={{ marginRight: 10 }} />
          <TextInput
            placeholder="Search events, artists..."
            placeholderTextColor="#666"
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={handleSearch}
          />
        </BlurView>
      </View>

      {/* 3. Categories */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryScroll}
      >
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat}
            onPress={() => handleCategorySelect(cat)}
            style={[
              styles.categoryPill,
              selectedCategory === cat && styles.categoryPillActive
            ]}
          >
            <Text style={[
              styles.categoryText,
              selectedCategory === cat && styles.categoryTextActive
            ]}>
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* 4. Spotlight (Only if not searching) */}
      {renderSpotlight()}

      {/* 5. Section Title */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          {searchQuery ? 'Search Results' : 'Upcoming Events'}
        </Text>
        {!searchQuery && (
            <Text style={styles.sectionMore}>See All</Text>
        )}
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <StatusBar barStyle="light-content" />
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  // If Spotlight is shown, remove it from the list to avoid duplicate
  // BUT only if we are in "All" view (not searching/filtering differently)
  const listData = (searchQuery.length === 0 && events.length > 0 && selectedCategory === 'All')
    ? filteredEvents.slice(1)
    : filteredEvents;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      <FlatList
        data={listData}
        renderItem={renderEventCard}
        keyExtractor={item => item._id}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Feather name="calendar" size={48} color="#333" />
            <Text style={styles.emptyText}>No events found.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  listContent: { paddingBottom: 100 },

  // Header
  headerWrapper: { paddingHorizontal: 20, paddingTop: Platform.OS === 'android' ? 40 : 60 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  greetingText: { color: '#A1A1AA', fontSize: 14, fontWeight: '500' },
  logoText: { color: '#FFF', fontSize: 28, fontWeight: '800' },
  profileButton: { borderRadius: 20, overflow: 'hidden' },
  profileGradient: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },

  // Search
  searchContainer: { marginBottom: 20 },
  searchBlur: { flexDirection: 'row', alignItems: 'center', height: 50, borderRadius: 16, paddingHorizontal: 16, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  searchInput: { flex: 1, color: '#FFF', fontSize: 16 },

  // Categories
  categoryScroll: { paddingBottom: 20 },
  categoryPill: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 24, borderWidth: 1, borderColor: '#333', marginRight: 10, backgroundColor: '#111' },
  categoryPillActive: { backgroundColor: '#FFF', borderColor: '#FFF' },
  categoryText: { color: '#888', fontWeight: '600' },
  categoryTextActive: { color: '#000' },

  // Spotlight
  spotlightContainer: { height: 320, borderRadius: 24, overflow: 'hidden', marginBottom: 30, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  spotlightImage: { flex: 1, width: '100%', height: '100%' },
  spotlightGradient: { flex: 1, justifyContent: 'flex-end', padding: 20 },
  spotlightBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, alignSelf: 'flex-start', marginBottom: 10, backdropFilter: 'blur(10px)' },
  spotlightBadgeText: { color: '#FFD700', fontWeight: 'bold', fontSize: 10, marginLeft: 4, letterSpacing: 1 },
  spotlightTitle: { color: '#FFF', fontSize: 28, fontWeight: '800', marginBottom: 10, textShadowColor: 'rgba(0,0,0,0.7)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 4 },
  spotlightMeta: { flexDirection: 'row', gap: 15 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { color: '#DDD', fontSize: 12, fontWeight: '500' },

  // Section
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 16 },
  sectionTitle: { color: '#FFF', fontSize: 20, fontWeight: '700' },
  sectionMore: { color: '#4F46E5', fontSize: 14, fontWeight: '600' },

  // Event Card
  cardContainer: { height: 220, marginBottom: 20, marginHorizontal: 20, borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  cardImage: { flex: 1, width: '100%', height: '100%' },
  cardGradient: { flex: 1, justifyContent: 'flex-end', padding: 16 },

  priceTag: { position: 'absolute', top: 16, right: 16, backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  priceText: { color: '#FFF', fontWeight: '700', fontSize: 12 },

  dateBadge: { position: 'absolute', top: 16, left: 16, backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 12, width: 46, height: 46, alignItems: 'center', justifyContent: 'center' },
  dateMonth: { color: '#000', fontSize: 10, fontWeight: '800' },
  dateDay: { color: '#000', fontSize: 16, fontWeight: '900' },

  cardContent: {},
  cardCategory: { color: '#4F46E5', fontSize: 10, fontWeight: '800', uppercase: 'uppercase', letterSpacing: 1, marginBottom: 4 },
  cardTitle: { color: '#FFF', fontSize: 18, fontWeight: '700', marginBottom: 6 },
  cardLocation: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  cardLocationText: { color: '#A1A1AA', fontSize: 12 },

  emptyContainer: { alignItems: 'center', marginTop: 50 },
  emptyText: { color: '#333', marginTop: 10, fontSize: 16 },
});