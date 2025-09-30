// FIX: Changed React import from namespace import ('* as React') to default import ('React') to resolve widespread JSX intrinsic element type errors. The default import is standard with modern TypeScript/React configurations and should restore the correct JSX type definitions.
import React from 'react';
import Card from './ui/Card';
import QRCode from 'qrcode';
import { Pilgrim } from '../types';

interface BookingHistory {
  id: string;
  slotId: string;
  slotTime: string;
  pilgrims: Pilgrim[];
  totalMembers: number;
  seniorCitizenCount: number;
  timestamp: number;
  status: 'confirmed' | 'completed' | 'cancelled';
  qrCode?: string;
}

const BOOKING_HISTORY_KEY = 'yatra360_booking_history';

const HistoryScreen: React.FC = () => {
  const [bookingHistory, setBookingHistory] = React.useState<BookingHistory[]>([]);
  const [selectedBooking, setSelectedBooking] = React.useState<BookingHistory | null>(null);

  React.useEffect(() => {
    loadBookingHistory();
  }, []);

  const loadBookingHistory = () => {
    try {
      const history = localStorage.getItem(BOOKING_HISTORY_KEY);
      if (history) {
        const parsedHistory = JSON.parse(history);
        setBookingHistory(parsedHistory.sort((a: BookingHistory, b: BookingHistory) => b.timestamp - a.timestamp));
      }
    } catch (error) {
      console.error('Error loading booking history:', error);
    }
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 p-4">
      <div className="max-w-md mx-auto space-y-4">
        {/* Header */}
        <div className="text-center py-4">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">My Bookings</h1>
          <p className="text-gray-600">View your darshan booking history</p>
        </div>

        {/* Booking History List */}
        {bookingHistory.length === 0 ? (
          <Card className="text-center py-8">
            <iconify-icon icon="solar:document-bold-duotone" className="text-4xl text-gray-400 mx-auto mb-4"></iconify-icon>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No Bookings Yet</h3>
            <p className="text-gray-500">Your darshan bookings will appear here</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {bookingHistory.map((booking) => (
              <Card key={booking.id} className="p-4 cursor-pointer hover:shadow-md transition-shadow" onClick={() => showBookingDetails(booking)}>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-800">{booking.slotTime}</h3>
                    <p className="text-sm text-gray-600">{formatDate(booking.timestamp)}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </span>
                </div>

                <div className="flex justify-between items-center text-sm text-gray-600">
                  <span>Booking ID: {booking.id}</span>
                  <span>{booking.totalMembers} {booking.totalMembers === 1 ? 'person' : 'people'}</span>
                </div>

                {booking.seniorCitizenCount > 0 && (
                  <div className="mt-2 text-xs text-orange-600">
                    {booking.seniorCitizenCount} senior citizen{booking.seniorCitizenCount > 1 ? 's' : ''}
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}

        {/* Booking Details Modal */}
        {selectedBooking && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="max-w-sm w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Booking Details</h2>
                <button
                  onClick={() => setSelectedBooking(null)}
                  className="p-1 hover:bg-gray-100 rounded-full"
                >
                  <iconify-icon icon="solar:close-bold" className="text-xl text-gray-500"></iconify-icon>
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-sm text-gray-600">Booking ID</div>
                  <div className="font-mono text-sm font-semibold">{selectedBooking.id}</div>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-sm text-gray-600">Darshan Time</div>
                  <div className="font-semibold">{selectedBooking.slotTime}</div>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-sm text-gray-600">Date & Time</div>
                  <div className="font-semibold">{formatDate(selectedBooking.timestamp)}</div>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-sm text-gray-600">Group Size</div>
                  <div className="font-semibold">{selectedBooking.totalMembers} people</div>
                  {selectedBooking.seniorCitizenCount > 0 && (
                    <div className="text-sm text-orange-600 mt-1">
                      Including {selectedBooking.seniorCitizenCount} senior citizen{selectedBooking.seniorCitizenCount > 1 ? 's' : ''}
                    </div>
                  )}
                </div>

                {selectedBooking.pilgrims.length > 0 && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-sm text-gray-600 mb-2">Pilgrim Details</div>
                    <div className="space-y-1">
                      {selectedBooking.pilgrims.map((pilgrim, index) => (
                        <div key={index} className="text-sm">
                          <span className="font-medium">{pilgrim.name}</span>
                          <span className="text-gray-500 ml-2">({pilgrim.age} years, {pilgrim.gender})</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedBooking.qrCode && (
                  <div className="bg-white p-4 rounded-lg border-2 border-dashed border-orange-200">
                    <div className="text-center mb-3">
                      <div className="text-sm text-gray-600">Show this QR code at temple entrance</div>
                    </div>
                    <img
                      src={selectedBooking.qrCode}
                      alt="Booking QR Code"
                      className="w-full max-w-xs mx-auto rounded-lg shadow-sm"
                    />
                  </div>
                )}

                <div className={`text-center py-2 px-3 rounded-lg ${getStatusColor(selectedBooking.status)}`}>
                  Status: {selectedBooking.status.charAt(0).toUpperCase() + selectedBooking.status.slice(1)}
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryScreen;