// FIX: Changed React import from namespace import ('* as React') to default import ('React') to resolve widespread JSX intrinsic element type errors. The default import is standard with modern TypeScript/React configurations and should restore the correct JSX type definitions.
import React from 'react';

export enum View {
  Home = 'Home',
  Booking = 'Booking',
  Map = 'Map',
  Emergency = 'Emergency',
  Yatra = 'Yatra',
  Calendar = 'Calendar',
  FamilyConnect = 'FamilyConnect',
}

export interface Temple {
  id: number;
  name: string;
  location: string;
}

export interface DarshanSlot {
  id: string;
  time: string;
  availability: 'Available' | 'Full' | 'Filling Fast';
  booked: boolean;
  bookingId?: string;
}

export interface Pilgrim {
  id: number;
  name: string;
  age: string;
  gender: 'Male' | 'Female' | 'Other' | '';
  differentlyAbled: boolean;
}

export interface ForecastData {
    day: string;
    level: number; // 1-10
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

export type Language = 'en-US' | 'hi-IN' | 'gu-IN' | 'ta-IN' | 'mr-IN' | 'or-IN' | 'sd-IN' | 'kut-IN';

export type AIIntent = 'navigate' | 'book' | 'sos' | 'answer' | 'booking_conversation';

export interface AIResponse {
  intent: AIIntent;
  responseText: string;
  data?: {
    poiId?: string; // Point of Interest ID for navigation
    bookingState?: BookingConversationState;
    bookingData?: Partial<BookingData>;
  };
}

export type BookingConversationState =
  | 'initial'           // Just started booking conversation
  | 'ask_time'          // Asking for preferred time
  | 'show_slots'        // Showing available slots
  | 'ask_details'       // Asking for pilgrim details
  | 'confirm_booking'   // Confirming booking details
  | 'booking_complete'; // Booking completed with QR

export interface BookingData {
  preferredTime?: string;
  selectedSlot?: DarshanSlot;
  pilgrims: Pilgrim[];
  seniorCitizenCount: number;
  totalMembers: number;
  bookingId?: string;
  qrCode?: string;
  status: 'pending' | 'confirmed' | 'completed' | 'failed';
}