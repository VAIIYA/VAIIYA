'use client';

import React, { createContext, useContext, useReducer, useCallback, useMemo } from 'react';

// Types
interface AppState {
  theme: 'dark' | 'light';
  network: 'mainnet-beta' | 'devnet' | 'testnet';
  user: {
    wallet: string | null;
    connected: boolean;
  };
  notifications: Notification[];
  loading: {
    global: boolean;
    tokenCreation: boolean;
    swap: boolean;
  };
}

interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
}

// Actions
type AppAction =
  | { type: 'SET_THEME'; payload: 'dark' | 'light' }
  | { type: 'SET_NETWORK'; payload: 'mainnet-beta' | 'devnet' | 'testnet' }
  | { type: 'SET_USER'; payload: { wallet: string | null; connected: boolean } }
  | { type: 'ADD_NOTIFICATION'; payload: Omit<Notification, 'id' | 'timestamp' | 'read'> }
  | { type: 'REMOVE_NOTIFICATION'; payload: string }
  | { type: 'MARK_NOTIFICATION_READ'; payload: string }
  | { type: 'CLEAR_NOTIFICATIONS' }
  | { type: 'SET_LOADING'; payload: { key: keyof AppState['loading']; value: boolean } };

// Initial state
const initialState: AppState = {
  theme: 'dark',
  network: 'mainnet-beta',
  user: {
    wallet: null,
    connected: false,
  },
  notifications: [],
  loading: {
    global: false,
    tokenCreation: false,
    swap: false,
  },
};

// Reducer
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_THEME':
      return { ...state, theme: action.payload };
    
    case 'SET_NETWORK':
      return { ...state, network: action.payload };
    
    case 'SET_USER':
      return { ...state, user: action.payload };
    
    case 'ADD_NOTIFICATION':
      const notification: Notification = {
        ...action.payload,
        id: Math.random().toString(36).substr(2, 9),
        timestamp: Date.now(),
        read: false,
      };
      return {
        ...state,
        notifications: [notification, ...state.notifications].slice(0, 50), // Keep last 50
      };
    
    case 'REMOVE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.payload),
      };
    
    case 'MARK_NOTIFICATION_READ':
      return {
        ...state,
        notifications: state.notifications.map(n =>
          n.id === action.payload ? { ...n, read: true } : n
        ),
      };
    
    case 'CLEAR_NOTIFICATIONS':
      return { ...state, notifications: [] };
    
    case 'SET_LOADING':
      return {
        ...state,
        loading: { ...state.loading, [action.payload.key]: action.payload.value },
      };
    
    default:
      return state;
  }
}

// Context
const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  actions: {
    setTheme: (theme: 'dark' | 'light') => void;
    setNetwork: (network: 'mainnet-beta' | 'devnet' | 'testnet') => void;
    setUser: (user: { wallet: string | null; connected: boolean }) => void;
    addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
    removeNotification: (id: string) => void;
    markNotificationRead: (id: string) => void;
    clearNotifications: () => void;
    setLoading: (key: keyof AppState['loading'], value: boolean) => void;
  };
} | null>(null);

// Provider
export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Memoized actions
  const actions = useMemo(() => ({
    setTheme: (theme: 'dark' | 'light') => {
      dispatch({ type: 'SET_THEME', payload: theme });
    },
    setNetwork: (network: 'mainnet-beta' | 'devnet' | 'testnet') => {
      dispatch({ type: 'SET_NETWORK', payload: network });
    },
    setUser: (user: { wallet: string | null; connected: boolean }) => {
      dispatch({ type: 'SET_USER', payload: user });
    },
    addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
      dispatch({ type: 'ADD_NOTIFICATION', payload: notification });
    },
    removeNotification: (id: string) => {
      dispatch({ type: 'REMOVE_NOTIFICATION', payload: id });
    },
    markNotificationRead: (id: string) => {
      dispatch({ type: 'MARK_NOTIFICATION_READ', payload: id });
    },
    clearNotifications: () => {
      dispatch({ type: 'CLEAR_NOTIFICATIONS' });
    },
    setLoading: (key: keyof AppState['loading'], value: boolean) => {
      dispatch({ type: 'SET_LOADING', payload: { key, value } });
    },
  }), []);

  const value = useMemo(() => ({ state, dispatch, actions }), [state, actions]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// Hook
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

// Selectors
export const useTheme = () => {
  const { state } = useApp();
  return state.theme;
};

export const useNetwork = () => {
  const { state } = useApp();
  return state.network;
};

export const useUser = () => {
  const { state } = useApp();
  return state.user;
};

export const useNotifications = () => {
  const { state } = useApp();
  return state.notifications;
};

export const useLoading = () => {
  const { state } = useApp();
  return state.loading;
};
