'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { AppState, AppAction } from './types';
import { mockData } from './mock-data';

const initialState: AppState = {
  currentUser: null,
  users: [],
  teams: [],
  projects: [],
  tasks: [],
  messages: [],
  channels: [],
  files: [],
  notifications: [],
  sidebarCollapsed: false,
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_CURRENT_USER':
      return { ...state, currentUser: action.payload };
    
    case 'ADD_PROJECT':
      return { ...state, projects: [...state.projects, action.payload] };
    
    case 'UPDATE_PROJECT':
      return {
        ...state,
        projects: state.projects.map(p => 
          p.id === action.payload.id 
            ? { ...p, ...action.payload.updates }
            : p
        )
      };
    
    case 'ADD_TASK':
      return { ...state, tasks: [...state.tasks, action.payload] };
    
    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(t => 
          t.id === action.payload.id 
            ? { ...t, ...action.payload.updates, updatedAt: new Date() }
            : t
        )
      };
    
    case 'ADD_MESSAGE':
      return { ...state, messages: [...state.messages, action.payload] };
    
    case 'MARK_MESSAGE_READ':
      return {
        ...state,
        messages: state.messages.map(m => 
          m.id === action.payload.messageId
            ? {
                ...m,
                readBy: [
                  ...m.readBy.filter(r => r.userId !== action.payload.userId),
                  { userId: action.payload.userId, readAt: new Date() }
                ]
              }
            : m
        )
      };
    
    case 'ADD_NOTIFICATION':
      return { ...state, notifications: [action.payload, ...state.notifications] };
    
    case 'MARK_NOTIFICATION_READ':
      return {
        ...state,
        notifications: state.notifications.map(n => 
          n.id === action.payload ? { ...n, read: true } : n
        )
      };
    
    case 'SET_ACTIVE_CHANNEL':
      return { ...state, activeChannel: action.payload };
    
    case 'SET_ACTIVE_PROJECT':
      return { ...state, activeProject: action.payload };
    
    case 'TOGGLE_SIDEBAR':
      return { 
        ...state, 
        sidebarCollapsed: action.payload ?? !state.sidebarCollapsed 
      };
    
    case 'LOAD_DATA':
      return { ...state, ...action.payload };
    
    case 'ADD_FILE':
      return { ...state, files: [...state.files, action.payload] };
    
    case 'ADD_TEAM':
      return { ...state, teams: [...state.teams, action.payload] };
    
    default:
      return state;
  }
}

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem('teamwork-app-data');
    if (savedData) {
      try {
        const data = JSON.parse(savedData);
        // Convert date strings back to Date objects
        const processedData = {
          ...data,
          users: data.users?.map((u: any) => ({
            ...u,
            lastSeen: new Date(u.lastSeen)
          })),
          teams: data.teams?.map((t: any) => ({
            ...t,
            createdAt: new Date(t.createdAt)
          })),
          projects: data.projects?.map((p: any) => ({
            ...p,
            createdAt: new Date(p.createdAt),
            startDate: new Date(p.startDate),
            endDate: p.endDate ? new Date(p.endDate) : undefined
          })),
          tasks: data.tasks?.map((t: any) => ({
            ...t,
            createdAt: new Date(t.createdAt),
            updatedAt: new Date(t.updatedAt),
            dueDate: t.dueDate ? new Date(t.dueDate) : undefined
          })),
          messages: data.messages?.map((m: any) => ({
            ...m,
            timestamp: new Date(m.timestamp),
            readBy: m.readBy?.map((r: any) => ({
              ...r,
              readAt: new Date(r.readAt)
            })),
            editedAt: m.editedAt ? new Date(m.editedAt) : undefined
          })),
          channels: data.channels?.map((c: any) => ({
            ...c,
            createdAt: new Date(c.createdAt),
            lastMessageAt: c.lastMessageAt ? new Date(c.lastMessageAt) : undefined
          })),
          notifications: data.notifications?.map((n: any) => ({
            ...n,
            createdAt: new Date(n.createdAt)
          })),
          files: data.files?.map((f: any) => ({
            ...f,
            uploadedAt: new Date(f.uploadedAt)
          }))
        };
        dispatch({ type: 'LOAD_DATA', payload: processedData });
      } catch (error) {
        // If data is corrupted, load mock data
        dispatch({ type: 'LOAD_DATA', payload: mockData });
      }
    } else {
      // Load mock data on first visit
      dispatch({ type: 'LOAD_DATA', payload: mockData });
    }
  }, []);

  // Save data to localStorage whenever state changes
  useEffect(() => {
    if (state.users.length > 0) {
      localStorage.setItem('teamwork-app-data', JSON.stringify(state));
    }
  }, [state]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}