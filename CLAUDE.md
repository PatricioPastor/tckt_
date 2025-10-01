# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Database
- `npm run "db init"` - Generate Prisma client
- `npm run "db studio"` - Open Prisma Studio
- `npm run "db seed"` - Seed database
- `bunx prisma migrate dev` - Run database migrations
- `bunx prisma generate` - Generate Prisma client

## Architecture

### Tech Stack
- **Next.js 15** with App Router and TypeScript
- **Better Auth** for authentication (email/password)
- **Prisma** with PostgreSQL for data management
- **Zustand** for state management with persistence
- **shadcn/ui** components with Tailwind CSS
- **MercadoPago** for payment processing
- **QR codes** for ticket validation

### Core Domain Models
The app is a ticket booking platform with these key entities:
- **Events** - Entertainment events with artists and ticket types
- **Tickets** - QR-coded tickets with status tracking (pending/paid/used/transferred)
- **TicketTypes** - Different tiers (general/vip/ultra/free) with pricing and capacity
- **Users** - Multi-role system (superadmin/head_producer/rrpp/qr_scanner/user)
- **Artists** - Performers linked to events
- **Payments** - MercadoPago integration for paid tickets

### Application Structure

#### Routing Patterns
- `app/(public)/*` - Public pages (home, events, checkout)
- `app/(admin)/*` - Admin dashboard and scanner
- `app/(auth)/*` - Login/signup pages
- `app/api/*` - API routes

#### State Management
- **Cart Store** (`lib/store/cart-store.ts`) - Shopping cart with Zustand persistence
- **User Store** (`lib/store/user-store.ts`) - User session and profile data
- **Event Store** (`lib/store/event-store.ts`) - Event data caching
- **Tickets Store** (`lib/store/tickets-store.ts`) - User's ticket management

#### Key Features
- **Dual Checkout Flow** - Separate handling for free vs paid tickets
- **QR Ticket System** - Unique QR codes for ticket validation
- **Role-based Access** - Different UI/permissions per user role
- **RRPP Commission System** - Sales representatives with custom commission rates
- **Guest Checkout** - Users can purchase without prior registration

### Authentication & Authorization
- Uses Better Auth with database adapter
- Middleware protects `/dashboard` and `/admin` routes
- Guest access allowed for public browsing and checkout
- Session-based authentication with cookie management

### Payment Integration
- MercadoPago for paid ticket processing
- Webhook handling for payment status updates
- Free ticket direct processing without payment gateway

### Development Patterns
- Use `@/` path alias for imports
- Prisma client singleton pattern in `lib/prisma.ts`
- Type-safe API routes with Better Auth session handling
- Component-based architecture with shadcn/ui
- Server actions for form handling where appropriate

### Database Schema Notes
- Users have optional profile fields (username, dni, birthDate)
- Tickets have unique QR codes and tracking codes
- Events support multiple ticket types with individual capacity limits
- Comprehensive audit logging through the `log` model

## Tool Preferences
- **ALWAYS use `bunx` instead of `npx`** for executing packages