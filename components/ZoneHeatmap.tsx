import React, { useState, useEffect } from 'react';
import Card from './ui/Card';

interface ZoneData {
  id: string;
  name: string;
  percentage: number;
  people: number;
  status: 'low' | 'medium' | 'high' | 'very-high';
}

interface ZoneHeatmapProps {
  onZoneSelect?: (zone: ZoneData) => void;
}

const ZoneHeatmap: React.FC<ZoneHeatmapProps> = ({ onZoneSelect }) => {
  const [zones, setZones] = useState<ZoneData[]>([
    { id: 'darshan', name: 'Darshan Queue', percentage: 100, people: 555, status: 'very-high' },
    { id: 'entrance', name: 'Main Entrance', percentage: 97, people: 345, status: 'very-high' },
    { id: 'exit', name: 'Exit Area', percentage: 82, people: 188, status: 'high' },
    { id: 'prasad', name: 'Prasad Counter', percentage: 79, people: 144, status: 'high' },
    { id: 'shoes', name: 'Shoes Area', percentage: 76, people: 143, status: 'high' },
    { id: 'info', name: 'Information Desk', percentage: 55, people: 80, status: 'medium' },
    { id: 'cloak', name: 'Cloak Room', percentage: 45, people: 60, status: 'medium' },
    { id: 'rest', name: 'Rest Area', percentage: 34, people: 38, status: 'low' },
  ]);

  const [selectedZone, setSelectedZone] = useState<ZoneData | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Simulate live data updates
  useEffect(() => {
    const interval = setInterval(() => {
      setIsUpdating(true);
      
      setTimeout(() => {
        setZones(prev => prev.map(zone => {
          const change = Math.floor(Math.random() * 10) - 5; // ±5%
          const newPercentage = Math.max(20, Math.min(100, zone.percentage + change));
          const newPeople = Math.floor((newPercentage / 100) * (zone.id === 'darshan' ? 600 : 
                                                                zone.id === 'entrance' ? 400 : 200));
          
          let status: ZoneData['status'] = 'low';
          if (newPercentage >= 90) status = 'very-high';
          else if (newPercentage >= 70) status = 'high';
          else if (newPercentage >= 50) status = 'medium';
          
          return {
            ...zone,
            percentage: newPercentage,
            people: newPeople,
            status
          };
        }));
        setIsUpdating(false);
      }, 1000);
    }, 6000); // Update every 6 seconds

    return () => clearInterval(interval);
  }, []);

  const getZoneColor = (status: ZoneData['status'], percentage: number) => {
    switch (status) {
      case 'very-high': return percentage >= 95 ? 'bg-red-600' : 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-400';
    }
  };

  const getTextColor = (status: ZoneData['status']) => {
    return status === 'low' ? 'text-white' : 'text-white';
  };

  const getStatusDot = (status: ZoneData['status']) => {
    switch (status) {
      case 'very-high': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-400';
    }
  };

  const handleZoneClick = (zone: ZoneData) => {
    setSelectedZone(zone);
    if (onZoneSelect) onZoneSelect(zone);
  };

  return (
    <Card className="bg-white rounded-2xl shadow-sm p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Zone Heatmap</h3>
          <p className="text-sm text-gray-500">Real-time crowd density by area</p>
        </div>
        
        {/* Legend */}
        <div className="flex items-center space-x-1 text-xs">
          <span className="text-gray-500">Low</span>
          <div className="flex space-x-0.5">
            <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
            <div className="w-3 h-3 bg-yellow-500 rounded-sm"></div>
            <div className="w-3 h-3 bg-orange-500 rounded-sm"></div>
            <div className="w-3 h-3 bg-red-500 rounded-sm"></div>
          </div>
          <span className="text-gray-500">High</span>
        </div>
      </div>

      {/* Status Indicator */}
      <div className="flex items-center justify-center mb-4">
        <div className={`flex items-center space-x-1 text-xs px-2 py-1 rounded-full transition-all duration-300 ${
          isUpdating ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'
        }`}>
          <div className={`w-2 h-2 rounded-full ${
            isUpdating ? 'bg-blue-500 animate-pulse' : 'bg-green-500'
          }`}></div>
          <span className="font-medium">{isUpdating ? 'Updating zones...' : 'Live'}</span>
        </div>
      </div>

      {/* Zone Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {zones.map((zone) => (
          <button
            key={zone.id}
            onClick={() => handleZoneClick(zone)}
            className={`${getZoneColor(zone.status, zone.percentage)} rounded-xl p-4 text-white transition-all duration-300 hover:scale-105 ${
              zone.status === 'very-high' && zone.percentage >= 95 ? 'animate-pulse ring-2 ring-red-300' : ''
            } ${selectedZone?.id === zone.id ? 'ring-2 ring-white ring-offset-2' : ''}`}
          >
            <div className="text-center">
              <div className="text-2xl font-bold mb-1">{zone.percentage}%</div>
              <div className="text-sm font-medium opacity-90 mb-2">{zone.people}</div>
              <div className="text-xs font-medium opacity-80">{zone.name}</div>
            </div>
          </button>
        ))}
      </div>

      {/* Selected Zone Details */}
      {selectedZone && (
        <div className="mt-4 p-4 bg-gray-50 rounded-xl transition-all duration-500">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-md font-bold text-gray-800">{selectedZone.name}</h4>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${getStatusDot(selectedZone.status)}`}></div>
              <span className="text-sm font-medium text-gray-600 capitalize">
                {selectedZone.status.replace('-', ' ')} Density
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-3">
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>Empty</span>
              <span className="font-medium">{selectedZone.people} people</span>
              <span>Full</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-1000 ${getZoneColor(selectedZone.status, selectedZone.percentage)}`}
                style={{ width: `${selectedZone.percentage}%` }}
              ></div>
            </div>
          </div>

          {/* Zone Insights */}
          <div className="text-xs text-gray-600">
            {selectedZone.status === 'very-high' && selectedZone.percentage >= 95 && (
              <div className="flex items-center space-x-1 text-red-600">
                <iconify-icon icon="solar:danger-triangle-bold" className="text-sm"></iconify-icon>
                <span className="font-medium">Critical density! Consider alternative routes.</span>
              </div>
            )}
            {selectedZone.status === 'high' && (
              <div className="flex items-center space-x-1 text-orange-600">
                <iconify-icon icon="solar:warning-triangle-bold" className="text-sm"></iconify-icon>
                <span className="font-medium">High crowd density. Expect delays.</span>
              </div>
            )}
            {selectedZone.status === 'medium' && (
              <div className="flex items-center space-x-1 text-yellow-600">
                <iconify-icon icon="solar:info-circle-bold" className="text-sm"></iconify-icon>
                <span className="font-medium">Moderate crowd levels.</span>
              </div>
            )}
            {selectedZone.status === 'low' && (
              <div className="flex items-center space-x-1 text-green-600">
                <iconify-icon icon="solar:check-circle-bold" className="text-sm"></iconify-icon>
                <span className="font-medium">Low crowd density. Good time to visit!</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quick Stats Summary */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="text-center p-3 bg-red-50 rounded-lg">
          <div className="text-lg font-bold text-red-600">
            {zones.filter(z => z.status === 'very-high').length}
          </div>
          <div className="text-xs text-red-600 font-medium">Critical Zones</div>
        </div>
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <div className="text-lg font-bold text-green-600">
            {zones.filter(z => z.status === 'low').length}
          </div>
          <div className="text-xs text-green-600 font-medium">Safe Zones</div>
        </div>
      </div>
    </Card>
  );
};

export default ZoneHeatmap;