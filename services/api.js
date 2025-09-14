// services/api.js

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// --- CONFIGURATION ---
// Using your IP address. Please re-verify with 'ipconfig' if you have connection issues.
const BASE_URL = 'http://172.20.10.4:5000/api';

const userApi = axios.create({ baseURL: `${BASE_URL}/users` });
const eventApi = axios.create({ baseURL: `${BASE_URL}/events` });
const ticketApi = axios.create({ baseURL: `${BASE_URL}/tickets` });

// --- INTERCEPTOR ---
// This helper function automatically adds the user's token to authenticated requests.
const addAuthToken = async (config) => {
    const token = await AsyncStorage.getItem('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
};

// We apply the interceptor to the API instances that need it.
userApi.interceptors.request.use(addAuthToken);
ticketApi.interceptors.request.use(addAuthToken);


// --- API FUNCTIONS ---

// User-related functions
export const loginUser = (email, password) => {
  return userApi.post('/login', { email, password });
};

export const getUserProfile = () => {
  return userApi.get('/profile');
};

// THIS IS THE NEW FUNCTION for user registration.
export const registerUser = (name, email, password) => {
  // We specify 'Attendee' as the default role for sign-ups from the mobile app.
  return userApi.post('/register', { name, email, password, role: 'Attendee' });
};


// Event-related functions
export const getEvents = () => {
  return eventApi.get('/');
};

export const getEventById = (eventId) => {
  return eventApi.get(`/${eventId}`);
};


// Ticket-related functions
export const purchaseTicket = (eventId) => {
  return ticketApi.post('/purchase', { eventId });
};

export const requestGroupTickets = (eventId, attendeeEmails) => {
  return ticketApi.post('/request-group', { eventId, attendeeEmails });
};

export const getMyTickets = () => {
  return ticketApi.get('/mytickets');
};

export const acceptTicketInvitation = (ticketId) => {
  return ticketApi.post(`/accept/${ticketId}`);
};

export const declineTicketInvitation = (ticketId) => {
  return ticketApi.post(`/decline/${ticketId}`);
};