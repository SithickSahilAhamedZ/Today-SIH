// Family Connect Service - Handles family group management and real-time features
export class FamilyConnectService {
  private static instance: FamilyConnectService;
  private familyGroups: Map<string, FamilyGroup> = new Map();
  private locationWatchers: Map<string, number> = new Map();
  private messageSubscribers: Map<string, ((message: FamilyMessage) => void)[]> = new Map();

  static getInstance(): FamilyConnectService {
    if (!FamilyConnectService.instance) {
      FamilyConnectService.instance = new FamilyConnectService();
    }
    return FamilyConnectService.instance;
  }

  // Family Group Management
  async createFamilyGroup(name: string, creatorId: string, templeDestination: string): Promise<FamilyGroup> {
    const inviteCode = this.generateInviteCode();
    const familyGroup: FamilyGroup = {
      id: `family-${Date.now()}`,
      name,
      inviteCode,
      members: [],
      createdBy: creatorId,
      templeDestination,
      createdAt: new Date(),
      settings: {
        locationSharingEnabled: true,
        autoStatusUpdates: true,
        emergencyAlertsEnabled: true
      }
    };

    this.familyGroups.set(familyGroup.id, familyGroup);
    
    // Save to local storage
    this.saveFamilyGroupsToStorage();
    
    return familyGroup;
  }

  async joinFamilyGroup(inviteCode: string, memberInfo: Omit<FamilyMember, 'id' | 'joinedAt'>): Promise<FamilyGroup | null> {
    const familyGroup = Array.from(this.familyGroups.values())
      .find(group => group.inviteCode === inviteCode);
    
    if (!familyGroup) {
      throw new Error('Invalid invite code');
    }

    const newMember: FamilyMember = {
      ...memberInfo,
      id: `member-${Date.now()}`,
      joinedAt: new Date(),
      lastSeen: new Date()
    };

    familyGroup.members.push(newMember);
    this.saveFamilyGroupsToStorage();

    // Notify other members
    this.broadcastMessage(familyGroup.id, {
      id: `system-${Date.now()}`,
      groupId: familyGroup.id,
      senderId: 'system',
      type: 'system',
      message: `${newMember.name} joined the family group`,
      timestamp: new Date()
    });

    return familyGroup;
  }

  // Invite Link Generation
  generateInviteLink(inviteCode: string): string {
    const baseUrl = window.location.origin;
    return `${baseUrl}/join/${inviteCode}`;
  }

  generateQRCodeData(inviteCode: string, groupName: string): string {
    const inviteData = {
      type: 'family_invite',
      code: inviteCode,
      name: groupName,
      app: 'Yatra360',
      url: this.generateInviteLink(inviteCode)
    };
    return JSON.stringify(inviteData);
  }

  async shareInvite(inviteCode: string, groupName: string, method: 'link' | 'sms' | 'whatsapp' | 'native'): Promise<void> {
    const inviteText = `🕉️ Join our family pilgrimage!\n\nGroup: ${groupName}\nCode: ${inviteCode}\n\nJoin: ${this.generateInviteLink(inviteCode)}\n\nDownload Yatra 360 for the complete experience!`;
    
    switch (method) {
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(inviteText)}`);
        break;
      case 'sms':
        window.open(`sms:?body=${encodeURIComponent(inviteText)}`);
        break;
      case 'native':
        if (navigator.share) {
          await navigator.share({
            title: 'Join Our Family Pilgrimage',
            text: inviteText
          });
        } else {
          await navigator.clipboard.writeText(inviteText);
        }
        break;
      default:
        await navigator.clipboard.writeText(inviteText);
    }
  }

  // Location Services
  async enableLocationSharing(memberId: string): Promise<void> {
    if (!navigator.geolocation) {
      throw new Error('Geolocation not supported');
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        this.updateMemberLocation(memberId, {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: new Date()
        });
      },
      (error) => {
        console.error('Location error:', error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );

    this.locationWatchers.set(memberId, watchId);
  }

  async disableLocationSharing(memberId: string): Promise<void> {
    const watchId = this.locationWatchers.get(memberId);
    if (watchId) {
      navigator.geolocation.clearWatch(watchId);
      this.locationWatchers.delete(memberId);
    }
  }

  private async updateMemberLocation(memberId: string, location: LocationData): Promise<void> {
    // Reverse geocoding to get address
    try {
      const address = await this.reverseGeocode(location.lat, location.lng);
      
      // Update member location in all family groups
      this.familyGroups.forEach(group => {
        const member = group.members.find(m => m.id === memberId);
        if (member) {
          member.location = {
            ...location,
            address,
            lastUpdated: new Date()
          };
          member.lastSeen = new Date();
          
          // Auto-update status based on location
          member.status = this.inferStatusFromLocation(location, address);
        }
      });

      this.saveFamilyGroupsToStorage();
    } catch (error) {
      console.error('Error updating location:', error);
    }
  }

  private async reverseGeocode(lat: number, lng: number): Promise<string> {
    // Mock implementation - replace with actual geocoding service
    const commonLocations = [
      { name: 'Tirupati Temple', lat: 13.6833, lng: 79.3167 },
      { name: 'TTD Guest House', lat: 13.6255, lng: 79.4186 },
      { name: 'Tirupati Railway Station', lat: 13.6288, lng: 79.4192 }
    ];

    const nearest = commonLocations.reduce((prev, curr) => {
      const prevDist = Math.abs(prev.lat - lat) + Math.abs(prev.lng - lng);
      const currDist = Math.abs(curr.lat - lat) + Math.abs(curr.lng - lng);
      return currDist < prevDist ? curr : prev;
    });

    return `Near ${nearest.name}`;
  }

  private inferStatusFromLocation(location: LocationData, address: string): FamilyMemberStatus {
    if (address.toLowerCase().includes('temple')) return 'at-temple';
    if (address.toLowerCase().includes('guest house') || address.toLowerCase().includes('hotel')) return 'accommodation';
    return 'traveling';
  }

  // Messaging System
  async sendMessage(groupId: string, senderId: string, message: string): Promise<void> {
    const familyMessage: FamilyMessage = {
      id: `msg-${Date.now()}`,
      groupId,
      senderId,
      message,
      timestamp: new Date(),
      type: 'text'
    };

    this.broadcastMessage(groupId, familyMessage);
    
    // Save message to storage (implement as needed)
    this.saveMessageToStorage(familyMessage);
  }

  async sendLocationMessage(groupId: string, senderId: string): Promise<void> {
    if (!navigator.geolocation) {
      throw new Error('Geolocation not available');
    }

    navigator.geolocation.getCurrentPosition(async (position) => {
      const address = await this.reverseGeocode(position.coords.latitude, position.coords.longitude);
      
      const locationMessage: FamilyMessage = {
        id: `msg-${Date.now()}`,
        groupId,
        senderId,
        message: `📍 Current location: ${address}`,
        timestamp: new Date(),
        type: 'location',
        location: {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          address,
          timestamp: new Date()
        }
      };

      this.broadcastMessage(groupId, locationMessage);
      this.saveMessageToStorage(locationMessage);
    });
  }

  subscribeToMessages(groupId: string, callback: (message: FamilyMessage) => void): () => void {
    if (!this.messageSubscribers.has(groupId)) {
      this.messageSubscribers.set(groupId, []);
    }
    
    this.messageSubscribers.get(groupId)!.push(callback);
    
    // Return unsubscribe function
    return () => {
      const subscribers = this.messageSubscribers.get(groupId);
      if (subscribers) {
        const index = subscribers.indexOf(callback);
        if (index > -1) {
          subscribers.splice(index, 1);
        }
      }
    };
  }

  private broadcastMessage(groupId: string, message: FamilyMessage): void {
    const subscribers = this.messageSubscribers.get(groupId);
    if (subscribers) {
      subscribers.forEach(callback => callback(message));
    }
  }

  // Emergency Features
  async sendEmergencyAlert(groupId: string, senderId: string, message: string, location?: LocationData): Promise<void> {
    const emergencyMessage: FamilyMessage = {
      id: `emergency-${Date.now()}`,
      groupId,
      senderId,
      message,
      timestamp: new Date(),
      type: 'emergency',
      location
    };

    this.broadcastMessage(groupId, emergencyMessage);
    this.saveMessageToStorage(emergencyMessage);

    // Could trigger push notifications here
    this.sendPushNotification(groupId, 'Emergency Alert', message);
  }

  private async sendPushNotification(groupId: string, title: string, body: string): Promise<void> {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      // Implementation would depend on push service setup
      console.log('Push notification:', { title, body });
    }
  }

  // Accommodation Features
  async addAccommodation(memberId: string, accommodation: AccommodationInfo): Promise<void> {
    this.familyGroups.forEach(group => {
      const member = group.members.find(m => m.id === memberId);
      if (member) {
        member.accommodation = accommodation;
      }
    });
    
    this.saveFamilyGroupsToStorage();
  }

  async getAccommodationRecommendations(location: { lat: number; lng: number }, familySize: number): Promise<AccommodationRecommendation[]> {
    // Mock recommendations - replace with actual service
    return [
      {
        id: '1',
        name: 'TTD Guest House',
        address: 'K.T. Road, Tirupati',
        distance: 0.5,
        pricePerNight: 800,
        rating: 4.2,
        amenities: ['Family rooms', 'Dining hall', 'Prayer hall'],
        familyFriendly: true,
        availability: true
      },
      {
        id: '2',
        name: 'Bhimas Paradise',
        address: 'Air Port Road, Tirupati',
        distance: 1.2,
        pricePerNight: 1200,
        rating: 4.5,
        amenities: ['AC rooms', 'Restaurant', 'Parking'],
        familyFriendly: true,
        availability: true
      }
    ];
  }

  // Utility Methods
  private generateInviteCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  private saveFamilyGroupsToStorage(): void {
    try {
      const data = JSON.stringify(Array.from(this.familyGroups.entries()));
      localStorage.setItem('yatra360_family_groups', data);
    } catch (error) {
      console.error('Error saving family groups:', error);
    }
  }

  private loadFamilyGroupsFromStorage(): void {
    try {
      const data = localStorage.getItem('yatra360_family_groups');
      if (data) {
        const entries = JSON.parse(data);
        this.familyGroups = new Map(entries);
      }
    } catch (error) {
      console.error('Error loading family groups:', error);
    }
  }

  private saveMessageToStorage(message: FamilyMessage): void {
    try {
      const key = `yatra360_messages_${message.groupId}`;
      const existing = localStorage.getItem(key);
      const messages = existing ? JSON.parse(existing) : [];
      messages.push(message);
      
      // Keep only last 100 messages per group
      const recentMessages = messages.slice(-100);
      localStorage.setItem(key, JSON.stringify(recentMessages));
    } catch (error) {
      console.error('Error saving message:', error);
    }
  }

  // Initialize service
  init(): void {
    this.loadFamilyGroupsFromStorage();
  }
}

// Types
export interface FamilyGroup {
  id: string;
  name: string;
  inviteCode: string;
  members: FamilyMember[];
  createdBy: string;
  templeDestination: string;
  createdAt: Date;
  settings: FamilyGroupSettings;
}

export interface FamilyMember {
  id: string;
  name: string;
  phone: string;
  avatar: string;
  location: LocationData | null;
  status: FamilyMemberStatus;
  accommodation: AccommodationInfo | null;
  joinedAt: Date;
  lastSeen: Date;
}

export interface LocationData {
  lat: number;
  lng: number;
  address?: string;
  accuracy?: number;
  timestamp: Date;
  lastUpdated?: Date;
}

export interface AccommodationInfo {
  name: string;
  address: string;
  checkIn: Date;
  checkOut: Date;
  roomDetails?: string;
  contactNumber?: string;
}

export interface AccommodationRecommendation {
  id: string;
  name: string;
  address: string;
  distance: number;
  pricePerNight: number;
  rating: number;
  amenities: string[];
  familyFriendly: boolean;
  availability: boolean;
}

export interface FamilyMessage {
  id: string;
  groupId: string;
  senderId: string;
  message: string;
  timestamp: Date;
  type: 'text' | 'location' | 'emergency' | 'system';
  location?: LocationData;
}

export interface FamilyGroupSettings {
  locationSharingEnabled: boolean;
  autoStatusUpdates: boolean;
  emergencyAlertsEnabled: boolean;
}

export type FamilyMemberStatus = 'traveling' | 'checked-in' | 'at-temple' | 'accommodation' | 'offline' | 'emergency';

// Export singleton instance
export const familyConnectService = FamilyConnectService.getInstance();