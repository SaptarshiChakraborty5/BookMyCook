import { createContext, useContext, useEffect, useReducer } from 'react';
import { getCurrentUser, login, register } from '../api';
import { AuthState, User } from '../types';
import toast from 'react-hot-toast';

interface AuthContextType extends AuthState {
  loginUser: (email: string, password: string) => Promise<void>;
  registerUser: (name: string, email: string, password: string, role?: string) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  isLoading: true,
};

type AuthAction = 
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'REGISTER_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'AUTH_ERROR' }
  | { type: 'USER_LOADED'; payload: User }
  | { type: 'LOGOUT' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'UPDATE_USER'; payload: User };

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'USER_LOADED':
      return {
        ...state,
        isAuthenticated: true,
        isLoading: false,
        user: action.payload,
      };
    case 'LOGIN_SUCCESS':
    case 'REGISTER_SUCCESS':
      localStorage.setItem('token', action.payload.token);
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
      };
    case 'AUTH_ERROR':
    case 'LOGOUT':
      localStorage.removeItem('token');
      return {
        ...state,
        token: null,
        user: null,
        isAuthenticated: false,
        isLoading: false,
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: action.payload,
      };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const loadUser = async () => {
      if (state.token) {
        try {
          const res = await getCurrentUser();
          dispatch({ type: 'USER_LOADED', payload: res.data });
        } catch (error) {
          dispatch({ type: 'AUTH_ERROR' });
        }
      } else {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    loadUser();
  }, [state.token]);

  const loginUser = async (email: string, password: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const res = await login({ email, password });
      dispatch({ 
        type: 'LOGIN_SUCCESS', 
        payload: { user: res.data.user, token: res.data.token }
      });
      toast.success('Login successful!');
    } catch (error: any) {
      dispatch({ type: 'AUTH_ERROR' });
      toast.error(error.response?.data?.message || 'Login failed');
    }
  };

  const registerUser = async (name: string, email: string, password: string, role = 'user') => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const res = await register({ name, email, password, role });
      dispatch({ 
        type: 'REGISTER_SUCCESS', 
        payload: { user: res.data.user, token: res.data.token }
      });
      toast.success('Registration successful!');
    } catch (error: any) {
      dispatch({ type: 'AUTH_ERROR' });
      toast.error(error.response?.data?.message || 'Registration failed');
    }
  };

  const logout = () => {
    dispatch({ type: 'LOGOUT' });
    toast.success('Logged out successfully');
  };

  const updateUser = (user: User) => {
    dispatch({ type: 'UPDATE_USER', payload: user });
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        loginUser,
        registerUser,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};