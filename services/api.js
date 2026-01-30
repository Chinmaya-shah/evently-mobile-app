import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// --- CONFIGURATION ---
const BASE_URL = 'https://evently-backend-tckr.onrender.com/api';

// We create separate instances for each route for better organization.
const userApi = axios.create({ baseURL: `${BASE_URL}/users` });
const eventApi = axios.create({ baseURL: `${BASE_URL}/events` });
const ticketApi = axios.create({ baseURL: `${BASE_URL}/tickets` });
const activityApi = axios.create({ baseURL: `${BASE_URL}/activities` });
// 1. NEW: AI API Instance
const aiApi = axios.create({ baseURL: `${BASE_URL}/ai` });

// --- INTERCEPTOR ---
const addAuthToken = async (config) => {
    const token = await AsyncStorage.getItem('userToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
};

// Apply interceptors
userApi.interceptors.request.use(addAuthToken);
ticketApi.interceptors.request.use(addAuthToken);
eventApi.interceptors.request.use(addAuthToken);
activityApi.interceptors.request.use(addAuthToken);
aiApi.interceptors.request.use(addAuthToken);


// --- API FUNCTIONS ---

// User
export const loginUser = (email, password) => userApi.post('/login', { email, password });
export const registerUser = (name, email, password, role) => userApi.post('/register', { name, email, password, role });
export const getUserProfile = () => userApi.get('/profile');
export const submitKyc = (kycData) => userApi.post('/submit-kyc', kycData);

// Event
export const getEvents = () => eventApi.get('/');
export const getEventById = (eventId) => eventApi.get(`/${eventId}`);
export const createEvent = (eventData) => eventApi.post('/', eventData);
export const getMyEvents = () => eventApi.get('/myevents');
export const updateEvent = (eventId, eventData) => eventApi.put(`/${eventId}`, eventData);
export const deleteEvent = (eventId) => eventApi.delete(`/${eventId}`);
export const getEventAnalytics = (eventId) => eventApi.get(`/analytics/${eventId}`);

// Ticket
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

// Activity
export const getRecentActivities = () => activityApi.get('/');

// 2. NEW: AI & Image Functions
export const suggestImages = (searchTerm) => aiApi.get('/suggest-images', { params: { searchTerm } });
export const generateAiImage = (prompt) => aiApi.post('/generate-image', { prompt });
export const trackUnsplashDownload = (downloadUrl) => aiApi.post('/track-download', { downloadUrl });