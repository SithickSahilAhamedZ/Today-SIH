import React from 'react';

// TypeScript enums and interfaces
export enum DensityLevel {
  Low = 'Low',
  Moderate = 'Moderate',
  High = 'High'
}

export interface ZoneData {
  id: string;
  name: string;
  densityLevel: DensityLevel;
  densityPercentage: number;
  liveCount: number;
  icon: React.ComponentType<{ className?: string }>;
}

// Color palette system - mapping DensityLevel to Tailwind classes
const densityStyles = {
  [DensityLevel.Low]: {
    background: 'bg-emerald-50/70',
    border: 'border-emerald-200',
    text: 'text-emerald-800',
    tagBg: 'bg-emerald-100',
    tagText: 'text-emerald-800',
    progress: 'bg-emerald-500',
    percentageText: 'text-emerald-700'
  },
  [DensityLevel.Moderate]: {
    background: 'bg-amber-50/70',
    border: 'border-amber-200',
    text: 'text-amber-800',
    tagBg: 'bg-amber-100',
    tagText: 'text-amber-800',
    progress: 'bg-amber-500',
    percentageText: 'text-amber-700'
  },
  [DensityLevel.High]: {
    background: 'bg-red-50/70',
    border: 'border-red-200',
    text: 'text-red-800',
    tagBg: 'bg-red-100',
    tagText: 'text-red-800',
    progress: 'bg-red-500',
    percentageText: 'text-red-700'
  }
};

// ZoneDetailCard Component
interface ZoneDetailCardProps {
  zone: ZoneData;
}

const ZoneDetailCard: React.FC<ZoneDetailCardProps> = ({ zone }) => {
  const styles = densityStyles[zone.densityLevel];
  const IconComponent = zone.icon;

  return (
    <div className={`bg-white rounded-2xl shadow-md p-5 border-2 ${styles.background} ${styles.border}`}>
      {/* Top Section (Header) */}
      <div className="flex justify-between items-start">
        {/* Left Side */}
        <div className="flex items-center space-x-3">
          {/* Icon */}
          <div className="bg-white rounded-full p-2 shadow-inner">
            <IconComponent className={`w-6 h-6 ${styles.text}`} />
          </div>
          
          {/* Titles */}
          <div>
            <h4 className="font-bold text-gray-800">{zone.name}</h4>
            <p className="text-xs font-semibold text-gray-500">
              {zone.densityLevel.toUpperCase()} DENSITY
            </p>
          </div>
        </div>

        {/* Right Side (Tag) */}
        <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${styles.tagBg} ${styles.tagText}`}>
          {zone.densityLevel}
        </span>
      </div>

      {/* Middle Section (Crowd Density) */}
      <div className="mt-4">
        {/* Density Header */}
        <div className="flex justify-between items-end mb-1">
          <h5 className="text-sm font-semibold text-gray-600">Crowd Density</h5>
          <p className={`text-3xl font-bold ${styles.percentageText}`}>
            {zone.densityPercentage}%
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className={`h-2.5 rounded-full ${styles.progress}`}
            style={{ width: `${zone.densityPercentage}%` }}
          ></div>
        </div>

        {/* Labels */}
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>Empty</span>
          <span className="font-semibold">{zone.liveCount} people</span>
          <span>Full</span>
        </div>
      </div>

      {/* Bottom Section (Live Count) */}
      <div className="flex items-center border-t mt-4 pt-3">
        <iconify-icon icon="solar:users-group-rounded-bold" className="text-gray-600 text-lg mr-2"></iconify-icon>
        <span className="text-sm text-gray-600">Live Count</span>
        <span className="ml-auto font-bold bg-gray-100 px-2 py-0.5 rounded">
          {zone.liveCount}
        </span>
      </div>
    </div>
  );
};

export default ZoneDetailCard;