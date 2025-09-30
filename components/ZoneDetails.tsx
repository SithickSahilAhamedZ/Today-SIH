import React, { useState, useEffect } from 'react';
import ZoneDetailCard, { DensityLevel, ZoneData } from './ZoneDetailCard';

// Icon components for different zones
const QueueIcon: React.FC<{ className?: string }> = ({ className }) => (
  <iconify-icon icon="solar:users-group-rounded-bold" className={className}></iconify-icon>
);

const EntranceIcon: React.FC<{ className?: string }> = ({ className }) => (
  <iconify-icon icon="solar:door-bold" className={className}></iconify-icon>
);

const ExitIcon: React.FC<{ className?: string }> = ({ className }) => (
  <iconify-icon icon="solar:exit-bold" className={className}></iconify-icon>
);

const ShoesIcon: React.FC<{ className?: string }> = ({ className }) => (
  <iconify-icon icon="solar:home-smile-bold" className={className}></iconify-icon>
);

const PrasadIcon: React.FC<{ className?: string }> = ({ className }) => (
  <iconify-icon icon="solar:hand-heart-bold" className={className}></iconify-icon>
);

const InfoIcon: React.FC<{ className?: string }> = ({ className }) => (
  <iconify-icon icon="solar:info-circle-bold" className={className}></iconify-icon>
);

const CloakIcon: React.FC<{ className?: string }> = ({ className }) => (
  <iconify-icon icon="solar:bag-smile-bold" className={className}></iconify-icon>
);

const RestIcon: React.FC<{ className?: string }> = ({ className }) => (
  <iconify-icon icon="solar:chair-bold" className={className}></iconify-icon>
);

interface ZoneDetailsProps {
  className?: string;
}

const ZoneDetails: React.FC<ZoneDetailsProps> = ({ className }) => {
  const [zones, setZones] = useState<ZoneData[]>([
    {
      id: 'darshan-queue',
      name: 'Darshan Queue',
      densityLevel: DensityLevel.High,
      densityPercentage: 92,
      liveCount: 485,
      icon: QueueIcon
    },
    {
      id: 'main-entrance',
      name: 'Main Entrance',
      densityLevel: DensityLevel.High,
      densityPercentage: 87,
      liveCount: 324,
      icon: EntranceIcon
    },
    {
      id: 'exit-area',
      name: 'Exit Area',
      densityLevel: DensityLevel.Moderate,
      densityPercentage: 73,
      liveCount: 198,
      icon: ExitIcon
    },
    {
      id: 'prasad-counter',
      name: 'Prasad Counter',
      densityLevel: DensityLevel.Moderate,
      densityPercentage: 68,
      liveCount: 156,
      icon: PrasadIcon
    },
    {
      id: 'shoes-area',
      name: 'Shoes Area',
      densityLevel: DensityLevel.Moderate,
      densityPercentage: 61,
      liveCount: 134,
      icon: ShoesIcon
    },
    {
      id: 'information-desk',
      name: 'Information Desk',
      densityLevel: DensityLevel.Low,
      densityPercentage: 42,
      liveCount: 67,
      icon: InfoIcon
    },
    {
      id: 'cloak-room',
      name: 'Cloak Room',
      densityLevel: DensityLevel.Low,
      densityPercentage: 35,
      liveCount: 48,
      icon: CloakIcon
    },
    {
      id: 'rest-area',
      name: 'Rest Area',
      densityLevel: DensityLevel.Low,
      densityPercentage: 28,
      liveCount: 32,
      icon: RestIcon
    }
  ]);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setZones(prevZones => 
        prevZones.map(zone => {
          const change = Math.floor(Math.random() * 10) - 5; // ±5%
          const newPercentage = Math.max(15, Math.min(100, zone.densityPercentage + change));
          const newLiveCount = Math.floor((newPercentage / 100) * (zone.id === 'darshan-queue' ? 500 : 300));
          
          let newDensityLevel: DensityLevel;
          if (newPercentage >= 80) newDensityLevel = DensityLevel.High;
          else if (newPercentage >= 50) newDensityLevel = DensityLevel.Moderate;
          else newDensityLevel = DensityLevel.Low;

          return {
            ...zone,
            densityPercentage: newPercentage,
            liveCount: newLiveCount,
            densityLevel: newDensityLevel
          };
        })
      );
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  // Sort zones by density percentage in descending order
  const sortedZones = [...zones].sort((a, b) => b.densityPercentage - a.densityPercentage);

  return (
    <div className={`space-y-4 ${className || ''}`}>
      {sortedZones.map(zone => (
        <ZoneDetailCard key={zone.id} zone={zone} />
      ))}
    </div>
  );
};

export default ZoneDetails;