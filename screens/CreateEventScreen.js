import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet, Text, View, TextInput, TouchableOpacity,
  Alert, ScrollView, ActivityIndicator, Platform, Image, Dimensions,
  KeyboardAvoidingView, Modal, TouchableWithoutFeedback
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

// API Imports
import {
    createEvent, getEventById, updateEvent,
    generateAiImage, suggestImages, trackUnsplashDownload
} from '../services/api';

const { width } = Dimensions.get('window');
const TABS = ['Upload', 'AI Gen', 'Unsplash'];

const CATEGORIES = [
    "Music", "Nightlife", "Business Summit", "Tech", "Health",
    "Automotive", "Comedy Show", "Esports & Gaming", "Film & Media",
    "Food & Drink", "Sports", "Arts & Culture", "Travel"
];

export default function CreateEventScreen({ route, navigation }) {
  const eventId = route.params?.eventId;
  const isEditMode = Boolean(eventId);

  // --- FORM STATE ---
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [ticketPrice, setTicketPrice] = useState('');
  const [capacity, setCapacity] = useState('');

  const [category, setCategory] = useState('');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [filteredCategories, setFilteredCategories] = useState(CATEGORIES);

  const [date, setDate] = useState(new Date());
  const [showPickerModal, setShowPickerModal] = useState(false);
  const [pickerMode, setPickerMode] = useState('date');

  const [imageUri, setImageUri] = useState('');
  const [imageBase64, setImageBase64] = useState(null);
  const [activeTab, setActiveTab] = useState('Upload');

  const [aiPrompt, setAiPrompt] = useState('');
  const [unsplashQuery, setUnsplashQuery] = useState('');
  const [unsplashResults, setUnsplashResults] = useState([]);

  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasSoldTickets, setHasSoldTickets] = useState(false);

  const resetForm = () => {
      setName(''); setDescription(''); setLocation(''); setTicketPrice('');
      setCapacity(''); setCategory(''); setDate(new Date());
      setImageUri(''); setImageBase64(null); setAiPrompt('');
      setUnsplashResults([]); setActiveTab('Upload');
      setHasSoldTickets(false);
  };

  useFocusEffect(
    useCallback(() => {
        if (!isEditMode) {
            // Optional: resetForm();
        }
    }, [isEditMode])
  );

  useEffect(() => {
    if (isEditMode) {
      setIsLoading(true);
      const fetchEventData = async () => {
        try {
          const response = await getEventById(eventId);
          const event = response.data;
          setName(event.name);
          setDescription(event.description);
          setDate(new Date(event.date));
          setLocation(event.location);
          setTicketPrice(event.ticketPrice.toString());
          setCapacity(event.capacity.toString());
          setCategory(event.category || '');
          setImageUri(event.eventImage);
          if (event.ticketsSold > 0) {
              setHasSoldTickets(true);
          }
        } catch (error) {
            Alert.alert("Error", "Could not load event data.");
        } finally {
            setIsLoading(false);
        }
      };
      fetchEventData();
    } else {
        resetForm();
    }
  }, [eventId, isEditMode]);

  // --- HANDLERS ---
  const openPicker = (mode) => {
      setPickerMode(mode);
      setShowPickerModal(true);
  };

  const onDateTimeChange = (event, selectedDate) => {
      if (Platform.OS === 'android') setShowPickerModal(false);
      if (selectedDate) {
          const currentDate = new Date(date);
          if (pickerMode === 'date') {
              currentDate.setFullYear(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
          } else {
              currentDate.setHours(selectedDate.getHours());
              currentDate.setMinutes(selectedDate.getMinutes());
          }
          setDate(currentDate);
      }
  };

  const handleCategorySearch = (text) => {
      setCategory(text);
      if (text) {
          const filtered = CATEGORIES.filter(c => c.toLowerCase().includes(text.toLowerCase()));
          setFilteredCategories(filtered);
          setShowCategoryDropdown(true);
      } else {
          setShowCategoryDropdown(false);
      }
  };

  const selectCategory = (cat) => {
      setCategory(cat);
      setShowCategoryDropdown(false);
  };

  const handleTabChange = (tab) => {
      setActiveTab(tab);
      if (tab === 'Unsplash' && name && !unsplashQuery) {
          setUnsplashQuery(name);
          handleUnsplashSearch(name);
      }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [16, 9], quality: 0.7, base64: true,
    });
    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
      setImageBase64(`data:image/jpeg;base64,${result.assets[0].base64}`);
    }
  };

  const handleGenerateAI = async () => {
    if (!aiPrompt.trim()) return Alert.alert("Required", "Please enter a prompt.");
    setIsGenerating(true);
    try {
        const res = await generateAiImage(aiPrompt);
        if (res.data.success) {
            setImageUri(res.data.imageUrl); setImageBase64(null); setAiPrompt('');
        }
    } catch (error) { Alert.alert("AI Error", "Failed to generate image."); }
    finally { setIsGenerating(false); }
  };

  const handleUnsplashSearch = async (queryOverride) => {
    const query = queryOverride || unsplashQuery;
    if (!query.trim()) return;
    setIsGenerating(true);
    try {
        const res = await suggestImages(query);
        setUnsplashResults(res.data || []);
    } catch (error) { }
    finally { setIsGenerating(false); }
  };

  const selectUnsplashImage = async (photo) => {
    setImageUri(photo.url); setImageBase64(null);
    try { await trackUnsplashDownload(photo.downloadUrl); } catch(e){}
    setUnsplashResults([]); setUnsplashQuery('');
  };

  const handleSubmit = async () => {
    if (!name || !date || !location || !ticketPrice || !capacity) {
      return Alert.alert('Error', 'Please fill out all fields.');
    }
    if (!imageUri) return Alert.alert('Error', 'Please select an event image.');

    setIsLoading(true);
    const finalImage = imageBase64 || imageUri;

    const eventData = {
      name, description, date: date.toISOString(), location,
      ticketPrice: Number(ticketPrice),
      capacity: Number(capacity),
      eventImage: finalImage,
      category,
      status: 'Published'
    };

    try {
      if (isEditMode) {
        await updateEvent(eventId, eventData);
        Alert.alert('Success', 'Event updated!', [{ text: 'OK', onPress: () => navigation.goBack() }]);
      } else {
        await createEvent(eventData);
        Alert.alert('Success', 'Event created!', [{
            text: 'OK',
            onPress: () => { resetForm(); navigation.navigate('Dashboard'); }
        }]);
      }
    } catch (error) {
      const msg = error.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'create'}`;
      Alert.alert('Error', msg);
    } finally { setIsLoading(false); }
  };

  if (isLoading) {
    return (
        <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#22D3EE" />
        </View>
    );
  }

  return (
      <View style={styles.container}>
        <LinearGradient colors={['#000', '#0a0a0a', '#000']} style={StyleSheet.absoluteFill} />

        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

            {/* FIXED HEADER: Row layout for proper alignment */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Feather name="x" size={20} color="#FFF" />
                </TouchableOpacity>
                <Text style={styles.pageTitle}>{isEditMode ? 'Edit Event' : 'Create Event'}</Text>
                {/* Spacer to balance the header */}
                <View style={{ width: 40 }} />
            </View>

            {/* IDENTITY */}
            <View style={styles.formSection}>
                <Text style={styles.sectionTitle}>Basic Info</Text>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Event Title</Text>
                    <TextInput
                        style={styles.input}
                        value={name}
                        onChangeText={setName}
                        placeholder="e.g. Neon Nights Concert"
                        placeholderTextColor="#555"
                    />
                </View>

                <View style={[styles.inputGroup, { zIndex: 100 }]}>
                    <Text style={styles.label}>Category</Text>
                    <View style={styles.dropdownWrapper}>
                        {/* ABSOLUTE ICON */}
                        <Feather name="grid" size={18} color="#666" style={styles.inputIcon} />
                        <TextInput
                            style={[styles.input, styles.paddingLeftInput]}
                            value={category}
                            onChangeText={handleCategorySearch}
                            placeholder="Select Category"
                            placeholderTextColor="#555"
                            onFocus={() => setShowCategoryDropdown(true)}
                        />
                        {showCategoryDropdown && (
                            <View style={styles.dropdownList}>
                                <ScrollView nestedScrollEnabled style={{ maxHeight: 200 }}>
                                    {filteredCategories.map((cat, index) => (
                                        <TouchableOpacity key={index} style={styles.dropdownItem} onPress={() => selectCategory(cat)}>
                                            <Text style={styles.dropdownItemText}>{cat}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            </View>
                        )}
                    </View>
                </View>
            </View>

            {/* LOGISTICS */}
            <View style={styles.formSection}>
                <Text style={styles.sectionTitle}>Logistics</Text>
                <View style={styles.row}>
                    <View style={[styles.inputGroup, { flex: 1 }]}>
                        <Text style={styles.label}>Date</Text>
                        <TouchableOpacity style={styles.pickerBtn} onPress={() => openPicker('date')}>
                            <Feather name="calendar" size={18} color="#FFF" />
                            <Text style={styles.pickerText}>{date.toLocaleDateString()}</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={[styles.inputGroup, { flex: 1 }]}>
                        <Text style={styles.label}>Time</Text>
                        <TouchableOpacity style={styles.pickerBtn} onPress={() => openPicker('time')}>
                            <Feather name="clock" size={18} color="#FFF" />
                            <Text style={styles.pickerText}>{date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Location</Text>
                    <View style={styles.dropdownWrapper}>
                        <Feather name="map-pin" size={18} color="#666" style={styles.inputIcon} />
                        <TextInput style={[styles.input, styles.paddingLeftInput]} value={location} onChangeText={setLocation} placeholder="City, Venue, or URL" placeholderTextColor="#555" />
                    </View>
                </View>
            </View>

            {/* ABOUT */}
            <View style={styles.formSection}>
                <Text style={styles.sectionTitle}>About</Text>
                <View style={styles.inputGroup}>
                    <TextInput style={[styles.input, styles.textArea]} value={description} onChangeText={setDescription} placeholder="Tell people why they should attend..." placeholderTextColor="#555" multiline textAlignVertical="top" />
                </View>
            </View>

            {/* IMAGE */}
            <View style={styles.formSection}>
                <Text style={styles.sectionTitle}>Cover Image</Text>
                <View style={styles.imageSection}>
                    <View style={styles.imagePreview}>
                        {imageUri ? (
                            <Image source={{ uri: imageUri }} style={styles.actualImage} />
                        ) : (
                            <View style={styles.placeholderImage}><Feather name="image" size={40} color="#333" /><Text style={styles.placeholderText}>No Image Selected</Text></View>
                        )}
                        {imageUri ? (
                            <TouchableOpacity style={styles.removeImageBtn} onPress={() => {setImageUri(''); setImageBase64(null)}}>
                                <Feather name="x" size={16} color="#FFF" />
                            </TouchableOpacity>
                        ) : null}
                    </View>
                    <View style={styles.tabContainer}>
                        {TABS.map(tab => (
                            <TouchableOpacity key={tab} style={[styles.tab, activeTab === tab && styles.activeTab]} onPress={() => handleTabChange(tab)}>
                                <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                    <View style={styles.controlsContainer}>
                        {activeTab === 'Upload' && (
                            <TouchableOpacity style={styles.uploadBtn} onPress={pickImage}><Feather name="upload-cloud" size={20} color="#000" /><Text style={styles.uploadBtnText}>Select from Gallery</Text></TouchableOpacity>
                        )}
                        {activeTab === 'AI Gen' && (
                            <View style={styles.aiContainer}>
                                <TextInput style={styles.aiInput} placeholder="Prompt: e.g. Neon Jazz Concert" placeholderTextColor="#666" value={aiPrompt} onChangeText={setAiPrompt} />
                                <TouchableOpacity style={styles.aiBtn} onPress={handleGenerateAI} disabled={isGenerating}>{isGenerating ? <ActivityIndicator color="#000" /> : <Feather name="zap" size={20} color="#000" />}</TouchableOpacity>
                            </View>
                        )}
                        {activeTab === 'Unsplash' && (
                            <View>
                                <View style={styles.aiContainer}>
                                    <TextInput style={styles.aiInput} placeholder="Search Unsplash..." placeholderTextColor="#666" value={unsplashQuery} onChangeText={setUnsplashQuery} onSubmitEditing={() => handleUnsplashSearch()} />
                                    <TouchableOpacity style={styles.aiBtn} onPress={() => handleUnsplashSearch()} disabled={isGenerating}>{isGenerating ? <ActivityIndicator color="#000" /> : <Feather name="search" size={20} color="#000" />}</TouchableOpacity>
                                </View>
                                {unsplashResults.length > 0 && (
                                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.unsplashScroll}>
                                        {unsplashResults.map(photo => (
                                            <TouchableOpacity key={photo.id} onPress={() => selectUnsplashImage(photo)}><Image source={{ uri: photo.url }} style={styles.unsplashThumb} /></TouchableOpacity>
                                        ))}
                                    </ScrollView>
                                )}
                            </View>
                        )}
                    </View>
                </View>
            </View>

            {/* BUSINESS */}
            <View style={styles.formSection}>
                <Text style={styles.sectionTitle}>Ticket Settings</Text>
                {hasSoldTickets && (
                    <View style={styles.lockedAlert}>
                        <Feather name="lock" size={16} color="#F59E0B" />
                        <Text style={styles.lockedText}>Price cannot be changed after sales begin.</Text>
                    </View>
                )}
                <View style={styles.row}>
                    <View style={[styles.inputGroup, { flex: 1 }]}>
                        <Text style={styles.label}>Price (₹)</Text>
                        <TextInput
                            style={[styles.input, hasSoldTickets && styles.inputLocked]}
                            value={ticketPrice}
                            onChangeText={setTicketPrice}
                            keyboardType="numeric"
                            placeholder="0"
                            placeholderTextColor="#555"
                            editable={!hasSoldTickets}
                        />
                    </View>
                    <View style={[styles.inputGroup, { flex: 1 }]}>
                        <Text style={styles.label}>Capacity</Text>
                        <TextInput style={styles.input} value={capacity} onChangeText={setCapacity} keyboardType="numeric" placeholder="100" placeholderTextColor="#555" />
                    </View>
                </View>
            </View>

            <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
                <LinearGradient colors={['#FFF', '#E5E5E5']} style={styles.submitGradient}>
                    <Text style={styles.submitText}>{isEditMode ? 'Save Changes' : 'Publish Event'}</Text>
                    <Feather name="arrow-right" size={20} color="#000" />
                </LinearGradient>
            </TouchableOpacity>

        </ScrollView>
        </KeyboardAvoidingView>

        {/* MODAL PICKER */}
        {showPickerModal && (
            <Modal transparent animationType="slide" visible={showPickerModal}>
                <View style={styles.modalOverlay}>
                    <TouchableOpacity style={styles.modalBackdrop} onPress={() => setShowPickerModal(false)} />
                    <View style={styles.pickerModalContent}>
                        <View style={styles.pickerHeader}>
                            <TouchableOpacity onPress={() => setShowPickerModal(false)}><Text style={styles.pickerCancel}>Cancel</Text></TouchableOpacity>
                            <Text style={styles.pickerTitle}>{pickerMode === 'date' ? 'Select Date' : 'Select Time'}</Text>
                            <TouchableOpacity onPress={() => setShowPickerModal(false)}><Text style={styles.pickerDone}>Done</Text></TouchableOpacity>
                        </View>
                        <DateTimePicker value={date} mode={pickerMode} display="spinner" onChange={onDateTimeChange} themeVariant="dark" textColor="white" style={{ height: 200 }} />
                    </View>
                </View>
            </Modal>
        )}
      </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  loadingContainer: { flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' },
  scrollContent: { paddingBottom: 50 },

  // FIXED HEADER
  header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingTop: 60,
      paddingHorizontal: 20,
      marginBottom: 20
  },
  backBtn: {
      padding: 10,
      backgroundColor: '#111',
      borderRadius: 12,
      borderWidth: 1,
      borderColor: '#333'
  },
  pageTitle: { fontSize: 24, fontWeight: '800', color: '#FFF' },

  formSection: { paddingHorizontal: 20, marginBottom: 24 },
  sectionTitle: { color: '#22D3EE', fontSize: 12, fontWeight: '700', textTransform: 'uppercase', marginBottom: 12, letterSpacing: 1 },
  inputGroup: { marginBottom: 16 },
  row: { flexDirection: 'row', gap: 12 },
  label: { color: '#CCC', fontSize: 13, fontWeight: '600', marginBottom: 8 },

  // FIXED INPUT
  input: {
      backgroundColor: '#111', borderRadius: 12, padding: 16,
      color: '#FFF', fontSize: 16, borderWidth: 1, borderColor: '#333'
  },
  // New style for inputs with icons
  paddingLeftInput: { paddingLeft: 50 },

  inputLocked: { backgroundColor: '#222', opacity: 0.7, borderColor: '#444' },
  textArea: { height: 100 },

  dropdownWrapper: { position: 'relative', justifyContent: 'center' },
  // Icon Absolute Position Fixed
  inputIcon: { position: 'absolute', left: 16, zIndex: 10 },

  dropdownList: { position: 'absolute', top: 60, left: 0, right: 0, backgroundColor: '#1A1A1A', borderRadius: 12, borderWidth: 1, borderColor: '#333', maxHeight: 200, zIndex: 1000, elevation: 5 },
  dropdownItem: { padding: 14, borderBottomWidth: 1, borderBottomColor: '#333' },
  dropdownItemText: { color: '#DDD', fontSize: 14 },

  pickerBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#111', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#333', gap: 8 },
  pickerText: { color: '#FFF', fontSize: 15, fontWeight: '500' },

  imageSection: { marginBottom: 10 },
  imagePreview: { width: '100%', height: 200, backgroundColor: '#111', justifyContent: 'center', alignItems: 'center', borderRadius: 16, borderWidth: 1, borderColor: '#333', overflow: 'hidden', marginBottom: 12 },
  actualImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  placeholderImage: { alignItems: 'center' },
  placeholderText: { color: '#444', marginTop: 10, fontWeight: '600' },
  removeImageBtn: { position: 'absolute', top: 10, right: 10, backgroundColor: 'rgba(0,0,0,0.6)', padding: 6, borderRadius: 12 },
  tabContainer: { flexDirection: 'row', backgroundColor: '#111', padding: 4, borderRadius: 12, marginBottom: 12 },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8 },
  activeTab: { backgroundColor: '#333' },
  tabText: { color: '#666', fontWeight: '600', fontSize: 12 },
  activeTabText: { color: '#FFF' },
  controlsContainer: { padding: 16, backgroundColor: '#111', borderRadius: 16, borderWidth: 1, borderColor: '#222' },
  uploadBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFF', padding: 14, borderRadius: 12, gap: 10 },
  uploadBtnText: { color: '#000', fontWeight: 'bold' },
  aiContainer: { flexDirection: 'row', gap: 10 },
  aiInput: { flex: 1, backgroundColor: '#222', borderRadius: 12, paddingHorizontal: 16, color: '#FFF', borderWidth: 1, borderColor: '#444' },
  aiBtn: { width: 50, backgroundColor: '#FFF', borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  unsplashScroll: { marginTop: 12 },
  unsplashThumb: { width: 80, height: 60, borderRadius: 8, marginRight: 8, borderWidth: 1, borderColor: '#333' },
  submitBtn: { marginHorizontal: 20, marginTop: 10, borderRadius: 16, overflow: 'hidden' },
  submitGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 18, gap: 10 },
  submitText: { color: '#000', fontSize: 18, fontWeight: '800' },
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalBackdrop: { flex: 1 },
  pickerModalContent: { backgroundColor: '#1E1E1E', borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingBottom: 40 },
  pickerHeader: { flexDirection: 'row', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: '#333' },
  pickerCancel: { color: '#666', fontSize: 16 },
  pickerDone: { color: '#22D3EE', fontSize: 16, fontWeight: 'bold' },
  pickerTitle: { color: '#FFF', fontWeight: '600' },
  lockedAlert: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(245, 158, 11, 0.1)', padding: 12, borderRadius: 12, marginBottom: 12, gap: 10 },
  lockedText: { color: '#F59E0B', fontSize: 12, fontWeight: '600' }
});