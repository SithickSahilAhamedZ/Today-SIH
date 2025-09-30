// FIX: Changed React import from namespace import ('* as React') to default import ('React') to resolve widespread JSX intrinsic element type errors. The default import is standard with modern TypeScript/React configurations and should restore the correct JSX type definitions.
import React from 'react';
import Card from './ui/Card';
import LiveDarshanWaitingCard from './LiveDarshanWaitingCard';
import QRCode from 'qrcode';
// FIX: Import from types file to include the global JSX type definitions for custom elements like iconify-icon.
import { Pilgrim } from '../types';

interface YatraScreenProps {
  onNavigate: (poiId: string) => void;
  initialTab?: 'journey' | 'history';
}

interface YatraStep {
  id: string;
  title: string;
  description: string;
  icon: string;
  durationSeconds: number; // For simulation
  poiId?: string;
}

interface BookingHistory {
  id: string;
  slotId: string;
  slotTime: string;
  pilgrims: Pilgrim[]; // Array of pilgrim objects
  totalMembers: number;
  seniorCitizenCount: number;
  timestamp: number;
  status: 'confirmed' | 'completed' | 'cancelled';
  qrCode?: string;
}

const yatraSteps: YatraStep[] = [
  { id: 'arrival', title: 'Arrival at Temple', description: 'You have arrived at the main entrance.', icon: 'solar:login-3-bold-duotone', durationSeconds: 5 },
  { id: 'security', title: 'Security Check', description: 'Proceed through the security check.', icon: 'solar:shield-check-bold-duotone', durationSeconds: 10 },
  { id: 'cloak', title: 'Cloak Room', description: 'Deposit your belongings and footwear.', icon: 'solar:backpack-bold-duotone', durationSeconds: 8, poiId: 'cloak' },
  { id: 'queue', title: 'Join Darshan Queue', description: 'You are now in the virtual queue for darshan.', icon: 'solar:users-group-rounded-bold-duotone', durationSeconds: 15 },
  { id: 'darshan', title: 'Darshan in Progress', description: 'You are having the darshan of the deity.', icon: 'solar:temple-bold-duotone', durationSeconds: 10, poiId: 'temple' },
  { id: 'prasad', title: 'Collect Prasad', description: 'Proceed to the counter to collect prasad.', icon: 'solar:gift-bold-duotone', durationSeconds: 8, poiId: 'prasad' },
  { id: 'exit', title: 'Yatra Complete', description: 'Thank you for visiting. Collect your belongings.', icon: 'solar:logout-3-bold-duotone', durationSeconds: 0 },
];

const BOOKING_HISTORY_KEY = 'yatra360_booking_history';

const YatraScreen: React.FC<YatraScreenProps> = ({ onNavigate, initialTab = 'journey' }) => {
  const [currentStepIndex, setCurrentStepIndex] = React.useState(0);
  const [activeTab, setActiveTab] = React.useState<'journey' | 'history'>(initialTab);
  const [bookingHistory, setBookingHistory] = React.useState<BookingHistory[]>([]);
  const [selectedBooking, setSelectedBooking] = React.useState<BookingHistory | null>(null);

  React.useEffect(() => {
    const currentStep = yatraSteps[currentStepIndex];
    if (!currentStep || currentStep.durationSeconds === 0) {
      return; // Stop the simulation at the last step
    }

    const timer = setTimeout(() => {
      setCurrentStepIndex(prevIndex => Math.min(prevIndex + 1, yatraSteps.length -1));
    }, currentStep.durationSeconds * 1000);

    return () => clearTimeout(timer);
  }, [currentStepIndex]);

  React.useEffect(() => {
    if (activeTab === 'history') {
      loadBookingHistory();
    }
  }, [activeTab]);

  // Listen for storage changes to refresh booking history
  React.useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === BOOKING_HISTORY_KEY) {
        console.log('🔄 Booking history updated in localStorage, refreshing...');
        loadBookingHistory();
      }
    };

    const handleBookingUpdate = () => {
      console.log('🔄 Booking completed, refreshing history...');
      loadBookingHistory();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('bookingHistoryUpdated', handleBookingUpdate);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('bookingHistoryUpdated', handleBookingUpdate);
    };
  }, []);

  const loadBookingHistory = () => {
    try {
      const history = localStorage.getItem(BOOKING_HISTORY_KEY);
      console.log('📚 Loading booking history from localStorage:', history);
      if (history) {
        const parsedHistory = JSON.parse(history);
        console.log('📋 Parsed booking history:', parsedHistory.length, 'bookings');
        console.log('📋 Booking data:', parsedHistory);
        setBookingHistory(parsedHistory.sort((a: BookingHistory, b: BookingHistory) => b.timestamp - a.timestamp));
      } else {
        console.log('📭 No booking history found in localStorage');
        setBookingHistory([]);
      }
    } catch (error) {
      console.error('❌ Error loading booking history:', error);
      setBookingHistory([]);
    }
  };

  // Test function to manually add a booking
  const addTestBooking = () => {
    const testBooking = {
      id: `TEST${Date.now()}`,
      slotId: 'test-slot',
      slotTime: '10:00 - 11:00',
      pilgrims: [],
      totalMembers: 2,
      seniorCitizenCount: 0,
      timestamp: Date.now(),
      status: 'confirmed' as const,
      qrCode: 'test-qr'
    };

    const existingHistory = localStorage.getItem(BOOKING_HISTORY_KEY);
    const historyArray = existingHistory ? JSON.parse(existingHistory) : [];
    historyArray.push(testBooking);
    localStorage.setItem(BOOKING_HISTORY_KEY, JSON.stringify(historyArray));
    
    console.log('🧪 Test booking added');
    loadBookingHistory();
  };

  const generateQRForBooking = async (booking: BookingHistory) => {
    try {
      const qrData = {
        bookingId: booking.id,
        slot: booking.slotTime,
        pilgrims: booking.totalMembers,
        timestamp: booking.timestamp
      };

      const qrCodeDataURL = await QRCode.toDataURL(JSON.stringify(qrData));
      return qrCodeDataURL;
    } catch (error) {
      console.error('Error generating QR code:', error);
      return null;
    }
  };

  const showBookingDetails = async (booking: BookingHistory) => {
    if (!booking.qrCode) {
      const qrCode = await generateQRForBooking(booking);
      if (qrCode) {
        booking.qrCode = qrCode;
        // Update the booking in localStorage
        const updatedHistory = bookingHistory.map(b =>
          b.id === booking.id ? { ...b, qrCode } : b
        );
        localStorage.setItem(BOOKING_HISTORY_KEY, JSON.stringify(updatedHistory));
        setBookingHistory(updatedHistory);
      }
    }
    setSelectedBooking(booking);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'text-green-600 bg-green-100';
      case 'completed': return 'text-blue-600 bg-blue-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStepStatus = (index: number) => {
    if (index < currentStepIndex) return 'COMPLETED';
    if (index === currentStepIndex) return 'CURRENT';
    return 'UPCOMING';
  };

  return (
    <div className="space-y-6">
       <style>{`
          .timeline-connector {
            position: absolute;
            left: 24px;
            top: 56px;
            bottom: -8px;
            width: 2px;
            background-color: #e5e7eb; /* gray-200 */
          }
          .timeline-item:last-child .timeline-connector {
            display: none;
          }
        `}</style>
      <h1 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-2 sm:gap-3">
        <iconify-icon icon="solar:compass-square-bold-duotone" className="text-orange-500 text-lg sm:text-xl"></iconify-icon>
        My Yatra 360°
      </h1>

      {/* Tab Navigation */}
      <div className="flex bg-white rounded-lg p-1 shadow-sm">
        <button
          onClick={() => setActiveTab('journey')}
          className={`flex-1 py-2 px-3 sm:px-4 rounded-md font-medium transition-colors text-sm sm:text-base ${
            activeTab === 'journey'
              ? 'bg-orange-500 text-white'
              : 'text-gray-600 hover:text-orange-500'
          }`}
        >
          My Journey
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 py-2 px-3 sm:px-4 rounded-md font-medium transition-colors text-sm sm:text-base ${
            activeTab === 'history'
              ? 'bg-orange-500 text-white'
              : 'text-gray-600 hover:text-orange-500'
          }`}
        >
          Booking History
        </button>
      </div>

      {activeTab === 'journey' ? (
        <>
          <LiveDarshanWaitingCard />

          <Card>
            <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-3 sm:mb-4">Your Journey Progress</h3>
            <div className="relative">
              {yatraSteps.map((step, index) => {
                const status = getStepStatus(index);
                const isCompleted = status === 'COMPLETED';
                const isCurrent = status === 'CURRENT';

                const iconColor = isCompleted ? 'bg-green-500' : isCurrent ? 'bg-orange-500' : 'bg-gray-400';
                const textColor = isCompleted ? 'text-gray-400 line-through' : isCurrent ? 'text-gray-800' : 'text-gray-500';

                return (
                  <div key={step.id} className="relative pl-12 sm:pl-16 pb-4 sm:pb-6 timeline-item">
                    <div className="timeline-connector"></div>
                    <div className="absolute left-0 top-1 flex items-center justify-center">
                      <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full ${iconColor} text-white flex items-center justify-center shadow-md ring-4 ring-amber-50 ${isCurrent ? 'animate-pulse' : ''}`}>
                        <iconify-icon icon={isCompleted ? 'solar:check-read-bold' : step.icon} className="text-lg sm:text-2xl"></iconify-icon>
                      </div>
                    </div>
                    <div className={`transition-all duration-300 ${isCurrent ? 'font-bold' : ''}`}>
                      <p className={`text-sm sm:text-lg ${textColor}`}>{step.title}</p>
                      <p className={`text-xs sm:text-sm ${isCompleted ? 'text-gray-400' : 'text-gray-500'}`}>{step.description}</p>
                      {step.poiId && isCurrent && (
                        <button
                          onClick={() => onNavigate(step.poiId!)}
                          className="mt-1 sm:mt-2 text-xs sm:text-sm bg-orange-100 text-orange-700 font-semibold py-1 px-2 sm:px-3 rounded-full hover:bg-orange-200 transition-colors flex items-center gap-1"
                        >
                          <iconify-icon icon="solar:map-arrow-right-bold" className="text-xs sm:text-base"></iconify-icon>
                          View on Map
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </>
      ) : (
        /* Booking History Section */
        <div className="space-y-3 sm:space-y-4">
          {bookingHistory.length === 0 ? (
            <Card className="text-center py-6 sm:py-8">
              <iconify-icon icon="solar:document-bold-duotone" className="text-3xl sm:text-4xl text-gray-400 mx-auto mb-3 sm:mb-4"></iconify-icon>
              <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-2">No Bookings Yet</h3>
              <p className="text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4">Your darshan bookings will appear here</p>
              <button
                onClick={addTestBooking}
                className="bg-orange-500 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors text-sm sm:text-base"
              >
                Add Test Booking
              </button>
            </Card>
          ) : (
            <div className="space-y-2 sm:space-y-3">
              {bookingHistory.map((booking) => (
                <Card key={booking.id} className="p-3 sm:p-4 cursor-pointer hover:shadow-md transition-shadow" onClick={() => showBookingDetails(booking)}>
                  <div className="flex justify-between items-start mb-2 sm:mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-800 text-sm sm:text-base">{booking.slotTime}</h3>
                      <p className="text-xs sm:text-sm text-gray-600">{formatDate(booking.timestamp)}</p>
                    </div>
                    <span className={`px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-xs sm:text-sm text-gray-600">
                    <span>Booking ID: {booking.id}</span>
                    <span>{booking.totalMembers} {booking.totalMembers === 1 ? 'person' : 'people'}</span>
                  </div>

                  {booking.seniorCitizenCount > 0 && (
                    <div className="mt-1 sm:mt-2 text-xs text-orange-600">
                      {booking.seniorCitizenCount} senior citizen{booking.seniorCitizenCount > 1 ? 's' : ''}
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Booking Details Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
          <Card className="max-w-sm sm:max-w-md w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-3 sm:mb-4">
              <h2 className="text-lg sm:text-xl font-bold text-gray-800">Booking Details</h2>
              <button
                onClick={() => setSelectedBooking(null)}
                className="p-1 hover:bg-gray-100 rounded-full"
              >
                <iconify-icon icon="solar:close-bold" className="text-lg sm:text-xl text-gray-500"></iconify-icon>
              </button>
            </div>

            <div className="space-y-3 sm:space-y-4">
              <div className="bg-gray-50 p-2 sm:p-3 rounded-lg">
                <div className="text-xs sm:text-sm text-gray-600">Booking ID</div>
                <div className="font-mono text-xs sm:text-sm font-semibold">{selectedBooking.id}</div>
              </div>

              <div className="bg-gray-50 p-2 sm:p-3 rounded-lg">
                <div className="text-xs sm:text-sm text-gray-600">Darshan Time</div>
                <div className="font-semibold text-sm sm:text-base">{selectedBooking.slotTime}</div>
              </div>

              <div className="bg-gray-50 p-2 sm:p-3 rounded-lg">
                <div className="text-xs sm:text-sm text-gray-600">Date & Time</div>
                <div className="font-semibold text-sm sm:text-base">{formatDate(selectedBooking.timestamp)}</div>
              </div>

              <div className="bg-gray-50 p-2 sm:p-3 rounded-lg">
                <div className="text-xs sm:text-sm text-gray-600">Group Size</div>
                <div className="font-semibold text-sm sm:text-base">{selectedBooking.totalMembers} people</div>
                {selectedBooking.seniorCitizenCount > 0 && (
                  <div className="text-xs sm:text-sm text-orange-600 mt-1">
                    Including {selectedBooking.seniorCitizenCount} senior citizen{selectedBooking.seniorCitizenCount > 1 ? 's' : ''}
                  </div>
                )}
              </div>

              {selectedBooking.pilgrims.length > 0 && (
                <div className="bg-gray-50 p-2 sm:p-3 rounded-lg">
                  <div className="text-xs sm:text-sm text-gray-600 mb-2">Pilgrim Details</div>
                  <div className="space-y-1">
                    {selectedBooking.pilgrims.map((pilgrim, index) => (
                      <div key={index} className="text-xs sm:text-sm">
                        <span className="font-medium">{pilgrim.name}</span>
                        <span className="text-gray-500 ml-2">({pilgrim.age} years, {pilgrim.gender})</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedBooking.qrCode && (
                <div className="bg-white p-3 sm:p-4 rounded-lg border-2 border-dashed border-orange-200">
                  <div className="text-center mb-2 sm:mb-3">
                    <div className="text-xs sm:text-sm text-gray-600">Show this QR code at temple entrance</div>
                  </div>
                  <img
                    src={selectedBooking.qrCode}
                    alt="Booking QR Code"
                    className="w-full max-w-xs mx-auto rounded-lg shadow-sm"
                  />
                </div>
              )}

              <div className={`text-center py-2 px-3 rounded-lg text-sm sm:text-base ${getStatusColor(selectedBooking.status)}`}>
                Status: {selectedBooking.status.charAt(0).toUpperCase() + selectedBooking.status.slice(1)}
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default YatraScreen;