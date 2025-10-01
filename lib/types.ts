import { 
  user as PrismaUser,
  event as PrismaEvent,
  ticket as PrismaTicket,
  ticketType as PrismaTicketType,
  artist as PrismaArtist,
  eventArtist as PrismaEventArtist,
  participant as PrismaParticipant,
  rrppAssignment as PrismaRrppAssignment,
  payment as PrismaPayment,
  Role,
  EventStatus,
  TicketStatus,
  PaymentStatus
} from '../app/generated/prisma';

/**
 * Representa el subconjunto de datos del usuario que está disponible
 * en el objeto de sesión del lado del cliente.
 */
export type SessionUser = Pick<
  PrismaUser,
  'id' | 'name' | 'email' | 'image'
>;

/**
 * Extended user type with additional profile fields
 */
export type User = PrismaUser;

/**
 * Event with related data (artists, ticket types, etc.)
 */
export type EventWithDetails = PrismaEvent & {
  eventArtists: (PrismaEventArtist & {
    artist: PrismaArtist;
  })[];
  ticketTypes: PrismaTicketType[];
  tickets?: PrismaTicket[];
  participants?: PrismaParticipant[];
  rrppAssignments?: PrismaRrppAssignment[];
  payments?: PrismaPayment[];
};

/**
 * Ticket with related data (event, owner, type, payment)
 */
export type TicketWithDetails = PrismaTicket & {
  event: PrismaEvent;
  owner: PrismaUser;
  type: PrismaTicketType;
  transferredFrom?: PrismaUser | null;
  payment?: PrismaPayment | null;
};

/**
 * Artist with event associations
 */
export type ArtistWithEvents = PrismaArtist & {
  eventArtists: (PrismaEventArtist & {
    event: PrismaEvent;
  })[];
};

/**
 * Cart item interface for shopping cart functionality
 */
export interface CartItem {
  eventId: number;
  typeId: number;
  quantity: number;
  price: number;
  label: string;
  eventName: string;
  eventDate: Date;
}

/**
 * Payment with related data (user, event, tickets)
 */
export type PaymentWithDetails = PrismaPayment & {
  user: PrismaUser;
  event: PrismaEvent;
  tickets: (PrismaTicket & {
    type: PrismaTicketType;
    owner: PrismaUser;
  })[];
};

/**
 * Payment-related types
 */
export interface PaymentData {
  id: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  paymentMethodId?: string;
  paymentTypeId?: string;
  merchantOrderId?: string;
  preferenceId?: string;
  siteId?: string;
  processingMode?: string;
  merchantAccountId?: string;
}

/**
 * MercadoPago preference item
 */
export interface MercadoPagoItem {
  id: string;
  title: string;
  quantity: number;
  unit_price: number;
  currency_id: string;
}

/**
 * MercadoPago preference configuration
 */
export interface MercadoPagoPreference {
  items: MercadoPagoItem[];
  back_urls: {
    success: string;
    failure: string;
    pending: string;
  };
  auto_return: string;
  external_reference: string;
  notification_url?: string;
}

/**
 * Form data types for authentication
 */
export interface LoginFormData {
  email: string;
  password: string;
}

export interface SignupFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword?: string;
}

export interface CheckoutOnboardingFormData {
  name: string;
  email: string;
  password: string;
  username?: string;
  dni?: string;
  birthDate?: string;
}

/**
 * API Response types
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: unknown;
}

/**
 * Event creation/update form data
 */
export interface EventFormData {
  name: string;
  date: string;
  location: string;
  description?: string;
  bannerUrl?: string;
  status: EventStatus;
  capacityTotal?: number;
  isRsvpAllowed: boolean;
  eventGenre?: string;
  ticketTypes: TicketTypeFormData[];
  artists: ArtistFormData[];
}

export interface TicketTypeFormData {
  code: string;
  label: string;
  price: number;
  stockMax: number;
  userMaxPerType: number;
  scanExpiration?: string;
}

export interface ArtistFormData {
  name: string;
  bio?: string;
  imageUrl?: string;
  socialLinks?: string[];
  order?: number;
  slotTime?: string;
  isHeadliner: boolean;
}

/**
 * Store state types
 */
export interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (eventId: number, typeId: number) => void;
  updateQuantity: (eventId: number, typeId: number, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalQuantity: () => number;
}

export interface UserStore {
  user: SessionUser | null;
  setUser: (user: SessionUser | null) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  clearUser: () => void;
}

export interface EventStore {
  events: EventWithDetails[];
  currentEvent: EventWithDetails | null;
  setEvents: (events: EventWithDetails[]) => void;
  setCurrentEvent: (event: EventWithDetails | null) => void;
  addEvent: (event: EventWithDetails) => void;
  updateEvent: (eventId: number, updates: Partial<EventWithDetails>) => void;
  removeEvent: (eventId: number) => void;
}

export interface TicketsStore {
  tickets: TicketWithDetails[];
  setTickets: (tickets: TicketWithDetails[]) => void;
  addTicket: (ticket: TicketWithDetails) => void;
  updateTicket: (ticketId: number, updates: Partial<TicketWithDetails>) => void;
  removeTicket: (ticketId: number) => void;
  getTicketsByStatus: (status: TicketStatus) => TicketWithDetails[];
}

/**
 * Component prop types
 */
export interface EventCardProps {
  event: EventWithDetails;
  className?: string;
}

export interface TicketCardProps {
  ticket: TicketWithDetails;
  onTransfer?: (ticket: TicketWithDetails) => void;
  onCancel?: (ticket: TicketWithDetails) => void;
}

export interface UserSidebarProps {
  user: SessionUser;
  onLogout?: () => void;
}

/**
 * QR Scanner types
 */
export interface QRScanResult {
  success: boolean;
  ticket?: TicketWithDetails;
  message: string;
  error?: string;
}

/**
 * Utility types
 */
export type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>;

// Export Prisma enums for convenience
export { Role, EventStatus, TicketStatus, PaymentStatus };
