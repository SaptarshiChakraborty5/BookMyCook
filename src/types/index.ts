export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'chef';
  profilePicture?: string;
}

export interface Chef {
  _id: string;
  userId: User;
  speciality: string[];
  experience: number;
  hourlyRate: number;
  bio: string;
  rating: number;
  availableDates: string[];
  reviews: Review[];
}

export interface Review {
  userId: string | User;
  rating: number;
  comment: string;
  date: string;
}

export interface Booking {
  _id: string;
  userId: string | User;
  chefId: string | Chef;
  date: string;
  duration: number;
  location: string;
  menu?: string;
  specialInstructions?: string;
  status: 'pending' | 'confirmed' | 'completed' | 'canceled';
  totalPrice: number;
  createdAt: string;
}

export interface Message {
  _id: string;
  bookingId?: string;
  senderId: string | User;
  receiverId: string | User;
  content: string;
  timestamp: string;
  read: boolean;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface ChefSearchFilters {
  speciality?: string[];
  minRate?: number;
  maxRate?: number;
  date?: string;
}