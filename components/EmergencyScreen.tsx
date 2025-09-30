// FIX: Changed React import from namespace import ('* as React') to default import ('React') to resolve widespread JSX intrinsic element type errors. The default import is standard with modern TypeScript/React configurations and should restore the correct JSX type definitions.
import React from 'react';
import { Icon } from '@iconify/react';
import Card from './ui/Card';
import {} from '../types';

const emergencyContacts = [
  { name: 'Police', number: '100', icon: 'solar:shield-bold-duotone', colors: 'bg-blue-100 text-blue-600' },
  { name: 'Ambulance', number: '108', icon: 'solar:heart-pulse-bold-duotone', colors: 'bg-red-100 text-red-600' },
  { name: 'Fire Brigade', number: '101', icon: 'solar:fire-bold-duotone', colors: 'bg-orange-100 text-orange-600' },
  { name: 'Disaster Mgmt', number: '1077', icon: 'solar:danger-triangle-bold-duotone', colors: 'bg-purple-100 text-purple-600' },
  { name: 'Women\'s Helpline', number: '1091', icon: 'solar:heart-bold-duotone', colors: 'bg-pink-100 text-pink-600' },
  { name: 'Child Helpline', number: '1098', icon: 'solar:accessibility-bold-duotone', colors: 'bg-cyan-100 text-cyan-600' },
  { name: 'Temple Security', number: '1122', icon: 'solar:shield-check-bold-duotone', colors: 'bg-indigo-100 text-indigo-600' },
  { name: 'Medical Aid', number: '104', icon: 'solar:medical-kit-bold-duotone', colors: 'bg-teal-100 text-teal-600' },
];

const EmergencyScreen: React.FC = () => {
    const [sosActivated, setSosActivated] = React.useState(false);
    const [accidentReported, setAccidentReported] = React.useState(false);

    const handleSosClick = () => {
        setSosActivated(true);
        setTimeout(() => setSosActivated(false), 5000); // Reset after 5 seconds
    };

    const handleReportAccident = () => {
        setAccidentReported(true);
        setTimeout(() => setAccidentReported(false), 5000); // Reset after 5 seconds
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50">
            {/* Header */}
            <div className="bg-gradient-to-r from-red-500 to-orange-600 text-white p-4 sm:p-6 shadow-lg">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center gap-3">
                        <Icon icon="material-symbols:emergency" className="text-2xl sm:text-3xl" />
                        <div>
                            <h1 className="text-xl sm:text-2xl font-bold">Emergency Services</h1>
                            <p className="text-red-100 text-sm">Quick access to emergency contacts & SOS</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
             <style>{`
                @keyframes sos-pulse {
                    0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
                    70% { box-shadow: 0 0 0 20px rgba(239, 68, 68, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
                }
                .animate-sos-pulse {
                    animation: sos-pulse 2s infinite;
                }
            `}</style>
            
            <div className="flex flex-col items-center justify-center text-center space-y-2 sm:space-y-3 py-3 sm:py-4">
                <button
                    onClick={handleSosClick}
                    className={`relative w-32 h-32 sm:w-40 sm:h-40 rounded-full flex flex-col items-center justify-center transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-offset-4 focus:ring-red-300
                        ${sosActivated
                            ? 'bg-green-500 text-white'
                            : 'bg-red-100 text-red-600 animate-sos-pulse'
                        }`}
                    aria-label="Activate SOS Alert"
                >
                    <Icon icon={sosActivated ? "solar:check-circle-bold" : "solar:siren-rounded-bold"} className="text-4xl sm:text-6xl" />
                    <span className="mt-1 sm:mt-2 font-bold text-sm sm:text-lg uppercase tracking-wider">{sosActivated ? "Alert Sent" : "SOS"}</span>
                </button>
                <p className="text-xs sm:text-sm text-gray-500 max-w-xs px-4">
                    {sosActivated
                        ? "Authorities have been notified of your location. Help is on the way."
                        : "Tap to alert authorities in case of an emergency."
                    }
                </p>
            </div>

            <div>
                <h2 className="text-base sm:text-lg font-bold text-gray-700 mb-2 sm:mb-3">Emergency Contacts</h2>
                <div className="space-y-2 sm:space-y-3">
                    {emergencyContacts.map(contact => (
                        <Card key={contact.name} className="p-2 sm:p-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3 sm:space-x-4 min-w-0 flex-1">
                                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${contact.colors}`}>
                                        <Icon icon={contact.icon} className="text-lg sm:text-2xl" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="font-bold text-gray-800 text-sm sm:text-base">{contact.name}</p>
                                        <p className="text-base sm:text-lg font-mono text-gray-600 tracking-wider">{contact.number}</p>
                                    </div>
                                </div>
                                <a
                                    href={`tel:${contact.number}`}
                                    className="bg-green-500 text-white font-bold py-1.5 sm:py-2 px-3 sm:px-5 rounded-lg shadow-sm hover:bg-green-600 transition-transform active:scale-95 flex items-center gap-1 sm:gap-2 flex-shrink-0 text-sm sm:text-base"
                                >
                                    <Icon icon="solar:phone-bold" className="text-sm sm:text-base" />
                                    Call
                                </a>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>

            <div>
                <h2 className="text-base sm:text-lg font-bold text-gray-700 mb-2 sm:mb-3">Emergency Assist</h2>
                <Card className="p-0">
                    <div className="flex items-center justify-between p-3 sm:p-4">
                        <div className="flex items-center space-x-3 sm:space-x-4 min-w-0 flex-1">
                            <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                                accidentReported 
                                    ? 'bg-green-100 text-green-600' 
                                    : 'bg-orange-100 text-orange-600'
                            }`}>
                                <iconify-icon 
                                    icon={accidentReported ? "solar:check-circle-bold" : "solar:car-crash-bold-duotone"} 
                                    className="text-xl sm:text-3xl"
                                ></iconify-icon>
                            </div>
                             <div className="min-w-0 flex-1">
                                <p className={`font-bold transition-colors duration-300 text-sm sm:text-base ${
                                    accidentReported ? 'text-green-800' : 'text-gray-800'
                                }`}>
                                    {accidentReported ? 'Accident Reported' : 'Report Accident'}
                                </p>
                                <p className="text-xs sm:text-sm text-gray-500">
                                    {accidentReported 
                                        ? 'Authorities notified. Help is on the way.' 
                                        : 'Traffic or other incidents'
                                    }
                                </p>
                            </div>
                        </div>
                        <button 
                            onClick={handleReportAccident}
                            disabled={accidentReported}
                            className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg shadow-sm transition-all duration-300 flex items-center justify-center flex-shrink-0 ${
                                accidentReported
                                    ? 'bg-green-500 text-white cursor-not-allowed'
                                    : 'bg-orange-500 text-white hover:bg-orange-600 active:scale-95'
                            }`}
                            aria-label="Report Accident"
                        >
                            <iconify-icon 
                                icon={accidentReported ? "solar:check-bold" : "solar:notebook-bold-duotone"} 
                                className="text-lg sm:text-2xl"
                            ></iconify-icon>
                        </button>
                    </div>
                </Card>
            </div>
            </div>
        </div>
    );
};

export default EmergencyScreen;