// services/api.js

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Using your IP address.
const BASE_URL = 'http://172.20.10.4:5000/api';

const userApi = axios.create({ baseURL: `${BASE_URL}/users` });
const eventApi = axios.create({ baseURL: `${BASE_URL}/events` });
const ticketApi = axios.create({ baseURL: `${BASE_URL}/tickets` });

// --- INTERCEPTOR ---
const addAuthToken = async (config) => {
    const token = await AsyncStorage.getItem('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
};

// Apply the interceptor to all API instances that need to make authenticated requests.
userApi.interceptors.request.use(addAuthToken);
ticketApi.interceptors.request.use(addAuthToken);
eventApi.interceptors.request.use(addAuthToken);

// --- API FUNCTIONS ---
export const loginUser = (email, password) => userApi.post('/login', { email, password });
export const registerUser = (name, email, password, role) => userApi.post('/register', { name, email, password, role });
export const getUserProfile = () => userApi.get('/profile');

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
export const getMyTickets = () => ticketApi.get('/mytickets');
export const acceptTicketInvitation = (ticketId) => ticketApi.post(`/accept/${ticketId}`);
export const declineTicketInvitation = (ticketId) => ticketApi.post(`/decline/${ticketId}`);