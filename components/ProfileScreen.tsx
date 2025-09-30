// FIX: Changed React import from namespace import ('* as React') to default import ('React') to resolve widespread JSX intrinsic element type errors. The default import is standard with modern TypeScript/React configurations and should restore the correct JSX type definitions.
import React from 'react';
import { Icon } from '@iconify/react';
import Card from './ui/Card';
import {} from '../types';

interface ProfileScreenProps {
  isHighContrast: boolean;
  setHighContrast: (value: boolean) => void;
}

const AccessibilityOption: React.FC<{ 
    icon: string; 
    title: string; 
    description: string;
    toggled: boolean;
    onToggle: () => void;
}> = ({ icon, title, description, toggled, onToggle }) => {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
            <div className="flex items-center space-x-3 sm:space-x-4">
                <Icon icon={icon} className="text-orange-500 text-lg sm:text-2xl w-5 sm:w-6 text-center flex-shrink-0" />
                <div className="min-w-0 flex-1">
                    <h4 className="font-semibold text-gray-800 text-sm sm:text-base">{title}</h4>
                    <p className="text-xs sm:text-sm text-gray-500">{description}</p>
                </div>
            </div>
            <button 
                onClick={onToggle}
                className={`relative inline-flex items-center h-5 sm:h-6 rounded-full w-9 sm:w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 flex-shrink-0 ${toggled ? 'bg-orange-500' : 'bg-gray-300'}`}
                role="switch"
                aria-checked={toggled}
            >
                <span className="sr-only">{title}</span>
                <span className={`inline-block w-3 h-3 sm:w-4 sm:h-4 transform bg-white rounded-full transition-transform ${toggled ? 'translate-x-5 sm:translate-x-6' : 'translate-x-0.5 sm:translate-x-1'}`} />
            </button>
        </div>
    );
};


const ProfileScreen: React.FC<ProfileScreenProps> = ({ isHighContrast, setHighContrast }) => {
    const [wheelchair, setWheelchair] = React.useState(false);
    const [priority, setPriority] = React.useState(false);
    const [childSafety, setChildSafety] = React.useState(false);

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white p-4 sm:p-6 shadow-lg">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center gap-3">
                        <Icon icon="material-symbols:person" className="text-2xl sm:text-3xl" />
                        <div>
                            <h1 className="text-xl sm:text-2xl font-bold">Profile & Settings</h1>
                            <p className="text-orange-100 text-sm">Manage your preferences and accessibility options</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
            <Card className="card-enhanced">
                <div className="flex items-center space-x-3 sm:space-x-4">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                        <Icon icon="material-symbols:account-circle" className="text-2xl sm:text-4xl text-gray-500" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <h3 className="text-base sm:text-lg font-bold text-gray-800">Guest Pilgrim</h3>
                        <p className="text-xs sm:text-sm text-gray-500">pilgrim.guest@email.com</p>
                    </div>
                </div>
            </Card>

            <Card>
                <div className="space-y-4 sm:space-y-6">
                    <h3 className="font-bold text-gray-800 mb-2 text-sm sm:text-base">Support Services</h3>
                    <AccessibilityOption 
                        icon="mdi:wheelchair-accessibility" 
                        title="Wheelchair Assistance" 
                        description="Request support at entry gates."
                        toggled={wheelchair}
                        onToggle={() => setWheelchair(!wheelchair)}
                    />
                    <AccessibilityOption 
                        icon="mdi:account-group-outline" 
                        title="Priority Darshan"
                        description="For senior citizens & disabled."
                        toggled={priority}
                        onToggle={() => setPriority(!priority)}
                    />
                    <AccessibilityOption 
                        icon="mdi:face-man-shimmer-outline" 
                        title="Child Safety Tag" 
                        description="Activate for location tracking."
                        toggled={childSafety}
                        onToggle={() => setChildSafety(!childSafety)}
                    />
                     <AccessibilityOption 
                        icon="mdi:contrast-circle" 
                        title="High-Contrast Mode" 
                        description="For improved visibility."
                        toggled={isHighContrast}
                        onToggle={() => setHighContrast(!isHighContrast)}
                    />
                </div>
            </Card>
            </div>
        </div>
    );
};

export default ProfileScreen;