# MediHelp - Medical Aid Platform

## Overview

MediHelp is a comprehensive medical aid platform that connects patients with verified doctors for instant consultations, provides pharmacy location services, facilitates medical donations, and offers emergency transport services. The application is built as a full-stack web application with a React frontend and Express backend, using PostgreSQL for data persistence.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

### January 2025
- **Transport Services Complete**: Implemented comprehensive transport booking system with ambulance, cab, and motorbike services
- **Database Integration**: Added transport providers, bookings, and payments tables with sample data
- **Patient Dashboard**: Integrated transport booking access with visual emergency booking button
- **Backend API**: Created complete transport API with booking, payment, and provider management endpoints
- **UI Components**: Built transport booking interface with real-time provider availability and fare calculation

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui component library
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query for server state management, React Context for authentication
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Neon serverless configuration
- **ORM**: Drizzle ORM for type-safe database operations
- **Session Management**: Basic authentication without sessions (stateless)

### Database Design
- **Primary Database**: PostgreSQL hosted on Neon
- **Schema Location**: `/shared/schema.ts` with Drizzle definitions
- **Migration Strategy**: Drizzle Kit for schema migrations
- **Connection**: Serverless connection pooling via Neon

## Key Components

### Authentication System
- **Strategy**: Simple email/password authentication
- **User Roles**: Patient, Doctor, Admin
- **Verification**: Doctor verification system for medical professionals
- **Storage**: User credentials and profile data in PostgreSQL

### Medical Consultation System
- **Types**: Regular and emergency consultations
- **Features**: Video interface mockup, chat functionality, prescription management
- **Workflow**: Patient requests → Doctor accepts → Consultation → Completion with diagnosis
- **Status Tracking**: Pending, active, completed, cancelled states

### Pharmacy Locator
- **Features**: Medicine search across pharmacies, location-based pharmacy finding
- **Data**: Pharmacy inventory, medicine availability, pricing information
- **Integration**: Prepared for maps integration and real-time inventory

### Donation Platform
- **Types**: Consultation funding, medicine donations, general healthcare support
- **Features**: Anonymous donations, donation tracking, request fulfillment
- **Analytics**: Donation statistics and impact tracking

### Transport Services
- **Types**: Ambulance, cab, and motorbike transport for medical emergencies
- **Features**: Real-time provider availability, fare estimation, booking tracking
- **Provider Management**: Driver details, vehicle information, ratings system
- **Emergency Support**: Multiple urgency levels, special requirements handling

### Admin Dashboard
- **Doctor Verification**: Approve/reject doctor registrations
- **System Monitoring**: Track consultations, donations, and user activity
- **Analytics**: Platform usage statistics and health metrics

## Data Flow

### User Registration Flow
1. User submits registration form (email, password, name, role)
2. System validates credentials and creates user record
3. For doctors: Additional profile creation with medical credentials
4. For patients: Basic profile setup with optional medical history

### Consultation Flow
1. Patient searches available doctors or requests emergency consultation
2. Doctor accepts consultation request
3. System creates consultation record with pending status
4. Video interface enables real-time communication
5. Doctor provides diagnosis and prescription
6. Consultation marked as completed with medical records saved

### Pharmacy Search Flow
1. User searches for specific medicine
2. System queries pharmacy inventory across all locations
3. Results filtered by availability and sorted by distance/price
4. Integration ready for real-time stock updates

## External Dependencies

### Core Dependencies
- **Database**: Neon PostgreSQL serverless database
- **UI Framework**: Radix UI primitives with shadcn/ui styling
- **Validation**: Zod for runtime type checking and validation
- **Date Handling**: date-fns for date manipulation and formatting

### Development Dependencies
- **TypeScript**: Full type safety across frontend and backend
- **ESBuild**: Fast bundling for production backend
- **Vite**: Development server and frontend build tool
- **Tailwind CSS**: Utility-first CSS framework

### Integration Ready
- **Maps API**: Prepared for Google Maps or similar integration
- **Video Calling**: Infrastructure ready for WebRTC or video service integration
- **Payment Gateway**: Structure prepared for donation payment processing
- **Email Service**: Ready for notification system integration

## Deployment Strategy

### Development Environment
- **Command**: `npm run dev` starts both frontend and backend
- **Hot Reload**: Vite provides instant frontend updates
- **Database**: Local development with Neon cloud database
- **Port Configuration**: Express serves API, Vite serves frontend

### Production Build
- **Frontend**: Vite builds optimized React bundle to `/dist/public`
- **Backend**: ESBuild bundles Express server to `/dist/index.js`
- **Static Assets**: Frontend served from Express in production
- **Database**: Production PostgreSQL connection via environment variables

### Environment Configuration
- **Database**: `DATABASE_URL` environment variable required
- **Build Process**: Separate frontend and backend build steps
- **Deployment**: Single Node.js process serves both API and static files

### Key Architectural Decisions

1. **Monorepo Structure**: Shared types and schemas between frontend and backend enable type safety and reduce duplication
2. **Serverless Database**: Neon PostgreSQL provides scalability without infrastructure management
3. **Component Library**: shadcn/ui provides consistent, accessible UI components
4. **Type Safety**: Full TypeScript coverage with shared validation schemas
5. **API Design**: RESTful endpoints with consistent error handling and response formats

The application prioritizes rapid development and deployment while maintaining code quality and type safety throughout the stack.