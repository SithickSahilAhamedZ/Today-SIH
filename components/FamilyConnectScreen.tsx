import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import Card from './ui/Card';
import Button from './ui/Button';
import QRCode from './ui/QRCode';

interface FamilyMember {
  id: string;
  name: string;
  phone: string;
  location: {
    lat: number;
    lng: number;
    address: string;
    lastUpdated: Date;
  } | null;
  status: 'traveling' | 'checked-in' | 'at-temple' | 'accommodation' | 'offline';
  accommodation: {
    name: string;
    address: string;
    checkIn: Date;
    checkOut: Date;
  } | null;
  avatar: string;
}

interface FamilyGroup {
  id: string;
  name: string;
  inviteCode: string;
  members: FamilyMember[];
  createdBy: string;
  templeDestination: string;
}

const FamilyConnectScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'invite' | 'locate' | 'accommodation' | 'messages'>('overview');
  const [familyGroup, setFamilyGroup] = useState<FamilyGroup | null>({
    id: 'family-001',
    name: 'Sharma Family Yatra',
    inviteCode: 'SHARM2025',
    templeDestination: 'Tirupati Balaji',
    createdBy: 'current-user',
    members: [
      {
        id: 'member-1',
        name: 'Rajesh Sharma (You)',
        phone: '+91 98765 43210',
        location: {
          lat: 13.6288,
          lng: 79.4192,
          address: 'Near Tirupati Railway Station',
          lastUpdated: new Date(Date.now() - 5 * 60 * 1000) // 5 minutes ago
        },
        status: 'at-temple',
        accommodation: {
          name: 'TTD Guest House',
          address: 'K.T. Road, Tirupati',
          checkIn: new Date(),
          checkOut: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
        },
        avatar: 'solar:user-bold-duotone'
      },
      {
        id: 'member-2',
        name: 'Priya Sharma',
        phone: '+91 98765 43211',
        location: {
          lat: 13.6255,
          lng: 79.4186,
          address: 'TTD Guest House, Tirupati',
          lastUpdated: new Date(Date.now() - 2 * 60 * 1000)
        },
        status: 'accommodation',
        accommodation: {
          name: 'TTD Guest House',
          address: 'K.T. Road, Tirupati',
          checkIn: new Date(),
          checkOut: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
        },
        avatar: 'solar:woman-bold-duotone'
      },
      {
        id: 'member-3',
        name: 'Arjun Sharma',
        phone: '+91 98765 43212',
        location: {
          lat: 13.5000,
          lng: 79.3000,
          address: 'Chennai Express Highway',
          lastUpdated: new Date(Date.now() - 30 * 60 * 1000)
        },
        status: 'traveling',
        accommodation: null,
        avatar: 'solar:user-speak-bold-duotone'
      }
    ]
  });

  const [newFamilyName, setNewFamilyName] = useState('');
  const [invitePhone, setInvitePhone] = useState('');
  const [locationSharing, setLocationSharing] = useState(true);
  const [messages, setMessages] = useState([
    { id: '1', sender: 'Priya Sharma', message: 'Reached guest house safely! Room 205', time: '10:30 AM', type: 'status' },
    { id: '2', sender: 'Arjun Sharma', message: 'Still on highway, ETA 2:30 PM', time: '11:45 AM', type: 'location' },
    { id: '3', sender: 'Rajesh Sharma', message: 'Darshan queue is moving fast today!', time: '12:15 PM', type: 'temple' }
  ]);
  const [newMessage, setNewMessage] = useState('');

  const getStatusColor = (status: FamilyMember['status']) => {
    switch (status) {
      case 'at-temple': return 'text-green-600 bg-green-50';
      case 'accommodation': return 'text-blue-600 bg-blue-50';
      case 'traveling': return 'text-yellow-600 bg-yellow-50';
      case 'checked-in': return 'text-purple-600 bg-purple-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: FamilyMember['status']) => {
    switch (status) {
      case 'at-temple': return 'solar:temple-bold-duotone';
      case 'accommodation': return 'solar:home-smile-bold-duotone';
      case 'traveling': return 'solar:highway-bold-duotone';
      case 'checked-in': return 'solar:check-circle-bold-duotone';
      default: return 'solar:close-circle-bold-duotone';
    }
  };

  const generateInviteLink = () => {
    return `https://yatra360.app/join/${familyGroup?.inviteCode}`;
  };

  const shareInviteLink = async () => {
    const inviteText = `🕉️ Join our family pilgrimage to ${familyGroup?.templeDestination}!\n\nFamily Group: ${familyGroup?.name}\nInvite Code: ${familyGroup?.inviteCode}\n\nJoin here: ${generateInviteLink()}\n\nDownload Yatra 360 app for the complete experience!`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join Our Family Pilgrimage',
          text: inviteText,
        });
      } catch (error) {
        // Fallback to clipboard
        navigator.clipboard.writeText(inviteText);
        alert('Invite link copied to clipboard!');
      }
    } else {
      navigator.clipboard.writeText(inviteText);
      alert('Invite link copied to clipboard!');
    }
  };

  const getTimeAgo = (date: Date) => {
    const minutes = Math.floor((Date.now() - date.getTime()) / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const sendMessage = () => {
    if (newMessage.trim()) {
      const message = {
        id: Date.now().toString(),
        sender: 'Rajesh Sharma (You)',
        message: newMessage,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'message' as const
      };
      setMessages([...messages, message]);
      setNewMessage('');
    }
  };

  if (!familyGroup) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50 to-red-50 p-4">
        <div className="max-w-md mx-auto pt-8">
          <div className="text-center mb-8">
            <div className="mb-4">
              <Icon icon="solar:users-group-rounded-bold-duotone" className="text-8xl text-orange-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Family Connect</h1>
            <p className="text-gray-600">Stay connected with your family during your pilgrimage</p>
          </div>

          <Card className="p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Create Family Group</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Family Group Name
                </label>
                <input
                  type="text"
                  value={newFamilyName}
                  onChange={(e) => setNewFamilyName(e.target.value)}
                  placeholder="e.g., Sharma Family Tirupati Yatra"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              <Button 
                onClick={() => {
                  if (newFamilyName.trim()) {
                    const newGroup: FamilyGroup = {
                      id: 'family-' + Date.now(),
                      name: newFamilyName,
                      inviteCode: Math.random().toString(36).substr(2, 6).toUpperCase(),
                      members: [],
                      createdBy: 'current-user',
                      templeDestination: 'Temple Visit'
                    };
                    setFamilyGroup(newGroup);
                  }
                }}
                className="w-full"
              >
                Create Family Group
              </Button>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Join Family Group</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Family Invite Code
                </label>
                <input
                  type="text"
                  placeholder="Enter 6-digit code"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 uppercase"
                />
              </div>
              <Button variant="outline" className="w-full">
                Join Family Group
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-red-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-4">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold">{familyGroup.name}</h1>
              <p className="text-orange-100 text-sm">
                {familyGroup.members.length} members • {familyGroup.templeDestination}
              </p>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold">#{familyGroup.inviteCode}</div>
              <div className="text-xs text-orange-100">Invite Code</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="max-w-md mx-auto">
        <div className="flex bg-white shadow-sm overflow-x-auto">
          {[
            { id: 'overview', icon: 'solar:users-group-two-rounded-bold-duotone', label: 'Overview' },
            { id: 'invite', icon: 'solar:share-bold-duotone', label: 'Invite' },
            { id: 'locate', icon: 'solar:map-point-wave-bold-duotone', label: 'Locate' },
            { id: 'accommodation', icon: 'solar:home-smile-bold-duotone', label: 'Stay' },
            { id: 'messages', icon: 'solar:chat-round-dots-bold-duotone', label: 'Chat' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 p-3 text-center border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-orange-500 text-orange-600 bg-orange-50'
                  : 'border-transparent text-gray-600 hover:text-orange-500'
              }`}
            >
              <div className="text-lg mb-1">
                <Icon 
                  icon={tab.icon} 
                  className={`text-xl transition-all duration-300 ${
                    activeTab === tab.id 
                      ? 'animate-bounce-gentle text-orange-600' 
                      : 'hover:scale-110 text-gray-500'
                  }`}
                />
              </div>
              <div className="text-xs font-medium">{tab.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-md mx-auto p-4 space-y-4">
        {activeTab === 'overview' && (
          <>
            {/* Family Members Status */}
            <Card className="p-4">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <Icon icon="solar:users-group-rounded-bold-duotone" className="text-2xl mr-2 text-blue-600" />
                Family Members
              </h2>
              <div className="space-y-3">
                {familyGroup.members.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="mr-3">
                        <Icon icon={member.avatar} className="text-3xl text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-800">{member.name}</div>
                        <div className="text-sm text-gray-600">{member.phone}</div>
                        {member.location && (
                          <div className="text-xs text-gray-500 flex items-center">
                            <Icon icon="solar:map-point-bold-duotone" className="text-sm mr-1 text-gray-400" />
                            {member.location.address} • {getTimeAgo(member.location.lastUpdated)}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(member.status)} flex items-center gap-1`}>
                      <Icon icon={getStatusIcon(member.status)} className="text-sm" />
                      {member.status.replace('-', ' ')}
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-3">
              <Card className="p-4 text-center">
                <div className="text-2xl mb-2">
                  <Icon icon="solar:temple-bold-duotone" className="text-3xl text-green-600" />
                </div>
                <div className="text-lg font-bold text-green-600">
                  {familyGroup.members.filter(m => m.status === 'at-temple').length}
                </div>
                <div className="text-xs text-gray-600">At Temple</div>
              </Card>
              <Card className="p-4 text-center">
                <div className="text-2xl mb-2">
                  <Icon icon="solar:home-smile-bold-duotone" className="text-3xl text-blue-600" />
                </div>
                <div className="text-lg font-bold text-blue-600">
                  {familyGroup.members.filter(m => m.status === 'accommodation').length}
                </div>
                <div className="text-xs text-gray-600">At Stay</div>
              </Card>
              <Card className="p-4 text-center">
                <div className="text-2xl mb-2">
                  <Icon icon="solar:highway-bold-duotone" className="text-3xl text-yellow-600" />
                </div>
                <div className="text-lg font-bold text-yellow-600">
                  {familyGroup.members.filter(m => m.status === 'traveling').length}
                </div>
                <div className="text-xs text-gray-600">Traveling</div>
              </Card>
            </div>
          </>
        )}

        {activeTab === 'invite' && (
          <>
            <Card className="p-4">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <Icon icon="solar:share-circle-bold-duotone" className="text-2xl mr-2 text-orange-600" />
                Invite Family Members
              </h2>
              
              {/* QR Code */}
              <div className="text-center mb-6">
                <QRCode 
                  value={generateInviteLink()} 
                  size={160}
                  className="mx-auto"
                />
              </div>

              {/* Invite Code */}
              <div className="bg-orange-50 p-4 rounded-lg mb-4">
                <div className="text-center">
                  <div className="text-sm font-medium text-gray-700 mb-2">Family Invite Code</div>
                  <div className="text-3xl font-bold text-orange-600 tracking-wider">
                    {familyGroup.inviteCode}
                  </div>
                </div>
              </div>

              <Button onClick={shareInviteLink} className="w-full mb-4">
                Share Invite Link
              </Button>

              {/* Direct Phone Invite */}
              <div className="border-t pt-4">
                <h3 className="font-medium mb-3">Invite by Phone</h3>
                <div className="flex gap-2">
                  <input
                    type="tel"
                    value={invitePhone}
                    onChange={(e) => setInvitePhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  />
                  <Button variant="outline">Send</Button>
                </div>
              </div>
            </Card>
          </>
        )}

        {activeTab === 'locate' && (
          <>
            {/* Location Sharing Toggle */}
            <Card className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold flex items-center">
                    <Icon icon="solar:gps-bold-duotone" className="text-xl mr-2 text-green-600" />
                    Location Sharing
                  </h2>
                  <p className="text-sm text-gray-600">Share your location with family</p>
                </div>
                <button
                  onClick={() => setLocationSharing(!locationSharing)}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    locationSharing ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                    locationSharing ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>
            </Card>

            {/* Live Locations */}
            <Card className="p-4">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <Icon icon="solar:map-point-wave-bold-duotone" className="text-2xl mr-2 text-blue-600" />
                Family Locations
              </h2>
              
              {/* Map Placeholder */}
              <div className="w-full h-48 bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <Icon icon="solar:map-bold-duotone" className="text-5xl mb-2 text-gray-400" />
                  <div className="text-sm">Interactive Map View</div>
                  <div className="text-xs">Live family member locations</div>
                </div>
              </div>

              <div className="space-y-3">
                {familyGroup.members.filter(m => m.location).map((member) => (
                  <div key={member.id} className="flex items-start justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-start">
                      <div className="mr-3">
                        <Icon icon={member.avatar} className="text-2xl text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-800">{member.name}</div>
                        <div className="text-sm text-gray-600 flex items-center">
                          <Icon icon="solar:map-point-bold-duotone" className="text-sm mr-1 text-gray-400" />
                          {member.location?.address}
                        </div>
                        <div className="text-xs text-gray-500">
                          Updated {getTimeAgo(member.location!.lastUpdated)}
                        </div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Navigate
                    </Button>
                  </div>
                ))}
              </div>
            </Card>
          </>
        )}

        {activeTab === 'accommodation' && (
          <>
            <Card className="p-4">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <Icon icon="solar:buildings-3-bold-duotone" className="text-2xl mr-2 text-purple-600" />
                Family Accommodation
              </h2>
              
              {/* Current Bookings */}
              <div className="space-y-4">
                {familyGroup.members
                  .filter(m => m.accommodation)
                  .reduce((acc, member) => {
                    const existing = acc.find(item => item.accommodation.name === member.accommodation?.name);
                    if (existing) {
                      existing.members.push(member);
                    } else {
                      acc.push({
                        accommodation: member.accommodation!,
                        members: [member]
                      });
                    }
                    return acc;
                  }, [] as Array<{accommodation: NonNullable<FamilyMember['accommodation']>, members: FamilyMember[]}>)
                  .map((booking, index) => (
                    <div key={index} className="p-4 border-2 border-blue-200 rounded-lg bg-blue-50">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-gray-800">{booking.accommodation.name}</h3>
                          <p className="text-sm text-gray-600">{booking.accommodation.address}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-gray-500">Check-in</div>
                          <div className="text-sm font-medium">
                            {booking.accommodation.checkIn.toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mb-3">
                        {booking.members.map(member => (
                          <span key={member.id} className="text-xs bg-white px-2 py-1 rounded-full flex items-center gap-1">
                            <Icon icon={member.avatar} className="text-sm text-blue-600" />
                            {member.name.split(' ')[0]}
                          </span>
                        ))}
                      </div>
                      
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          View Details
                        </Button>
                        <Button size="sm" className="flex-1">
                          Navigate
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>

              {/* Add Accommodation */}
              <div className="mt-6 p-4 border-2 border-dashed border-gray-300 rounded-lg text-center">
                <div className="text-3xl mb-2">➕</div>
                <p className="text-sm text-gray-600 mb-3">Add your accommodation details</p>
                <Button variant="outline" size="sm">
                  Add Accommodation
                </Button>
              </div>
            </Card>

            {/* Nearby Recommendations */}
            <Card className="p-4">
              <h2 className="text-lg font-semibold mb-4">Recommended for Families</h2>
              <div className="space-y-3">
                {[
                  { name: 'TTD Guest House', distance: '0.5 km', price: '₹800/night', rating: 4.2 },
                  { name: 'Bhimas Paradise', distance: '1.2 km', price: '₹1200/night', rating: 4.5 },
                  { name: 'Fortune Select Grand Ridge', distance: '2.0 km', price: '₹2500/night', rating: 4.8 }
                ].map((place, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div>
                      <div className="font-medium">{place.name}</div>
                      <div className="text-sm text-gray-600">{place.distance} • ⭐ {place.rating}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-green-600">{place.price}</div>
                      <Button size="sm" variant="outline">Book</Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </>
        )}

        {activeTab === 'messages' && (
          <>
            {/* Family Chat */}
            <Card className="p-4">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <Icon icon="solar:chat-round-dots-bold-duotone" className="text-2xl mr-2 text-indigo-600" />
                Family Chat
              </h2>
              
              {/* Messages */}
              <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                {messages.map((message) => (
                  <div key={message.id} className={`p-3 rounded-lg ${
                    message.sender.includes('(You)') 
                      ? 'bg-orange-100 ml-8' 
                      : 'bg-gray-100 mr-8'
                  }`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-800">
                        {message.sender}
                      </span>
                      <span className="text-xs text-gray-500">{message.time}</span>
                    </div>
                    <p className="text-sm text-gray-700">{message.message}</p>
                    {message.type !== 'message' && (
                      <span className={`inline-block mt-1 text-xs px-2 py-1 rounded-full ${
                        message.type === 'status' ? 'bg-green-200 text-green-800' :
                        message.type === 'location' ? 'bg-blue-200 text-blue-800' :
                        'bg-orange-200 text-orange-800'
                      }`}>
                        {message.type}
                      </span>
                    )}
                  </div>
                ))}
              </div>

              {/* Message Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                />
                <Button onClick={sendMessage} size="sm">
                  Send
                </Button>
              </div>
            </Card>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="p-3 text-sm flex items-center justify-center gap-2">
                <Icon icon="solar:gps-bold-duotone" className="text-lg text-blue-600" />
                Share Location
              </Button>
              <Button variant="outline" className="p-3 text-sm flex items-center justify-center gap-2">
                <Icon icon="solar:camera-bold-duotone" className="text-lg text-purple-600" />
                Send Photo
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default FamilyConnectScreen;