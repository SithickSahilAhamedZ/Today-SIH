// FIX: Changed React import from namespace import ('* as React') to default import ('React') to resolve widespread JSX intrinsic element type errors. The default import is standard with modern TypeScript/React configurations and should restore the correct JSX type definitions.
import React from 'react';
import { Icon } from '@iconify/react';
import { DarshanSlot, Pilgrim } from '../types';
import Card from './ui/Card';
import QRCode from 'qrcode';

const generateSlots = (): DarshanSlot[] => {
  const slots: DarshanSlot[] = [];
  const now = new Date();
  const currentHour = now.getHours();

  for (let i = 8; i <= 20; i++) {
    if (i === 13 || i === 14) continue; // Lunch break
    const time = `${i.toString().padStart(2, '0')}:00 - ${(i + 1).toString().padStart(2, '0')}:00`;
    const isPast = i < currentHour;
    
    let availability: 'Available' | 'Full' | 'Filling Fast' = 'Available';
    if(isPast) {
      availability = 'Full';
    } else {
      const random = Math.random();
      if (random < 0.3) availability = 'Full';
      else if (random < 0.6) availability = 'Filling Fast';
    }
    
    slots.push({
      id: `slot-${i}`,
      time,
      availability,
      booked: false,
    });
  }
  return slots;
};

interface BookingScreenProps {
  isOnline: boolean;
}

interface OfflineBooking {
  id: string;
  slotId: string;
  pilgrims: Pilgrim[];
  timestamp: number;
  status: 'pending' | 'submitting' | 'completed' | 'failed';
}

const OFFLINE_BOOKINGS_KEY = 'yatra360_offline_bookings';

const BookingScreen: React.FC<BookingScreenProps> = ({ isOnline }) => {
  const [slots, setSlots] = React.useState<DarshanSlot[]>([]);
  const [confirmationMessage, setConfirmationMessage] = React.useState<string>('');
  const [qrCodeDataUrl, setQrCodeDataUrl] = React.useState<string>('');
  
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [selectedSlot, setSelectedSlot] = React.useState<DarshanSlot | null>(null);
  const [pilgrims, setPilgrims] = React.useState<Pilgrim[]>([{ id: 1, name: '', age: '', gender: '', differentlyAbled: false }]);
  const [formError, setFormError] = React.useState<string | null>(null);
  const [offlineBookings, setOfflineBookings] = React.useState<OfflineBooking[]>([]);
  const [isSubmittingOffline, setIsSubmittingOffline] = React.useState(false);

  // Save offline bookings to localStorage
  const saveOfflineBookings = (bookings: OfflineBooking[]) => {
    try {
      localStorage.setItem(OFFLINE_BOOKINGS_KEY, JSON.stringify(bookings));
      setOfflineBookings(bookings);
    } catch (error) {
      console.error('Failed to save offline bookings:', error);
    }
  };

  // Submit offline bookings when online
  const submitOfflineBookings = async (pendingBookings: OfflineBooking[]) => {
    if (isSubmittingOffline) return;
    
    setIsSubmittingOffline(true);
    
    for (const booking of pendingBookings) {
      try {
        // Update booking status to submitting
        const updatedBookings = offlineBookings.map(b => 
          b.id === booking.id ? { ...b, status: 'submitting' as const } : b
        );
        saveOfflineBookings(updatedBookings);

        // Find the slot for this booking
        const slot = slots.find(s => s.id === booking.slotId);
        if (!slot) {
          throw new Error('Slot not found');
        }

        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Generate booking ID and QR code
        const bookingId = `PGRM-${Date.now().toString().slice(-6)}`;
        
        const bookingData = {
          bookingId,
          slotTime: slot.time,
          temple: 'Som Nath Temple',
          bookingDate: new Date().toISOString().split('T')[0],
          pilgrimCount: booking.pilgrims.length,
          verificationCode: btoa(bookingId + slot.time).slice(0, 8)
        };

        const qrDataUrl = await QRCode.toDataURL(JSON.stringify(bookingData), {
          width: 200,
          margin: 2,
          color: {
            dark: '#EA580C',
            light: '#FFFFFF'
          }
        });

        // Update slot as booked
        setSlots(prevSlots =>
          prevSlots.map(s =>
            s.id === slot.id ? { ...s, booked: true, bookingId: bookingId } : s
          )
        );

        // Mark booking as completed
        const completedBookings = offlineBookings.map(b => 
          b.id === booking.id ? { ...b, status: 'completed' as const } : b
        );
        saveOfflineBookings(completedBookings);

        // Show success message
        setConfirmationMessage(`Offline booking submitted successfully! Your Booking ID is: ${bookingId}`);
        setQrCodeDataUrl(qrDataUrl);

      } catch (error) {
        console.error('Failed to submit offline booking:', error);
        
        // Mark booking as failed
        const failedBookings = offlineBookings.map(b => 
          b.id === booking.id ? { ...b, status: 'failed' as const } : b
        );
        saveOfflineBookings(failedBookings);
      }
    }
    
    setIsSubmittingOffline(false);
  };

  React.useEffect(() => {
    setSlots(generateSlots());
  }, []);

  // Load offline bookings from localStorage
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem(OFFLINE_BOOKINGS_KEY);
      if (saved) {
        const parsedBookings = JSON.parse(saved);
        setOfflineBookings(parsedBookings);
      }
    } catch (error) {
      console.error('Failed to load offline bookings:', error);
    }
  }, []);

  // Auto-submit offline bookings when connection is restored
  React.useEffect(() => {
    if (isOnline && offlineBookings.length > 0) {
      const pendingBookings = offlineBookings.filter(booking => booking.status === 'pending');
      if (pendingBookings.length > 0) {
        submitOfflineBookings(pendingBookings);
      }
    }
  }, [isOnline, offlineBookings]);

  // Simulate live changes to slot availability
  React.useEffect(() => {
    if (!isOnline) return;

    const interval = setInterval(() => {
      setSlots(currentSlots => {
        // Pause updates when the modal is open to prevent confusion
        if (isModalOpen) return currentSlots;

        const availableSlots = currentSlots.filter(s => s.availability !== 'Full' && !s.booked);
        if (availableSlots.length === 0) return currentSlots;

        // Pick a random available slot to update
        const slotToChangeIndex = Math.floor(Math.random() * availableSlots.length);
        const slotToChange = availableSlots[slotToChangeIndex];

        // FIX: Added an explicit return type to the map callback to prevent TypeScript from inferring a broader, incorrect type for the `availability` property.
        const newSlots = currentSlots.map((s): DarshanSlot => {
          if (s.id === slotToChange.id) {
            if (s.availability === 'Available' && Math.random() < 0.3) { // 30% chance to become 'Filling Fast'
              return { ...s, availability: 'Filling Fast' };
            } else if (s.availability === 'Filling Fast' && Math.random() < 0.5) { // 50% chance to become 'Full'
              return { ...s, availability: 'Full' };
            }
          }
          return s;
        });

        return newSlots;
      });
    }, 8000); // Update every 8 seconds

    return () => clearInterval(interval);
  }, [isOnline, isModalOpen]);

  const handleSelectSlot = (slotId: string) => {
    const targetSlot = slots.find(s => s.id === slotId);

    if (targetSlot?.booked) {
      setSlots(prevSlots => prevSlots.map(s => s.id === slotId ? { ...s, booked: false, bookingId: undefined } : s));
      setConfirmationMessage(`Booking ID ${targetSlot.bookingId} for ${targetSlot.time} has been cancelled.`);
      return;
    }

    if (targetSlot && targetSlot.availability !== 'Full') {
      setSelectedSlot(targetSlot);
      setPilgrims([{ id: Date.now(), name: '', age: '', gender: '', differentlyAbled: false }]);
      setFormError(null);
      setIsModalOpen(true);
      setConfirmationMessage('');
    }
  };
  
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedSlot(null);
  };

  const handlePilgrimCountChange = (delta: number) => {
    setPilgrims(currentPilgrims => {
      const newCount = Math.max(1, Math.min(10, currentPilgrims.length + delta));
      if (newCount > currentPilgrims.length) {
        const newPilgrims = [...Array(newCount - currentPilgrims.length)].map((_, i) => ({
          id: Date.now() + i,
          name: '',
          age: '',
          gender: '',
          differentlyAbled: false,
        }));
        return [...currentPilgrims, ...newPilgrims];
      } else if (newCount < currentPilgrims.length) {
        return currentPilgrims.slice(0, newCount);
      }
      return currentPilgrims;
    });
  };

  const handlePilgrimDetailChange = (index: number, field: keyof Omit<Pilgrim, 'id'>, value: string | boolean) => {
    // FIX: The type of `value` is broad (`string | boolean`), which caused a type conflict when updating specific fields like `gender`. This was resolved by using an immutable `.map` operation and casting the new object to Pilgrim, which is safe because the component's inputs ensure the correct value types are passed for each field.
    setPilgrims(currentPilgrims =>
      currentPilgrims.map((pilgrim, i) =>
        i === index
          ? ({ ...pilgrim, [field]: value }) as Pilgrim
          : pilgrim
      )
    );
  };

  const handlePayNow = async () => {
    for (const pilgrim of pilgrims) {
      if (!pilgrim.name.trim() || !pilgrim.age.trim() || !pilgrim.gender) {
        setFormError('Please fill in name, age, and gender for all pilgrims.');
        return;
      }
      const ageNum = parseInt(pilgrim.age);
      if (isNaN(ageNum) || ageNum <= 0 || ageNum > 120) {
        setFormError('Please enter a valid age (1-120) for all pilgrims.');
        return;
      }
    }
    setFormError(null);

    if (!isOnline) {
      // Save booking for offline submission
      const offlineBooking: OfflineBooking = {
        id: `offline-${Date.now()}`,
        slotId: selectedSlot!.id,
        pilgrims: [...pilgrims],
        timestamp: Date.now(),
        status: 'pending'
      };

      const updatedBookings = [...offlineBookings, offlineBooking];
      saveOfflineBookings(updatedBookings);

      setConfirmationMessage(`Booking saved offline! It will be submitted automatically when you reconnect to the internet.`);
      handleCloseModal();
      return;
    }

    // Online booking flow
    const bookingId = `PGRM-${Date.now().toString().slice(-6)}`;

    // Generate QR code data - only include booking ID and verification data for security
    const bookingData = {
      bookingId,
      slotTime: selectedSlot?.time,
      temple: 'Som Nath Temple',
      bookingDate: new Date().toISOString().split('T')[0],
      pilgrimCount: pilgrims.length,
      verificationCode: btoa(bookingId + selectedSlot?.time).slice(0, 8) // Simple verification code
    };

    try {
      const qrDataUrl = await QRCode.toDataURL(JSON.stringify(bookingData), {
        width: 200,
        margin: 2,
        color: {
          dark: '#EA580C', // Orange color
          light: '#FFFFFF'
        }
      });
      setQrCodeDataUrl(qrDataUrl);
    } catch (error) {
      console.error('Failed to generate QR code:', error);
    }

    setSlots(prevSlots =>
      prevSlots.map(slot =>
        slot.id === selectedSlot?.id ? { ...slot, booked: true, bookingId: bookingId } : slot
      )
    );
    setConfirmationMessage(`Successfully booked the ${selectedSlot?.time} slot for ${pilgrims.length} pilgrim(s)! Your Booking ID is: ${bookingId}`);
    handleCloseModal();
  };  const getStatusColor = (availability: DarshanSlot['availability']) => {
    switch (availability) {
      case 'Available': return 'text-green-600';
      case 'Filling Fast': return 'text-yellow-600';
      case 'Full': return 'text-red-600';
      default: return 'text-gray-500';
    }
  };

  const getButtonState = (slot: DarshanSlot) => {
    if (slot.booked) {
      return { text: 'Cancel Booking', class: 'bg-red-500 text-white hover:bg-red-600', disabled: false };
    }
    if (slot.availability === 'Full') {
      return { text: 'Full', class: 'bg-gray-300 text-gray-500 cursor-not-allowed', disabled: true };
    }
    return { text: 'Book Now', class: 'bg-orange-500 text-white hover:bg-orange-600', disabled: false };
  };
  
  const isBookingInvalid = pilgrims.some(p => !p.name.trim() || !p.age.trim() || !p.gender || isNaN(parseInt(p.age)) || parseInt(p.age) <= 0 || parseInt(p.age) > 120);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white p-4 sm:p-6 shadow-lg">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-2xl sm:text-3xl">book_online</span>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold">Book Darshan Slot</h1>
                <p className="text-orange-100 text-sm">Select your preferred time for a peaceful darshan</p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
          <style>{`
            @keyframes fade-in {
              from { opacity: 0; transform: translateY(-10px); }
              to { opacity: 1; transform: translateY(0); }
            }
            .animate-fade-in {
              animation: fade-in 0.3s ease-out forwards;
            }
            @keyframes modal-fade-in {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            .animate-modal-fade-in {
              animation: modal-fade-in 0.2s ease-out forwards;
            }
            @keyframes modal-slide-up {
              from { opacity: 0; transform: translateY(20px) scale(0.98); }
              to { opacity: 1; transform: translateY(0) scale(1); }
            }
            .animate-modal-slide-up {
              animation: modal-slide-up 0.3s ease-out forwards;
            }
            @keyframes pilgrim-fade-in {
               from { opacity: 0; transform: translateX(-10px); }
               to { opacity: 1; transform: translateX(0); }
            }
            .animate-pilgrim-fade-in {
                animation: pilgrim-fade-in 0.4s ease-out forwards;
            }
          `}</style>
        <h2 className="text-lg sm:text-xl font-bold text-gray-700">Book Darshan Slot</h2>
        
        {confirmationMessage && (
          <Card className="bg-green-50 border-l-4 border-green-500 animate-fade-in">
            <div className="flex flex-col items-center space-y-2 sm:space-y-3">
                <div className="flex items-center space-x-2 sm:space-x-3">
                    <span className="material-symbols-outlined text-green-600 text-base sm:text-lg">check_circle</span>
                    <p className="text-xs sm:text-sm text-green-800 font-semibold">{confirmationMessage}</p>
                </div>
                {qrCodeDataUrl && (
                  <div className="text-center">
                    <p className="text-xs text-gray-600 mb-2">Scan this QR code at the temple entrance</p>
                    <img 
                      src={qrCodeDataUrl} 
                      alt="Booking QR Code" 
                      className="mx-auto border-2 border-green-200 rounded-lg shadow-sm w-24 h-24 sm:w-32 sm:h-32"
                    />
                  </div>
                )}
            </div>
          </Card>
        )}

        <p className="text-xs sm:text-sm text-gray-500">Select a time slot for a hassle-free darshan experience. Bookings are free of charge.</p>

        {!isOnline && (
          <Card className="bg-blue-50 border-l-4 border-blue-400 card-enhanced">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <span className="material-symbols-outlined text-blue-600 text-base sm:text-lg">cloud_off</span>
              <div>
                <p className="text-xs sm:text-sm text-blue-800 font-semibold">Offline Mode</p>
                <p className="text-xs text-blue-700">You can pre-fill booking details now. They'll be submitted automatically when you reconnect.</p>
              </div>
            </div>
          </Card>
        )}

        {/* Pending Offline Bookings */}
        {offlineBookings.filter(b => b.status === 'pending').length > 0 && (
          <Card className="bg-yellow-50 border-l-4 border-yellow-400 card-enhanced">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <Icon icon="material-symbols:schedule" className="text-yellow-600 text-base sm:text-lg" />
                <div>
                  <p className="text-xs sm:text-sm text-yellow-800 font-semibold">
                    {offlineBookings.filter(b => b.status === 'pending').length} Offline Booking{offlineBookings.filter(b => b.status === 'pending').length > 1 ? 's' : ''} Pending
                  </p>
                  <p className="text-xs text-yellow-700">
                    {isOnline ? 'Submitting automatically...' : 'Will submit when online'}
                  </p>
                </div>
              </div>
              {isOnline && isSubmittingOffline && (
                <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-2 border-yellow-600 border-t-transparent"></div>
              )}
            </div>
          </Card>
        )}

        {/* Submitting Offline Bookings */}
        {isSubmittingOffline && (
          <Card className="bg-blue-50 border-l-4 border-blue-400">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-2 border-blue-600 border-t-transparent"></div>
              <p className="text-xs sm:text-sm text-blue-800 font-semibold">Submitting offline bookings...</p>
            </div>
          </Card>
        )}
        
        <div className="space-y-2 sm:space-y-3 pt-2">
          {slots.map(slot => {
            const buttonState = getButtonState(slot);
            return (
              <Card key={slot.id} className={`transition-all duration-300 ${slot.booked && isOnline ? 'border-2 border-green-500 shadow-lg' : ''}`}>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm sm:text-base font-bold text-gray-800">{slot.time}</p>
                    {slot.booked && slot.bookingId ? (
                        <p className="text-xs font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded-full inline-block mt-1">
                            ID: {slot.bookingId}
                        </p>
                    ) : (
                        <p className={`text-xs sm:text-sm font-semibold ${getStatusColor(slot.availability)}`}>{slot.availability}</p>
                    )}
                  </div>
                  <button
                    onClick={() => handleSelectSlot(slot.id)}
                    disabled={buttonState.disabled}
                    className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-bold transition-colors ${buttonState.class}`}
                  >
                    {buttonState.text}
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      </div>        <p className="text-sm text-gray-500">Select a time slot for a hassle-free darshan experience. Bookings are free of charge.</p>

        {!isOnline && (
          <Card className="bg-blue-50 border-l-4 border-blue-400">
            <div className="flex items-center space-x-3">
              <Icon icon="material-symbols:cloud-off" className="text-blue-600 text-lg" />
              <div>
                <p className="text-sm text-blue-800 font-semibold">Offline Mode</p>
                <p className="text-xs text-blue-700">You can pre-fill booking details now. They'll be submitted automatically when you reconnect.</p>
              </div>
            </div>
          </Card>
        )}

        {/* Pending Offline Bookings */}
        {offlineBookings.filter(b => b.status === 'pending').length > 0 && (
          <Card className="bg-yellow-50 border-l-4 border-yellow-400">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Icon icon="material-symbols:schedule" className="text-yellow-600 text-lg" />
                <div>
                  <p className="text-sm text-yellow-800 font-semibold">
                    {offlineBookings.filter(b => b.status === 'pending').length} Offline Booking{offlineBookings.filter(b => b.status === 'pending').length > 1 ? 's' : ''} Pending
                  </p>
                  <p className="text-xs text-yellow-700">
                    {isOnline ? 'Submitting automatically...' : 'Will submit when online'}
                  </p>
                </div>
              </div>
              {isOnline && isSubmittingOffline && (
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-yellow-600 border-t-transparent"></div>
              )}
            </div>
          </Card>
        )}

        {/* Submitting Offline Bookings */}
        {isSubmittingOffline && (
          <Card className="bg-blue-50 border-l-4 border-blue-400">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent"></div>
              <p className="text-sm text-blue-800 font-semibold">Submitting offline bookings...</p>
            </div>
          </Card>
        )}
        
        <div className="space-y-3 pt-2">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-gray-800 mb-2">Available Time Slots</h3>
            <p className="text-sm text-gray-600">Select a time slot for a hassle-free darshan experience. Bookings are free of charge.</p>
          </div>
          {slots.map(slot => {
            const buttonState = getButtonState(slot);
            return (
              <Card key={slot.id} className={`card-enhanced transition-all duration-300 hover:shadow-md ${slot.booked && isOnline ? 'border-2 border-green-500 shadow-lg bg-green-50' : ''}`}>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Icon icon="material-symbols:schedule" className="text-orange-600 text-lg" />
                      <p className="font-bold text-gray-800 text-base">{slot.time}</p>
                    </div>
                    {slot.booked && slot.bookingId ? (
                        <div className="flex items-center gap-2">
                          <Icon icon="material-symbols:check-circle" className="text-green-600 text-sm" />
                          <p className="text-xs font-semibold text-green-700 bg-green-100 px-2 py-1 rounded-full">
                              ID: {slot.bookingId}
                          </p>
                        </div>
                    ) : (
                        <p className={`text-sm font-semibold ${getStatusColor(slot.availability)}`}>{slot.availability}</p>
                    )}
                  </div>
                  <button
                    onClick={() => handleSelectSlot(slot.id)}
                    disabled={buttonState.disabled}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all duration-300 transform hover:scale-105 ${buttonState.class}`}
                  >
                    {buttonState.text}
                  </button>
                </div>
              </Card>
            );
          })}
        </div>

      {isModalOpen && selectedSlot && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center p-2 sm:p-4 animate-modal-fade-in">
          <Card className="w-full max-w-sm sm:max-w-md max-h-[95vh] sm:max-h-[90vh] flex flex-col animate-modal-slide-up p-0">
            <header className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-200 flex-shrink-0">
                <div>
                    <h3 className="text-base sm:text-lg font-bold text-gray-800">Booking for {selectedSlot.time}</h3>
                    <p className="text-xs sm:text-sm text-gray-500">Please provide details for all pilgrims.</p>
                </div>
                <button onClick={handleCloseModal} className="p-1.5 sm:p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500" aria-label="Close booking modal">
                    <Icon icon="material-symbols:close" className="text-lg sm:text-xl text-gray-600" />
                </button>
            </header>
            
            <main className="flex-grow overflow-y-auto p-3 sm:p-4">
              <div className="space-y-4 sm:space-y-6">
                <div>
                  <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-2">Number of Pilgrims</label>
                  <div className="flex items-center justify-center space-x-3 sm:space-x-4 bg-gray-100 p-2 rounded-lg">
                    <button onClick={() => handlePilgrimCountChange(-1)} disabled={pilgrims.length <= 1} className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white shadow-sm text-orange-500 text-lg sm:text-xl flex items-center justify-center disabled:opacity-50 transition-transform active:scale-90">-</button>
                    <span className="text-base sm:text-lg font-bold text-gray-800 w-6 sm:w-8 text-center">{pilgrims.length}</span>
                    <button onClick={() => handlePilgrimCountChange(1)} disabled={pilgrims.length >= 10} className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white shadow-sm text-orange-500 text-lg sm:text-xl flex items-center justify-center disabled:opacity-50 transition-transform active:scale-90">+</button>
                  </div>
                </div>

                <div className="space-y-3 sm:space-y-4">
                  {pilgrims.map((pilgrim, index) => (
                    <div key={pilgrim.id} className="p-3 sm:p-4 border border-gray-200 rounded-lg animate-pilgrim-fade-in" style={{ animationDelay: `${index * 80}ms` }}>
                      <h4 className="font-semibold text-gray-700 mb-2 sm:mb-3 text-sm sm:text-base">Pilgrim {index + 1}</h4>
                      <div className="space-y-2 sm:space-y-3">
                        <input
                          type="text"
                          placeholder="Full Name"
                          value={pilgrim.name}
                          onChange={(e) => handlePilgrimDetailChange(index, 'name', e.target.value)}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                        <input
                          type="number"
                          placeholder="Age"
                          value={pilgrim.age}
                          onChange={(e) => handlePilgrimDetailChange(index, 'age', e.target.value)}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                        <div>
                            <span className="text-xs sm:text-sm font-medium text-gray-600">Gender</span>
                            <div className="grid grid-cols-3 gap-1 sm:gap-2 mt-1">
                                {(['Male', 'Female', 'Other'] as const).map(gender => (
                                    <button
                                        key={gender}
                                        type="button"
                                        onClick={() => handlePilgrimDetailChange(index, 'gender', gender)}
                                        className={`py-1.5 sm:py-2 px-1 sm:px-2 text-xs sm:text-sm rounded-md transition-colors font-semibold ${
                                            pilgrim.gender === gender
                                            ? 'bg-orange-500 text-white shadow'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                    >
                                        {gender}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <label className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm text-gray-600 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={pilgrim.differentlyAbled}
                            onChange={(e) => handlePilgrimDetailChange(index, 'differentlyAbled', e.target.checked)}
                            className="h-3 w-3 sm:h-4 sm:w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500 accent-orange-500"
                          />
                          <span>Requires special assistance</span>
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </main>

            <footer className="p-3 sm:p-4 border-t border-gray-200 flex-shrink-0 space-y-2">
                {formError && <p className="text-xs sm:text-sm text-red-600 text-center font-semibold">{formError}</p>}
                
                {!isOnline && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 sm:p-3">
                    <div className="flex items-center space-x-1 sm:space-x-2 text-blue-800">
                      <Icon icon="material-symbols:info" className="text-blue-600 text-sm sm:text-lg" />
                      <p className="text-xs sm:text-sm font-medium">Offline Booking</p>
                    </div>
                    <p className="text-xs text-blue-700 mt-1">Your booking details will be saved and submitted automatically when you reconnect to the internet.</p>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                    <button onClick={handleCloseModal} className="w-full bg-gray-200 text-gray-800 font-bold py-2 px-3 sm:px-4 rounded-lg hover:bg-gray-300 transition-colors text-sm sm:text-base">Cancel</button>
                    <button onClick={handlePayNow} disabled={isBookingInvalid} className="w-full bg-orange-500 text-white font-bold py-2 px-3 sm:px-4 rounded-lg hover:bg-orange-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed text-sm sm:text-base">
                      {isOnline ? 'Pay Now' : 'Save Offline'}
                    </button>
                </div>
            </footer>
          </Card>
        </div>
      )}
    </div>
  );
};

export default BookingScreen;