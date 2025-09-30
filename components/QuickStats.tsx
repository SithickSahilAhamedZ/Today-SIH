import React from 'react';
import { Icon } from '@iconify/react';

interface QuickStatsProps {
  isOnline: boolean;
  selectedTemple: any;
}

const QuickStats: React.FC<QuickStatsProps> = ({ isOnline, selectedTemple }) => {
  const [currentTime, setCurrentTime] = React.useState(new Date());
  
  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    if (hour < 21) return 'Good Evening';
    return 'Good Night';
  };

  const stats = [
    {
      icon: 'material-symbols:schedule',
      label: 'Current Time',
      value: formatTime(currentTime),
      color: 'text-blue-600'
    },
    {
      icon: 'material-symbols:groups',
      label: 'Live Crowd',
      value: isOnline ? 'Medium' : 'N/A',
      color: 'text-green-600'
    },
    {
      icon: 'material-symbols:temp-preferences-eco',
      label: 'Weather',
      value: isOnline ? '28°C' : 'N/A',
      color: 'text-orange-600'
    },
    {
      icon: 'material-symbols:event-available',
      label: 'Next Prayer',
      value: '7:00 PM',
      color: 'text-purple-600'
    }
  ];

  return (
    <div className="mb-6">
      {/* Welcome Header */}
      <div className="mb-4">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1">
          {getGreeting()} 🙏
        </h2>
        <p className="text-gray-600">
          Welcome to <span className="font-semibold text-orange-600">{selectedTemple.name}</span>
        </p>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {stats.map((stat, index) => (
          <div 
            key={index}
            className="card-enhanced p-4 text-center animate-fade-in"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl ${stat.color} bg-opacity-10 mb-3`}>
              <Icon icon={stat.icon} className={`text-xl ${stat.color}`} />
            </div>
            <div className="text-lg font-bold text-gray-800 mb-1">{stat.value}</div>
            <div className="text-xs text-gray-600 font-medium">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Today's Special */}
      <div className="mt-4 p-4 bg-gradient-to-r from-orange-100 to-amber-100 rounded-2xl border border-orange-200">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <Icon icon="material-symbols:stars" className="text-white text-xl" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-800 mb-1">Today's Special</h3>
            <p className="text-sm text-gray-700 leading-relaxed">
              <span className="font-medium">Maha Aarti</span> at 7:00 PM - Join the divine evening celebration with traditional prayers and offerings.
            </p>
          </div>
          <div className="flex-shrink-0">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-200 text-orange-800">
              <Icon icon="material-symbols:schedule" className="mr-1" />
              7:00 PM
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickStats;