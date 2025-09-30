import React from 'react';
import { Icon } from '@iconify/react';
import Card from './ui/Card';
import { TEMPLES, TEMPLE_EVENTS, TempleEvent } from '../constants';
import { Temple } from '../types';

interface CalendarScreenProps {
  selectedTemple: Temple;
}

const CalendarScreen: React.FC<CalendarScreenProps> = ({ selectedTemple }) => {
  // Filter events for the selected temple
  const templeEvents = TEMPLE_EVENTS.filter(event => event.templeId === selectedTemple.id);

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'festival': return 'bg-red-100 text-red-800 border-red-200';
      case 'ceremony': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'special': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'regular': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getImportanceIcon = (importance: TempleEvent['importance']) => {
    switch (importance) {
      case 'high': return '⭐⭐⭐';
      case 'medium': return '⭐⭐';
      case 'low': return '⭐';
      default: return '⭐';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const isUpcoming = (dateString: string) => {
    const eventDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return eventDate >= today;
  };

  const upcomingEvents = templeEvents.filter(event => isUpcoming(event.date));
  const pastEvents = templeEvents.filter(event => !isUpcoming(event.date));

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white p-6 shadow-lg">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4">
            <Icon icon="solar:calendar-bold" className="text-3xl" />
            <div>
              <h1 className="text-2xl font-bold">Temple Calendar</h1>
              <p className="text-orange-100">{selectedTemple.name} • {selectedTemple.location}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Upcoming Events */}
        <Card className="bg-white shadow-xl">
          <div className="flex items-center mb-4">
            <Icon icon="solar:clock-circle-bold" className="text-2xl text-orange-600 mr-3" />
            <h2 className="text-xl font-bold text-gray-800">Upcoming Events</h2>
          </div>

          {upcomingEvents.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No upcoming events scheduled</p>
          ) : (
            <div className="space-y-4">
              {upcomingEvents.map((event) => (
                <div key={event.id} className={`p-4 rounded-xl border-2 ${getEventTypeColor(event.type)} shadow-sm`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-bold text-lg">{event.title}</h3>
                        <span className="text-sm">{getImportanceIcon(event.importance)}</span>
                      </div>
                      <p className="text-gray-700 mb-2">{event.description}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <iconify-icon icon="solar:calendar-date-bold" className="text-base"></iconify-icon>
                          {formatDate(event.date)}
                        </span>
                        <span className="flex items-center gap-1">
                          <iconify-icon icon="solar:clock-circle-bold" className="text-base"></iconify-icon>
                          {event.time}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getEventTypeColor(event.type)}`}>
                        {event.type}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Past Events */}
        {pastEvents.length > 0 && (
          <Card className="bg-white shadow-xl">
            <div className="flex items-center mb-4">
              <iconify-icon icon="solar:history-bold" className="text-2xl text-gray-600 mr-3"></iconify-icon>
              <h2 className="text-xl font-bold text-gray-800">Past Events</h2>
            </div>

            <div className="space-y-4">
              {pastEvents.map((event) => (
                <div key={event.id} className="p-4 rounded-xl border-2 bg-gray-50 border-gray-200 shadow-sm opacity-75">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-bold text-lg text-gray-600">{event.title}</h3>
                        <span className="text-sm">{getImportanceIcon(event.importance)}</span>
                      </div>
                      <p className="text-gray-500 mb-2">{event.description}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <iconify-icon icon="solar:calendar-date-bold" className="text-base"></iconify-icon>
                          {formatDate(event.date)}
                        </span>
                        <span className="flex items-center gap-1">
                          <iconify-icon icon="solar:clock-circle-bold" className="text-base"></iconify-icon>
                          {event.time}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <span className="px-3 py-1 rounded-full text-xs font-medium capitalize bg-gray-100 text-gray-600">
                        {event.type}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CalendarScreen;