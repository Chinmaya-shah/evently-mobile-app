// services/api.js

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// --- CONFIGURATION ---
// Using the correct, current IP address you provided.
const BASE_URL = 'http://172.20.10.4:5000/api'; // <-- CORRECT IP ADDRESS

// We create separate instances for each route for better organization.
const userApi = axios.create({ baseURL: `${BASE_URL}/users` });
const eventApi = axios.create({ baseURL: `${BASE_URL}/events` });
const ticketApi = axios.create({ baseURL: `${BASE_URL}/tickets` });

// --- INTERCEPTOR ---
// This automatically adds the user's token to any request that needs authentication.
const addAuthToken = async (config) => {
    const token = await AsyncStorage.getItem('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
};

userApi.interceptors.request.use(addAuthToken);
ticketApi.interceptors.request.use(addAuthToken);

// --- API FUNCTIONS ---
export const loginUser = (email, password) => userApi.post('/login', { email, password });
export const getUserProfile = () => userApi.get('/profile');
export const getEvents = () => eventApi.get('/');
export const getEventById = (eventId) => eventApi.get(`/${eventId}`);
export const purchaseTicket = (eventId) => ticketApi.post('/purchase', { eventId });
export const requestGroupTickets = (eventId, attendeeEmails) => ticketApi.post('/request-group', { eventId, attendeeEmails });
export const getMyTickets = () => ticketApi.get('/mytickets');
export const acceptTicketInvitation = (ticketId) => ticketApi.post(`/accept/${ticketId}`);
export const declineTicketInvitation = (ticketId) => ticketApi.post(`/decline/${ticketId}`);