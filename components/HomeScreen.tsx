import React, { useState } from 'react';
import { Icon } from '@iconify/react';
import Card from './ui/Card';
import PrayerSchedule from './PrayerSchedule';
import CalendarDropdown from './CalendarDropdown';
import LiveCrowdStatus from './LiveCrowdStatus';
import ZoneDetails from './ZoneDetails';
import TempleSelector from './TempleSelector';
import QuickStats from './QuickStats';
import { getForecastSummary } from '../services/geminiService';
import { ForecastData, Temple } from '../types';
import { TEMPLE_PRAYER_SCHEDULES, TEMPLE_EVENTS } from '../constants';

// Prayer schedule data - placeholder data for Somnath Temple
const prayerSchedule = [
    { name: 'Morning Aarti', time: '05:30 AM', description: 'Mangala Aarti', status: 'completed' as const },
    { name: 'Abhishek', time: '06:00 AM', description: 'Morning Abhishek Ceremony', status: 'completed' as const },
    { name: 'Morning Pooja', time: '07:00 AM', description: 'Regular Morning Pooja', status: 'completed' as const },
    { name: 'Midday Aarti', time: '12:00 PM', description: 'Madhyahna Aarti', status: 'completed' as const },
    { name: 'Evening Aarti', time: '06:30 PM', description: 'Sandhya Aarti', status: 'upcoming' as const },
    { name: 'Evening Pooja', time: '07:00 PM', description: 'Regular Evening Pooja', status: 'upcoming' as const },
    { name: 'Night Aarti', time: '08:30 PM', description: 'Shayana Aarti', status: 'upcoming' as const },
    { name: 'Special Ceremony', time: '09:00 PM', description: 'Weekly Special Pooja', status: 'upcoming' as const },
];

// Dummy data for forecast
const dummyForecast: ForecastData[] = [
    { day: 'Mon', level: 4 },
    { day: 'Tue', level: 5 },
    { day: 'Wed', level: 7 },
    { day: 'Thu', level: 6 },
    { day: 'Fri', level: 8 },
    { day: 'Sat', level: 10 },
    { day: 'Sun', level: 9 },
];

const FORECAST_CACHE_KEY = 'forecastSummaryCache';
const FORECAST_CACHE_DURATION = 3600 * 1000; // 1 hour in milliseconds

// Calendar data and functions
interface TempleEvent {
  id: string;
  templeId: number;
  title: string;
  description: string;
  date: string;
  time: string;
  type: 'festival' | 'ceremony' | 'special' | 'regular';
  importance: 'high' | 'medium' | 'low';
}

const templeEvents: TempleEvent[] = [
  {
    id: '1',
    templeId: 1,
    title: 'Maha Shivaratri',
    description: 'Annual festival celebrating Lord Shiva',
    date: '2025-02-14',
    time: '18:00 - 06:00',
    type: 'festival',
    importance: 'high'
  },
  {
    id: '2',
    templeId: 1,
    title: 'Daily Morning Aarti',
    description: 'Regular morning prayer ceremony',
    date: '2025-01-09',
    time: '05:30 - 06:30',
    type: 'regular',
    importance: 'medium'
  },
  {
    id: '3',
    templeId: 2,
    title: 'Dwarka Festival',
    description: 'Special festival at Dwarka Temple',
    date: '2025-03-15',
    time: '10:00 - 18:00',
    type: 'festival',
    importance: 'high'
  },
  {
    id: '4',
    templeId: 2,
    title: 'Daily Sandhya Aarti',
    description: 'Evening prayer ceremony',
    date: '2025-01-09',
    time: '18:30 - 19:30',
    type: 'regular',
    importance: 'low'
  },
  {
    id: '5',
    templeId: 3,
    title: 'Ambaji Fair',
    description: 'Annual fair at Ambaji Temple',
    date: '2025-04-10',
    time: '08:00 - 20:00',
    type: 'festival',
    importance: 'high'
  },
  {
    id: '6',
    templeId: 3,
    title: 'Daily Sandhya Aarti',
    description: 'Evening prayer ceremony',
    date: '2025-01-09',
    time: '18:30 - 19:30',
    type: 'regular',
    importance: 'low'
  },
  {
    id: '7',
    templeId: 4, // Badrinath
    title: 'Temple Opening Ceremony',
    description: 'Annual opening of the temple after winter closure',
    date: '2025-04-26',
    time: '05:00',
    type: 'ceremony',
    importance: 'high'
  },
  {
    id: '8',
    templeId: 5, // Kedarnath
    title: 'Winter Closure',
    description: 'Temple closes for winter season',
    date: '2025-11-01',
    time: '18:00',
    type: 'ceremony',
    importance: 'high'
  },
  {
    id: '9',
    templeId: 6, // Amarnath
    title: 'Amarnath Yatra Begins',
    description: 'Annual pilgrimage to Amarnath cave begins',
    date: '2025-06-15',
    time: '04:00',
    type: 'festival',
    importance: 'high'
  },
  {
    id: '10',
    templeId: 7, // Vaishno Devi
    title: 'Navratri Special',
    description: 'Nine-day festival with special prayers and celebrations',
    date: '2025-03-22',
    time: '00:00 - 24:00',
    type: 'festival',
    importance: 'high'
  }
];

interface HomeScreenProps {
    isOnline: boolean;
    onNavigate: (view: string) => void;
    selectedTemple: Temple;
    onTempleChange: (temple: Temple) => void;
}

export default function Home({ isOnline, onNavigate, selectedTemple, onTempleChange }: HomeScreenProps) {
    const [showCalendar, setShowCalendar] = useState(false);

    // Get temple-specific prayer schedule
    const prayerSchedule = TEMPLE_PRAYER_SCHEDULES[selectedTemple.id] || TEMPLE_PRAYER_SCHEDULES[1];

    // Get temple-specific events
    const templeEvents = TEMPLE_EVENTS.filter(event => event.templeId === selectedTemple.id);

    // Live queue simulation
    const [mainQueueWaitTime, setMainQueueWaitTime] = useState(25);
    const [userQueuePosition, setUserQueuePosition] = useState(12);
    const [peoplePerMinute, setPeoplePerMinute] = useState(18);
    const [queueMovementSpeed, setQueueMovementSpeed] = useState<'Slow' | 'Normal' | 'Fast'>('Normal');
    const [isUpdating, setIsUpdating] = useState(false);
    const [lastUpdateTime, setLastUpdateTime] = useState(new Date());
    const [stats, setStats] = useState({
        lastUpdated: new Date(),
        currentVisitors: 1559,
        averageDensity: 71,
        highRiskZones: 5,
        dataConfidence: 87
    });

    // Alternative routes data
    const [alternativeRoutes, setAlternativeRoutes] = useState([
        { name: 'East Gate', waitTime: 15 },
        { name: 'VIP Queue', waitTime: 8 },
        { name: 'Senior Citizen', waitTime: 12 }
    ]);

    // Format time function
    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('en-GB', {
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    // Update queue data every 8 seconds
    React.useEffect(() => {
        const updateInterval = setInterval(() => {
            setIsUpdating(true);

            // Simulate realistic queue changes
            setMainQueueWaitTime(prev => {
                const change = Math.floor(Math.random() * 10) - 5; // ±5 minutes
                return Math.max(5, Math.min(90, prev + change));
            });

            // Update visitor count
            setStats(prev => ({
                ...prev,
                currentVisitors: prev.currentVisitors + Math.floor(Math.random() * 20) - 10,
                lastUpdated: new Date()
            }));

            // Update people per minute rate (realistic temple flow)
            setPeoplePerMinute(prev => {
                const change = Math.floor(Math.random() * 4) - 2; // ±2 people/min
                return Math.max(5, Math.min(20, prev + change));
            });

            // Update alternative route wait times
            setAlternativeRoutes(prev => prev.map(route => ({
                ...route,
                waitTime: Math.max(5, route.waitTime + Math.floor(Math.random() * 7) - 3) // ±3 minutes
            })));

            // Set queue movement speed based on people per minute
            const newPeoplePerMin = peoplePerMinute;
            if (newPeoplePerMin >= 15) setQueueMovementSpeed('Fast');
            else if (newPeoplePerMin >= 10) setQueueMovementSpeed('Normal');
            else setQueueMovementSpeed('Slow');

            setLastUpdateTime(new Date());
            setIsUpdating(false);
        }, 8000); // Update every 8 seconds

        return () => clearInterval(updateInterval);
    }, [peoplePerMinute]);

    // Track updates for visual feedback
    React.useEffect(() => {
        if (stats.lastUpdated.getTime() !== lastUpdateTime.getTime()) {
            setIsUpdating(true);
            setLastUpdateTime(stats.lastUpdated);
            const timer = setTimeout(() => setIsUpdating(false), 1000);
            return () => clearTimeout(timer);
        }
    }, [stats.lastUpdated, lastUpdateTime]);

    // Update queue position based on people per minute rate
    React.useEffect(() => {
        const interval = setInterval(() => {
            setUserQueuePosition(prev => {
                const newPosition = prev - (peoplePerMinute / 60); // Decrease position based on rate per second
                return Math.max(0, Math.round(newPosition * 10) / 10); // Keep one decimal, minimum 0
            });
        }, 1000); // Update every second

        return () => clearInterval(interval);
    }, [peoplePerMinute]);

    const getSpeedColor = (speed: string) => {
        switch (speed) {
            case 'Fast': return 'text-green-600 bg-green-100';
            case 'Normal': return 'text-blue-600 bg-blue-100';
            case 'Slow': return 'text-red-600 bg-red-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white p-6 shadow-lg">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <span className="text-3xl">🕉️</span>
                            <div>
                                <h1 className="text-2xl font-bold">Yatra 360</h1>
                                <p className="text-orange-100">Temple Management System</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                                isOnline ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                                <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                {isOnline ? 'Online' : 'Offline'}
                            </div>
                            <button
                                onClick={() => setShowCalendar(!showCalendar)}
                                className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition-all duration-300"
                            >
                                <span className="material-symbols-outlined text-xl">calendar_month</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto p-6 space-y-6">
                {/* Quick Stats */}
                <QuickStats
                    isOnline={isOnline}
                    selectedTemple={selectedTemple}
                />
                
                {/* 7-Day Crowd Forecast */}
                <Card className="transition-all duration-300 shadow-sm p-4 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-2">
                            <span className="material-symbols-outlined text-blue-600 text-xl">analytics</span>
                            <h3 className="text-lg font-bold text-gray-800">7-Day Crowd Forecast</h3>
                        </div>
                        <div className="text-right">
                            <p className="text-sm font-medium text-blue-600">Temple Capacity</p>
                            <p className="text-xs text-gray-500">Based on historical data</p>
                        </div>
                    </div>

                    {/* Forecast Grid - Fully Responsive */}
                    <div className="grid grid-cols-7 gap-2 sm:gap-3">
                        {dummyForecast.map((day, index) => {
                            const getCrowdColor = (level: number) => {
                                if (level <= 3) return { bg: 'bg-green-100', text: 'text-green-700', bar: 'bg-green-500' };
                                if (level <= 6) return { bg: 'bg-yellow-100', text: 'text-yellow-700', bar: 'bg-yellow-500' };
                                if (level <= 8) return { bg: 'bg-orange-100', text: 'text-orange-700', bar: 'bg-orange-500' };
                                return { bg: 'bg-red-100', text: 'text-red-700', bar: 'bg-red-500' };
                            };

                            const colors = getCrowdColor(day.level);
                            const isToday = index === 0; // Assuming first day is today

                            return (
                                <div key={day.day} className="flex flex-col items-center space-y-2">
                                    {/* Day Label */}
                                    <div className={`text-xs font-semibold px-2 py-1 rounded-full min-w-[32px] text-center ${
                                        isToday ? 'bg-blue-500 text-white' : 'text-gray-600 bg-gray-100'
                                    }`}>
                                        {day.day}
                                    </div>

                                    {/* Crowd Level Bar */}
                                    <div className="flex flex-col items-center space-y-1">
                                        <div className="w-6 h-16 bg-gray-200 rounded-full relative overflow-hidden shadow-inner">
                                            <div
                                                className={`absolute bottom-0 w-full ${colors.bar} rounded-full transition-all duration-500 ease-out`}
                                                style={{ height: `${(day.level / 10) * 100}%` }}
                                            ></div>
                                        </div>

                                        {/* Level Number */}
                                        <div className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${colors.bg} ${colors.text} min-w-[20px] text-center`}>
                                            {day.level}
                                        </div>
                                    </div>

                                    {/* Crowd Status Text - Hidden on very small screens */}
                                    <div className="hidden sm:block text-center">
                                        <p className={`text-xs font-medium ${colors.text}`}>
                                            {day.level <= 3 ? 'Low' : day.level <= 6 ? 'Medium' : day.level <= 8 ? 'High' : 'Very High'}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Forecast Summary - Responsive */}
                    <div className="mt-4 pt-3 border-t border-blue-200">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-center space-y-1 sm:space-y-0 sm:space-x-2">
                                <div className="flex items-center justify-center space-x-1">
                                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                    <span className="text-xs font-medium text-gray-600">Low (1-3)</span>
                                </div>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-center space-y-1 sm:space-y-0 sm:space-x-2">
                                <div className="flex items-center justify-center space-x-1">
                                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                                    <span className="text-xs font-medium text-gray-600">Medium (4-6)</span>
                                </div>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-center space-y-1 sm:space-y-0 sm:space-x-2">
                                <div className="flex items-center justify-center space-x-1">
                                    <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                    <span className="text-xs font-medium text-gray-600">High (7-10)</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Peak Day Highlight */}
                    <div className="mt-3 p-2 bg-blue-100 rounded-lg">
                        <div className="flex items-center justify-center space-x-2">
                            <span className="material-symbols-outlined text-blue-600 text-sm">warning</span>
                            <p className="text-xs font-medium text-blue-800">
                                Peak day: <span className="font-bold">Saturday (Level 10)</span>
                                - Consider visiting on Tuesday or Wednesday for shorter queues
                            </p>
                        </div>
                    </div>
                </Card>

                {/* Main Darshan Queue */}
                <Card className="transition-all duration-300 shadow-sm p-3">
                    <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center space-x-1">
                            <h3 className="text-sm font-bold text-gray-800">Main Darshan Queue</h3>
                            <div className={`flex items-center space-x-1 text-xs px-1.5 py-0.5 rounded-full transition-all duration-300 ${
                                isUpdating ? 'bg-blue-100 text-blue-700 animate-pulse' : 'bg-green-100 text-green-700'
                            }`}>
                                <span 
                                    className={`material-symbols-outlined text-xs ${isUpdating ? 'animate-spin' : ''}`}
                                >
                                    {isUpdating ? 'refresh' : 'check_circle'}
                                </span>
                                <span className="font-medium text-xs">{isUpdating ? '...' : 'Live'}</span>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className={`text-lg font-bold text-amber-600 transition-all duration-300 ${
                                isUpdating ? 'scale-105' : ''
                            }`}>
                                {mainQueueWaitTime}m
                            </p>
                            <p className="text-xs text-gray-500">wait</p>
                        </div>
                    </div>

                    {/* Ultra Compact Queue Stats */}
                    <div className="mb-2 p-1.5 bg-gray-50 rounded-md">
                        <div className="flex justify-between items-center">
                            <span className="text-xs font-medium text-gray-600">Flow</span>
                            <div className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${getSpeedColor(queueMovementSpeed)}`}>
                                {peoplePerMinute}/min
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <span className="text-xs font-medium text-gray-600">Position</span>
                            <span className={`text-sm font-bold transition-all duration-300 ${
                                userQueuePosition === 0 ? 'text-green-600 animate-bounce' : 'text-amber-600'
                            }`}>
                                {userQueuePosition === 0 ? '🎉 Ready!' : `#${userQueuePosition}`}
                            </span>
                        </div>

                        <div className="relative">
                            <div className="w-full bg-gray-200 rounded-full h-1.5 shadow-inner overflow-hidden">
                                <div
                                    className={`h-1.5 rounded-full transition-all duration-1000 ease-out ${
                                        mainQueueWaitTime > 60 ? 'bg-gradient-to-r from-red-400 to-red-600' :
                                        mainQueueWaitTime > 30 ? 'bg-gradient-to-r from-amber-400 to-amber-600' :
                                        'bg-gradient-to-r from-green-400 to-green-600'
                                    }`}
                                    style={{ width: `${Math.min((mainQueueWaitTime / 90) * 100, 100)}%` }}
                                ></div>
                            </div>
                            <div className="flex justify-between mt-1 text-xs">
                                <span className="text-gray-500 text-xs">Fast</span>
                                <span className={`font-semibold text-xs ${
                                    mainQueueWaitTime > 60 ? 'text-red-600' :
                                    mainQueueWaitTime > 30 ? 'text-amber-600' :
                                    'text-green-600'
                                }`}>
                                    {mainQueueWaitTime}m
                                </span>
                                <span className="text-gray-500 text-xs">Slow</span>
                            </div>
                        </div>

                        <div className="bg-amber-50/50 rounded-md p-2">
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-medium text-gray-700">Alternatives</span>
                                <span className="text-xs text-gray-500">faster</span>
                            </div>
                            <div className="space-y-1">
                                {alternativeRoutes.slice(0, 2).map((route, index) => (
                                    <div key={index} className="flex items-center justify-between">
                                        <div className="flex items-center space-x-1">
                                            <span className="material-symbols-outlined text-gray-400 text-xs">arrow_forward</span>
                                            <p className="font-semibold text-gray-700 text-xs truncate max-w-[100px]">{route.name}</p>
                                        </div>
                                        <div className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${
                                            route.waitTime < 20 ? 'text-green-800 bg-green-100' :
                                            route.waitTime < 35 ? 'text-amber-800 bg-amber-100' :
                                            'text-red-800 bg-red-100'
                                        }`}>
                                            {route.waitTime}m
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Smart Tip - Compact */}
                        <div className="p-1.5 bg-blue-50 rounded-md">
                            <div className="flex items-center space-x-1 mb-1">
                                <span className="material-symbols-outlined text-blue-600 text-xs">lightbulb</span>
                                <span className="text-xs font-medium text-blue-800">Tip</span>
                            </div>
                            <p className="text-xs text-blue-700 leading-tight">
                                {mainQueueWaitTime > 45 ?
                                    'High wait - try alternative routes' :
                                    mainQueueWaitTime > 25 ?
                                    'Moderate flow' :
                                    'Fast queue!'
                                }
                            </p>
                        </div>
                    </div>
                </Card>

                {/* Live Crowd Status */}
                <LiveCrowdStatus
                    currentVisitors={stats.currentVisitors}
                    averageDensity={stats.averageDensity}
                    highRiskZones={stats.highRiskZones}
                    dataConfidence={stats.dataConfidence}
                />

                {/* Temple Areas Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                    {/* Exit Area */}
                    <Card className="transition-all duration-300 shadow-sm p-3 bg-gradient-to-br from-green-50 to-emerald-50">
                        <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center space-x-1">
                                <span className="material-symbols-outlined text-green-600 text-lg">logout</span>
                                <h3 className="text-sm font-bold text-gray-800">Exit Area</h3>
                            </div>
                            <div className="text-right">
                                <p className="text-lg font-bold text-green-600">5m</p>
                                <p className="text-xs text-gray-500">wait</p>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-medium text-gray-600">Status</span>
                                <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded-full">Clear</span>
                            </div>
                        </div>
                    </Card>

                    {/* Cloak Room */}
                    <Card className="transition-all duration-300 shadow-sm p-3 bg-gradient-to-br from-blue-50 to-indigo-50">
                        <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center space-x-1">
                                <span className="material-symbols-outlined text-blue-600 text-lg">luggage</span>
                                <h3 className="text-sm font-bold text-gray-800">Cloak Room</h3>
                            </div>
                            <div className="text-right">
                                <p className="text-lg font-bold text-blue-600">8m</p>
                                <p className="text-xs text-gray-500">wait</p>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-medium text-gray-600">Available</span>
                                <span className="text-xs font-bold text-blue-600">24/30</span>
                            </div>
                        </div>
                    </Card>

                    {/* Main Entrance */}
                    <Card className="transition-all duration-300 shadow-sm p-3 bg-gradient-to-br from-purple-50 to-violet-50">
                        <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center space-x-1">
                                <span className="material-symbols-outlined text-purple-600 text-lg">door_open</span>
                                <h3 className="text-sm font-bold text-gray-800">Main Entrance</h3>
                            </div>
                            <div className="text-right">
                                <p className="text-lg font-bold text-purple-600">12m</p>
                                <p className="text-xs text-gray-500">wait</p>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-medium text-gray-600">Security</span>
                                <span className="text-xs font-bold text-purple-600 bg-purple-100 px-2 py-1 rounded-full">Normal</span>
                            </div>
                        </div>
                    </Card>

                    {/* Prasad Counter */}
                    <Card className="transition-all duration-300 shadow-sm p-3 bg-gradient-to-br from-orange-50 to-amber-50">
                        <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center space-x-1">
                                <span className="material-symbols-outlined text-orange-600 text-lg">restaurant</span>
                                <h3 className="text-sm font-bold text-gray-800">Prasad Counter</h3>
                            </div>
                            <div className="text-right">
                                <p className="text-lg font-bold text-orange-600">6m</p>
                                <p className="text-xs text-gray-500">wait</p>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-medium text-gray-600">Available</span>
                                <span className="text-xs font-bold text-orange-600">Yes</span>
                            </div>
                        </div>
                    </Card>

                    {/* Shoes Area */}
                    <Card className="transition-all duration-300 shadow-sm p-3 bg-gradient-to-br from-red-50 to-rose-50">
                        <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center space-x-1">
                                <Icon icon="solar:smartphone-bold" className="text-red-600 text-lg" />
                                <h3 className="text-sm font-bold text-gray-800">Shoes Area</h3>
                            </div>
                            <div className="text-right">
                                <p className="text-lg font-bold text-red-600">4m</p>
                                <p className="text-xs text-gray-500">wait</p>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-medium text-gray-600">Capacity</span>
                                <span className="text-xs font-bold text-red-600">85%</span>
                            </div>
                        </div>
                    </Card>

                    {/* Rest Area */}
                    <Card className="transition-all duration-300 shadow-sm p-3 bg-gradient-to-br from-teal-50 to-cyan-50">
                        <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center space-x-1">
                                <Icon icon="solar:armchair-bold" className="text-teal-600 text-lg" />
                                <h3 className="text-sm font-bold text-gray-800">Rest Area</h3>
                            </div>
                            <div className="text-right">
                                <p className="text-lg font-bold text-teal-600">2m</p>
                                <p className="text-xs text-gray-500">wait</p>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-medium text-gray-600">Seats</span>
                                <span className="text-xs font-bold text-teal-600">18/20</span>
                            </div>
                        </div>
                    </Card>

                    {/* Information Desk */}
                    <Card className="transition-all duration-300 shadow-sm p-3 bg-gradient-to-br from-yellow-50 to-amber-50 col-span-1 sm:col-span-2 lg:col-span-1">
                        <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center space-x-1">
                                <Icon icon="solar:info-circle-bold" className="text-yellow-600 text-lg" />
                                <h3 className="text-sm font-bold text-gray-800">Information Desk</h3>
                            </div>
                            <div className="text-right">
                                <p className="text-lg font-bold text-yellow-600">3m</p>
                                <p className="text-xs text-gray-500">wait</p>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-medium text-gray-600">Staff</span>
                                <span className="text-xs font-bold text-yellow-600 bg-yellow-100 px-2 py-1 rounded-full">Available</span>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Zone Details */}
                <ZoneDetails />

                {/* Family Connect Highlight Card */}
                <div className="bg-gradient-to-br from-orange-400 via-red-400 to-pink-500 p-6 rounded-3xl text-white shadow-xl mb-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                                    <Icon icon="solar:users-group-rounded-bold-duotone" className="text-2xl" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold">Family Connect</h3>
                                    <p className="text-white/80 text-sm">Stay connected with your family</p>
                                </div>
                            </div>
                            <div className="animate-bounce-gentle">
                                <Icon icon="solar:heart-bold-duotone" className="text-4xl text-pink-200" />
                            </div>
                        </div>
                        <p className="text-white/90 text-sm mb-4">
                            Invite family members, share live locations, coordinate accommodation, and stay together during your pilgrimage journey.
                        </p>
                        <button
                            onClick={() => onNavigate('FamilyConnect')}
                            className="bg-white/20 hover:bg-white/30 backdrop-blur-sm px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center gap-2"
                        >
                            <Icon icon="solar:add-circle-bold-duotone" className="text-lg" />
                            Create or Join Family Group
                        </button>
                    </div>
                </div>

                {/* Bottom Quick Actions */}
                <div className="grid grid-cols-4 gap-3 mb-6">
                    <button
                        onClick={() => onNavigate('FamilyConnect')}
                        className="card-interactive bg-gradient-to-br from-blue-500 to-indigo-600 text-white p-4 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95 flex flex-col items-center justify-center gap-2"
                    >
                        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                            <Icon icon="material-symbols:people-group" className="text-xl" />
                        </div>
                        <span className="text-xs font-medium">Family</span>
                    </button>
                    <button
                        onClick={() => onNavigate('Emergency')}
                        className="card-interactive bg-gradient-to-br from-red-500 to-red-600 text-white p-4 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95 flex flex-col items-center justify-center gap-2"
                    >
                        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                            <Icon icon="material-symbols:emergency" className="text-xl" />
                        </div>
                        <span className="text-xs font-medium">Emergency</span>
                    </button>
                    <button
                        onClick={() => onNavigate('Calendar')}
                        className="card-interactive bg-gradient-to-br from-green-500 to-emerald-600 text-white p-4 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95 flex flex-col items-center justify-center gap-2"
                    >
                        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                            <Icon icon="material-symbols:calendar-month" className="text-xl" />
                        </div>
                        <span className="text-xs font-medium">Calendar</span>
                    </button>
                    <button
                        onClick={() => onNavigate('Yatra')}
                        className="card-interactive bg-gradient-to-br from-purple-500 to-indigo-600 text-white p-4 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95 flex flex-col items-center justify-center gap-2"
                    >
                        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                            <Icon icon="material-symbols:explore" className="text-xl" />
                        </div>
                        <span className="text-xs font-medium">My Yatra</span>
                    </button>
                </div>
            </div>

            {/* Calendar Dropdown */}
            <CalendarDropdown
                events={templeEvents}
                isOpen={showCalendar}
                onClose={() => setShowCalendar(false)}
            />
        </div>
    );
}