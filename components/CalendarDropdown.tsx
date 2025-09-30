import React from 'react';
import Card from './ui/Card';

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

interface CalendarDropdownProps {
  events: TempleEvent[];
  isOpen: boolean;
  onClose: () => void;
}

const getEventTypeColor = (type: TempleEvent['type']) => {
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
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });
};

const isUpcoming = (dateString: string) => {
  const eventDate = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return eventDate >= today;
};

const CalendarDropdown: React.FC<CalendarDropdownProps> = ({ events, isOpen, onClose }) => {
  if (!isOpen) return null;

  const upcomingEvents = events.filter(event => isUpcoming(event.date)).slice(0, 5);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end justify-center p-4">
      <Card className="w-full max-w-md max-h-[80vh] overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-bold text-gray-800">Upcoming Events</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-1"
          >
            <iconify-icon icon="solar:close-circle-bold" className="text-xl"></iconify-icon>
          </button>
        </div>

        <div className="max-h-96 overflow-y-auto p-4">
          {upcomingEvents.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No upcoming events</p>
          ) : (
            <div className="space-y-3">
              {upcomingEvents.map((event) => (
                <div key={event.id} className={`p-3 rounded-lg border ${getEventTypeColor(event.type)}`}>
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-sm font-semibold text-gray-800 flex-1 mr-2">{event.title}</h4>
                    <span className="text-xs font-bold text-amber-600 whitespace-nowrap">{formatDate(event.date)}</span>
                  </div>
                  <p className="text-xs text-gray-700 mb-2">{event.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold text-gray-600">
                      {getImportanceIcon(event.importance)}
                    </span>
                    <span className="text-xs text-gray-500">{event.time}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="w-full bg-amber-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-amber-700 transition-colors"
          >
            Close
          </button>
        </div>
      </Card>
    </div>
  );
};

export default CalendarDropdown;