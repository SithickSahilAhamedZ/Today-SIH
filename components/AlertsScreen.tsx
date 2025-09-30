// FIX: Changed React import to namespace import ('* as React') to resolve JSX intrinsic element type errors.
import * as React from 'react';
import { Icon } from '@iconify/react';
import Card from './ui/Card';
import {} from '../types';

const emergencyContacts = [
  { name: 'Police', number: '100', icon: 'solar:shield-bold-duotone', colors: 'bg-blue-100 text-blue-600' },
  { name: 'Ambulance', number: '108', icon: 'solar:heart-pulse-bold-duotone', colors: 'bg-red-100 text-red-600' },
  { name: 'Fire Brigade', number: '101', icon: 'solar:fire-bold-duotone', colors: 'bg-orange-100 text-orange-600' },
  { name: 'Disaster Mgmt', number: '1077', icon: 'solar:danger-triangle-bold-duotone', colors: 'bg-purple-100 text-purple-600' },
  { name: 'Women\'s Helpline', number: '1091', icon: 'solar:woman-bold-duotone', colors: 'bg-pink-100 text-pink-600' },
  { name: 'Child Helpline', number: '1098', icon: 'solar:accessibility-bold-duotone', colors: 'bg-cyan-100 text-cyan-600' },
];

const EmergencyScreen: React.FC = () => {
    const [sosActivated, setSosActivated] = React.useState(false);

    const handleSosClick = () => {
        setSosActivated(true);
        setTimeout(() => setSosActivated(false), 5000); // Reset after 5 seconds
    };

    return (
        <div className="space-y-6 pb-4">
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
            
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                <Icon icon="solar:bell-bing-bold-duotone" className="text-red-500" />
                Emergency Services
            </h1>

            <div className="flex flex-col items-center justify-center text-center space-y-3 py-4">
                <button
                    onClick={handleSosClick}
                    className={`relative w-40 h-40 rounded-full flex flex-col items-center justify-center transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-offset-4 focus:ring-red-300
                        ${sosActivated
                            ? 'bg-green-500 text-white'
                            : 'bg-red-100 text-red-600 animate-sos-pulse'
                        }`}
                    aria-label="Activate SOS Alert"
                >
                    <Icon icon={sosActivated ? "solar:check-circle-bold" : "solar:siren-rounded-bold"} className="text-6xl" />
                    <span className="mt-2 font-bold text-lg uppercase tracking-wider">{sosActivated ? "Alert Sent" : "SOS"}</span>
                </button>
                <p className="text-sm text-gray-500 max-w-xs">
                    {sosActivated
                        ? "Authorities have been notified of your location. Help is on the way."
                        : "Tap to alert authorities in case of an emergency."
                    }
                </p>
            </div>

            <div>
                <h2 className="text-lg font-bold text-gray-700 mb-3">Emergency Contacts</h2>
                <div className="space-y-3">
                    {emergencyContacts.map(contact => (
                        <Card key={contact.name} className="p-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${contact.colors}`}>
                                        <Icon icon={contact.icon} className="text-2xl" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-800">{contact.name}</p>
                                        <p className="text-lg font-mono text-gray-600 tracking-wider">{contact.number}</p>
                                    </div>
                                </div>
                                <a
                                    href={`tel:${contact.number}`}
                                    className="bg-green-500 text-white font-bold py-2 px-5 rounded-lg shadow-sm hover:bg-green-600 transition-transform active:scale-95 flex items-center gap-2"
                                >
                                    <Icon icon="solar:phone-bold" />
                                    Call
                                </a>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>

            <div>
                <h2 className="text-lg font-bold text-gray-700 mb-3">Emergency Assist</h2>
                <Card className="p-0">
                    <div className="flex items-center justify-between p-4">
                        <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-orange-100 text-orange-600">
                                <Icon icon="solar:car-crash-bold-duotone" className="text-3xl" />
                            </div>
                             <div>
                                <p className="font-bold text-gray-800">Report Accident</p>
                                <p className="text-sm text-gray-500">Traffic or other incidents</p>
                            </div>
                        </div>
                        <button className="bg-orange-500 text-white w-12 h-12 rounded-lg shadow-sm hover:bg-orange-600 transition-transform active:scale-95 flex items-center justify-center">
                            <Icon icon="solar:notebook-bold-duotone" className="text-3xl" />
                        </button>
                    </div>
                </Card>
            </div>

        </div>
    );
};

export default EmergencyScreen;