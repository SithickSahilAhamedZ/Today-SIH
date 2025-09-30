import React, { useState, useEffect } from 'react';
import Card from './ui/Card';

interface LiveCrowdStatusProps {
  currentVisitors: number;
  averageDensity: number;
  highRiskZones: number;
  dataConfidence: number;
}

const LiveCrowdStatus: React.FC<LiveCrowdStatusProps> = ({
  currentVisitors: initialVisitors,
  averageDensity: initialDensity,
  highRiskZones: initialRiskZones,
  dataConfidence
}) => {
  const [currentVisitors, setCurrentVisitors] = useState(initialVisitors);
  const [averageDensity, setAverageDensity] = useState(initialDensity);
  const [highRiskZones, setHighRiskZones] = useState(initialRiskZones);
  const [isUpdating, setIsUpdating] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Live data update simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setIsUpdating(true);
      
      // Simulate realistic data changes
      setTimeout(() => {
        setCurrentVisitors(prev => {
          const change = Math.floor(Math.random() * 20) - 10; // ±10 visitors
          return Math.max(1000, Math.min(2000, prev + change));
        });
        
        setAverageDensity(prev => {
          const change = Math.floor(Math.random() * 10) - 5; // ±5%
          return Math.max(30, Math.min(95, prev + change));
        });
        
        setHighRiskZones(prev => {
          const change = Math.random() > 0.7 ? (Math.random() > 0.5 ? 1 : -1) : 0;
          return Math.max(0, Math.min(10, prev + change));
        });
        
        setLastUpdated(new Date());
        setIsUpdating(false);
      }, 800);
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-GB', { 
      hour12: false,
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <Card className="bg-white rounded-2xl shadow-sm p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
            <iconify-icon icon="solar:users-group-two-rounded-bold" className="text-orange-500 text-lg"></iconify-icon>
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Live Crowd Density</h3>
            <p className="text-sm text-gray-500">Real-time temple zone congestion levels</p>
          </div>
        </div>
        <div className={`flex items-center space-x-1 text-xs px-2 py-1 rounded-full transition-all duration-300 ${
          isUpdating ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'
        }`}>
          <div className={`w-2 h-2 rounded-full ${
            isUpdating ? 'bg-blue-500 animate-pulse' : 'bg-green-500'
          }`}></div>
          <span className="font-medium">{isUpdating ? 'Updating...' : 'Live'}</span>
        </div>
      </div>

      {/* Last Updated */}
      <div className="text-center mb-4">
        <p className="text-sm text-gray-500">
          Last updated: <span className="font-mono">{formatTime(lastUpdated)}</span>
        </p>
      </div>

      {/* Stats Cards */}
      <div className="space-y-3">
        {/* Total Visitors */}
        <div className={`bg-blue-500 rounded-xl p-4 text-white transition-all duration-500 ${
          isUpdating ? 'scale-105 shadow-lg' : ''
        }`}>
          <div className="flex items-center space-x-3">
            <iconify-icon icon="solar:users-group-two-rounded-bold" className="text-2xl text-white"></iconify-icon>
            <div>
              <div className="text-2xl font-bold transition-all duration-300">
                {currentVisitors.toLocaleString()}
              </div>
              <div className="text-sm font-medium opacity-90">TOTAL VISITORS</div>
            </div>
          </div>
        </div>

        {/* Average Density */}
        <div className={`bg-orange-500 rounded-xl p-4 text-white transition-all duration-500 ${
          isUpdating ? 'scale-105 shadow-lg' : ''
        }`}>
          <div className="flex items-center space-x-3">
            <iconify-icon icon="solar:chart-square-bold" className="text-2xl text-white"></iconify-icon>
            <div>
              <div className="text-2xl font-bold transition-all duration-300">{averageDensity}%</div>
              <div className="text-sm font-medium opacity-90">AVG DENSITY</div>
            </div>
          </div>
        </div>

        {/* High Risk Zones */}
        <div className={`bg-red-500 rounded-xl p-4 text-white transition-all duration-500 ${
          isUpdating ? 'scale-105 shadow-lg' : ''
        }`}>
          <div className="flex items-center space-x-3">
            <iconify-icon icon="solar:danger-triangle-bold" className="text-2xl text-white"></iconify-icon>
            <div>
              <div className="text-2xl font-bold transition-all duration-300">{highRiskZones}</div>
              <div className="text-sm font-medium opacity-90">HIGH RISK ZONES</div>
            </div>
          </div>
        </div>
      </div>

      {/* Data Confidence Indicator */}
      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-600">Data Confidence</span>
          <div className="flex items-center space-x-2">
            <div className="w-16 bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-1000"
                style={{ width: `${dataConfidence}%` }}
              ></div>
            </div>
            <span className="text-sm font-bold text-green-600">{dataConfidence}%</span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default LiveCrowdStatus;