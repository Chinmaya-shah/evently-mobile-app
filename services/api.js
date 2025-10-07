// services/api.js

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// --- CONFIGURATION ---
// IMPORTANT: Replace the IP address below with the "IPv4 Address" you just found on your computer using the 'ipconfig' command.
const BASE_URL = 'http://192.168.29.209:5000/api';

// We create separate instances for each route for better organization.
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

// We apply the interceptor to all API instances that need to make authenticated requests.
userApi.interceptors.request.use(addAuthToken);
ticketApi.interceptors.request.use(addAuthToken);
eventApi.interceptors.request.use(addAuthToken);


// --- API FUNCTIONS ---

// User-related functions
export const loginUser = (email, password) => userApi.post('/login', { email, password });
export const registerUser = (name, email, password, role) => userApi.post('/register', { name, email, password, role });
export const getUserProfile = () => userApi.get('/profile');
export const submitKyc = (kycData) => userApi.post('/submit-kyc', kycData);


// Event-related functions
export const getEvents = () => eventApi.get('/');
export const getEventById = (eventId) => eventApi.get(`/${eventId}`);
export const createEvent = (eventData) => eventApi.post('/', eventData);
export const getMyEvents = () => eventApi.get('/myevents');
export const updateEvent = (eventId, eventData) => eventApi.put(`/${eventId}`, eventData);
export const deleteEvent = (eventId) => eventApi.delete(`/${eventId}`);

// Ticket-related functions
export const purchaseTicket = (eventId) => ticketApi.post('/purchase', { eventId });
export const requestGroupTickets = (eventId, attendeeEmails) => ticketApi.post('/request-group', { eventId, attendeeEmails });
export const getMyTickets = (status) => {
    let url = '/mytickets';
    if (status) {
        url += `?status=${status}`;
    }
    return ticketApi.get(url);
};
export const acceptTicketInvitation = (ticketId) => ticketApi.post(`/accept/${ticketId}`);
export const declineTicketInvitation = (ticketId) => ticketApi.post(`/decline/${ticketId}`);