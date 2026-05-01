export interface User {
  _id: string;
  userName: string;
  email: string;
  phoneNumber?: string;
  role: string;
  profileImage?: string;
  avatar?: string;
  adminVerified?: boolean;
  verifiedEmail?: boolean;
  dateOfBirth?: string;
  createdAt?: string;
}

export interface PropertyImage {
  url: string;
}

export interface Property {
  // Basic Info
  _id?: string;
  title: string;
  description: string;
  type: string;
  category: string;
  price: string | number;
  
  // Location
  address: string;
  state: string;
  lga?: string;
  location: string;

  // Property Details
  bedrooms: string | number;
  bathrooms: string | number;
  furnishing?: string;
  
  // Amenities
  amenities?: string[];
  squareFeet?: string | number;
  yearBuilt?: string | number;

  // Images
  images?: PropertyImage[] | File[];
  video?: string | File | null;
  thumbnail?: string;
  
  // Status
  status?: string;
  verified?: boolean;
  avaliable?: boolean;
  
  // Relations
  host?: User;
  host?: string;
  
  // Metrics
  rating?: number;
  views?: number;
}

export interface Conversation {
  _id: string;
  participantId: string;
  participantName: string;
  participantAvatar?: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount: number;
  propertyContext?: {
    propertyId: string;
    propertyTitle: string;
  };
}

export interface Message {
  _id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
  read: boolean;
}
