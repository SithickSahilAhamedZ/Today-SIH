// FIX: Changed React import from namespace import ('* as React') to default import ('React') to resolve widespread JSX intrinsic element type errors. The default import is standard with modern TypeScript/React configurations and should restore the correct JSX type definitions.
import React from 'react';
import Card from './ui/Card';
import {} from '../types'; // For iconify-icon types

const LiveDarshanWaitingCard: React.FC = () => {
  const [darshanPosition, setDarshanPosition] = React.useState(7);
  const [waitTime, setWaitTime] = React.useState(105); // 90-120 min average
  const [isUpdating, setIsUpdating] = React.useState(false);
  const [lastUpdate, setLastUpdate] = React.useState(new Date());

  // Simulate live darshan queue movement
  React.useEffect(() => {
    const interval = setInterval(() => {
      setDarshanPosition(prev => {
        // Decrease position by 0.1-0.3 people per minute (realistic darshan pace)
        const decrease = Math.random() * 0.2 + 0.1;
        const newPosition = Math.max(0, prev - decrease);
        return Math.round(newPosition * 10) / 10; // Keep one decimal
      });

      setWaitTime(prev => {
        // Adjust wait time based on position (roughly 15 min per person)
        const baseTime = darshanPosition * 15;
        const variation = (Math.random() - 0.5) * 20; // ±10 min variation
        return Math.max(5, Math.round(baseTime + variation));
      });

      setIsUpdating(true);
      setLastUpdate(new Date());
      setTimeout(() => setIsUpdating(false), 1000);
    }, 3000); // Update every 3 seconds

    return () => clearInterval(interval);
  }, [darshanPosition]);

  const getQueueStatus = () => {
    if (darshanPosition <= 2) return { status: 'Very Low', color: 'text-green-600', bgColor: 'bg-green-100', progress: 15 };
    if (darshanPosition <= 5) return { status: 'Low', color: 'text-blue-600', bgColor: 'bg-blue-100', progress: 30 };
    if (darshanPosition <= 10) return { status: 'Moderate', color: 'text-amber-600', bgColor: 'bg-amber-100', progress: 50 };
    if (darshanPosition <= 20) return { status: 'High', color: 'text-orange-600', bgColor: 'bg-orange-100', progress: 75 };
    return { status: 'Very High', color: 'text-red-600', bgColor: 'bg-red-100', progress: 90 };
  };

  const queueInfo = getQueueStatus();

  return (
    <Card className={`bg-gradient-to-br from-amber-50 via-orange-50 to-white border border-amber-100 shadow-lg text-center p-6 flex flex-col items-center justify-center space-y-6 transition-all duration-300 ${isUpdating ? 'ring-2 ring-blue-200 shadow-xl' : ''}`}>
      <div className="flex items-center justify-between w-full">
        <h2 className="text-lg font-semibold text-amber-800 tracking-wide">
          Live Darshan Status
        </h2>
        <div className={`flex items-center space-x-1 text-xs px-2 py-1 rounded-full transition-all duration-300 ${
          isUpdating ? 'bg-green-100 text-green-700 animate-pulse' : 'bg-gray-100 text-gray-600'
        }`}>
          <iconify-icon icon={isUpdating ? "solar:refresh-bold" : "solar:check-circle-bold"} className="text-sm"></iconify-icon>
          <span>{isUpdating ? 'Updating...' : 'Live'}</span>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center -space-y-4">
        <span
          className={`font-serif text-9xl font-bold transition-all duration-500 ${darshanPosition <= 2 ? 'text-green-600' : 'text-amber-600'}`}
          style={{ textShadow: '3px 3px 6px rgba(180, 83, 9, 0.15)' }}
        >
          {darshanPosition.toFixed(darshanPosition < 10 ? 1 : 0)}
        </span>
        <span className="text-lg text-gray-500">
          Ahead of you
        </span>
      </div>

      <div className="flex items-center space-x-3 text-xl font-medium text-gray-700">
        <iconify-icon icon="solar:hourglass-line-duotone" className="text-2xl text-amber-500"></iconify-icon>
        <span>{waitTime} min wait</span>
      </div>

      <div className="w-full max-w-xs pt-4">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-semibold text-amber-800">Queue Status</span>
          <span className={`text-sm font-bold ${queueInfo.color}`}>{queueInfo.status}</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2.5">
          <div
            className={`h-2.5 rounded-full transition-all duration-1000 ${queueInfo.bgColor.replace('bg-', 'bg-gradient-to-r from-').replace('-100', '-400 to-').replace('-100', '-500')}`}
            style={{ width: `${queueInfo.progress}%` }}
          ></div>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Last updated: {lastUpdate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </Card>
  );
};

export default LiveDarshanWaitingCard;