import React from 'react';
import Card from './ui/Card';

interface PrayerItem {
  name: string;
  time: string;
  description: string;
  status: 'completed' | 'upcoming';
}

interface PrayerScheduleProps {
  prayers: PrayerItem[];
  onViewCalendar: () => void;
}

const PrayerSchedule: React.FC<PrayerScheduleProps> = ({ prayers, onViewCalendar }) => {
  return (
    <Card className="mb-4 sm:mb-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-3 sm:mb-4 gap-2 sm:gap-0">
        <h3 className="text-base sm:text-lg font-bold text-gray-800">Today's Prayer Schedule</h3>
        <button
          onClick={onViewCalendar}
          className="text-amber-600 text-xs sm:text-sm font-medium hover:text-amber-700 transition-colors flex items-center justify-center sm:justify-start space-x-1 self-start sm:self-auto"
        >
          <span>View Full Calendar</span>
          <iconify-icon icon="solar:arrow-right-linear" className="text-xs sm:text-sm"></iconify-icon>
        </button>
      </div>

      <div className="space-y-2 sm:space-y-3">
        {prayers.map((prayer, index) => (
          <div key={index} className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2 sm:py-3 px-2 sm:px-0 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="flex-1 mb-2 sm:mb-0">
              <p className="text-sm sm:text-base font-medium text-gray-800">{prayer.name}</p>
              <p className="text-xs sm:text-sm text-gray-500">{prayer.description}</p>
            </div>
            <div className="text-left sm:text-right">
              <p className={`text-xs font-semibold mb-1 ${prayer.status === 'completed' ? 'text-green-600' : 'text-amber-600'}`}>
                {prayer.status === 'completed' ? '✓ Completed' : '⏰ Upcoming'}
              </p>
              <p className="text-sm sm:text-base font-bold text-gray-800">{prayer.time}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default PrayerSchedule;