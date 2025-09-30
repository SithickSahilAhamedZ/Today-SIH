
import { Temple } from './types';

export interface TempleEvent {
  id: string;
  templeId: number;
  title: string;
  description: string;
  date: string;
  time: string;
  type: 'festival' | 'ceremony' | 'special' | 'regular';
  importance: 'high' | 'medium' | 'low';
}

export const TEMPLES: Temple[] = [
  { id: 1, name: 'Somnath Temple', location: 'Gujarat' },
  { id: 2, name: 'Dwarka Temple', location: 'Gujarat' },
  { id: 3, name: 'Ambaji Temple', location: 'Gujarat' },
  { id: 4, name: 'Pavagadh Temple', location: 'Gujarat' },
];

export interface PrayerScheduleItem {
  name: string;
  time: string;
  description: string;
  status: 'completed' | 'upcoming' | 'ongoing';
}

export interface TempleEvent {
  id: string;
  templeId: number;
  title: string;
  description: string;
  date: string;
  time: string;
  type: 'festival' | 'ceremony' | 'special' | 'regular';
  importance: 'high' | 'medium' | 'low';
}

export const TEMPLE_PRAYER_SCHEDULES: Record<number, PrayerScheduleItem[]> = {
  1: [ // Somnath Temple
    { name: 'Morning Aarti', time: '05:30 AM', description: 'Mangala Aarti', status: 'completed' },
    { name: 'Abhishek', time: '06:00 AM', description: 'Morning Abhishek Ceremony', status: 'completed' },
    { name: 'Morning Pooja', time: '07:00 AM', description: 'Regular Morning Pooja', status: 'completed' },
    { name: 'Midday Aarti', time: '12:00 PM', description: 'Madhyahna Aarti', status: 'completed' },
    { name: 'Evening Aarti', time: '06:30 PM', description: 'Sandhya Aarti', status: 'upcoming' },
    { name: 'Evening Pooja', time: '07:00 PM', description: 'Regular Evening Pooja', status: 'upcoming' },
    { name: 'Night Aarti', time: '08:30 PM', description: 'Shayana Aarti', status: 'upcoming' },
    { name: 'Special Ceremony', time: '09:00 PM', description: 'Weekly Special Pooja', status: 'upcoming' },
  ],
  2: [ // Dwarka Temple
    { name: 'Mangala Aarti', time: '05:00 AM', description: 'Morning Worship', status: 'completed' },
    { name: 'Abhishek Ceremony', time: '06:30 AM', description: 'Sacred Bath Ceremony', status: 'completed' },
    { name: 'Morning Darshan', time: '07:00 AM', description: 'Morning Devotee Viewing', status: 'completed' },
    { name: 'Midday Pooja', time: '12:30 PM', description: 'Afternoon Prayer', status: 'completed' },
    { name: 'Evening Aarti', time: '07:00 PM', description: 'Sandhya Aarti', status: 'upcoming' },
    { name: 'Night Ceremony', time: '08:00 PM', description: 'Evening Special Pooja', status: 'upcoming' },
    { name: 'Shayana Aarti', time: '09:30 PM', description: 'Night Prayer', status: 'upcoming' },
  ],
  3: [ // Ambaji Temple
    { name: 'Pratah Kal Pooja', time: '05:15 AM', description: 'Morning Prayer', status: 'completed' },
    { name: 'Mangala Aarti', time: '06:00 AM', description: 'Morning Aarti', status: 'completed' },
    { name: 'Abhishek', time: '07:30 AM', description: 'Morning Abhishek', status: 'completed' },
    { name: 'Madhyahna Aarti', time: '12:15 PM', description: 'Midday Aarti', status: 'completed' },
    { name: 'Sandhya Aarti', time: '06:45 PM', description: 'Evening Aarti', status: 'upcoming' },
    { name: 'Shayana Aarti', time: '08:00 PM', description: 'Night Aarti', status: 'upcoming' },
  ],
  4: [ // Pavagadh Temple
    { name: 'Morning Aarti', time: '05:45 AM', description: 'Sunrise Prayer', status: 'completed' },
    { name: 'Abhishek Ceremony', time: '06:30 AM', description: 'Morning Ritual', status: 'completed' },
    { name: 'Regular Pooja', time: '07:15 AM', description: 'Morning Worship', status: 'completed' },
    { name: 'Afternoon Aarti', time: '12:45 PM', description: 'Midday Prayer', status: 'completed' },
    { name: 'Evening Aarti', time: '07:15 PM', description: 'Sunset Aarti', status: 'upcoming' },
    { name: 'Night Pooja', time: '08:30 PM', description: 'Evening Ceremony', status: 'upcoming' },
  ],
};

export const TEMPLE_EVENTS: TempleEvent[] = [
  // Somnath Events
  {
    id: '1',
    templeId: 1,
    title: 'Maha Shivaratri',
    description: 'Annual celebration of Lord Shiva with special night-long prayers',
    date: '2025-03-14',
    time: '18:00 - 06:00',
    type: 'festival',
    importance: 'high'
  },
  {
    id: '2',
    templeId: 1,
    title: 'Monthly Full Moon Ceremony',
    description: 'Special prayers and offerings during full moon',
    date: '2025-09-28',
    time: '19:00 - 21:00',
    type: 'ceremony',
    importance: 'medium'
  },

  // Dwarka Events
  {
    id: '3',
    templeId: 2,
    title: 'Janmashtami Celebration',
    description: 'Birthday celebration of Lord Krishna with special ceremonies',
    date: '2025-08-25',
    time: '00:00 - 24:00',
    type: 'festival',
    importance: 'high'
  },
  {
    id: '4',
    templeId: 2,
    title: 'Dwarkadheesh Temple Anniversary',
    description: 'Annual celebration of temple establishment',
    date: '2025-10-15',
    time: '06:00 - 22:00',
    type: 'special',
    importance: 'high'
  },

  // Ambaji Events
  {
    id: '5',
    templeId: 3,
    title: 'Navratri Festival',
    description: 'Nine-day celebration with special prayers and dances',
    date: '2025-10-03',
    time: '05:00 - 22:00',
    type: 'festival',
    importance: 'high'
  },
  {
    id: '6',
    templeId: 3,
    title: 'Monthly Amavasya Ceremony',
    description: 'Special new moon rituals and prayers',
    date: '2025-09-26',
    time: '18:00 - 20:00',
    type: 'ceremony',
    importance: 'medium'
  },

  // Pavagadh Events
  {
    id: '7',
    templeId: 4,
    title: 'Mahashivaratri',
    description: 'Special night-long prayers for Lord Shiva',
    date: '2025-03-14',
    time: '18:00 - 06:00',
    type: 'festival',
    importance: 'high'
  },
  {
    id: '8',
    templeId: 4,
    title: 'Fort Festival',
    description: 'Cultural celebration at Pavagadh Fort',
    date: '2025-11-20',
    time: '10:00 - 18:00',
    type: 'special',
    importance: 'medium'
  },
];
