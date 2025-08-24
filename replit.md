# Overview

This is a comprehensive brick manufacturing ERP (Enterprise Resource Planning) system built with React, TypeScript, and Express. The application manages all aspects of a brick manufacturing operation including worker management, attendance tracking, production monitoring, sales orders, customer management, inventory control, and payment processing.

The system handles two types of workers: "rojdaar" (daily wage) and "karagir" (piece-rate), with sophisticated payroll calculations, attendance tracking, and production monitoring capabilities.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture

The frontend is built using React with TypeScript and follows a modern component-based architecture:

- **Framework**: React with Vite as the build tool
- **Styling**: Tailwind CSS with shadcn/ui component library for consistent UI components
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **Form Handling**: React Hook Form with Zod validation for type-safe forms
- **UI Components**: Comprehensive set of reusable components using Radix UI primitives

The application uses a clean folder structure with separate directories for pages, components, forms, and utilities. All UI components are built with accessibility in mind using Radix UI primitives.

## Backend Architecture

The backend follows a RESTful API design using Express.js:

- **Framework**: Express.js with TypeScript
- **Architecture Pattern**: Layered architecture with separate routing, storage, and business logic layers
- **API Design**: RESTful endpoints following standard HTTP conventions
- **Error Handling**: Centralized error handling middleware
- **Request Logging**: Custom middleware for API request logging and performance monitoring

The backend uses a storage abstraction layer that defines interfaces for all data operations, making it database-agnostic and easily testable.

## Data Storage Architecture

- **ORM**: Drizzle ORM for type-safe database operations
- **Database**: PostgreSQL configured for production use
- **Connection**: Neon Database serverless PostgreSQL for scalable cloud deployment
- **Schema Management**: Centralized schema definitions with automatic TypeScript type generation
- **Migrations**: Drizzle Kit for database migrations and schema changes

The database schema includes tables for workers, attendance, customers, sales orders, inventory, payments, and weekly summaries with proper relationships and constraints.

## Authentication and Authorization

Currently implements session-based architecture preparation:
- **Session Storage**: PostgreSQL-based session storage using connect-pg-simple
- **Session Security**: Configured for secure session management
- **Authorization Pattern**: Interface ready for role-based access control implementation

## Development and Build Architecture

- **Development Server**: Vite development server with HMR (Hot Module Replacement)
- **Build Process**: Separate builds for client (Vite) and server (esbuild)
- **TypeScript**: Strict TypeScript configuration with path mapping for clean imports
- **Code Quality**: ESM modules throughout for modern JavaScript standards

The build process creates optimized bundles for both client and server code, with the client build being served as static files by the Express server in production.

# External Dependencies

## Database Services
- **Neon Database**: Serverless PostgreSQL database hosting
- **PostgreSQL**: Primary database system with full ACID compliance

## Development Tools
- **Vite**: Frontend build tool and development server
- **Drizzle Kit**: Database migration and introspection tool
- **TypeScript**: Static type checking and enhanced development experience

## UI and Styling
- **Tailwind CSS**: Utility-first CSS framework for styling
- **Radix UI**: Headless UI component primitives for accessibility
- **Lucide React**: Icon library for consistent iconography
- **shadcn/ui**: Pre-built component library based on Radix UI

## State Management and Data Fetching
- **TanStack Query**: Server state management, caching, and synchronization
- **React Hook Form**: Form state management and validation
- **Zod**: Schema validation and TypeScript type inference

## Runtime and Utilities
- **date-fns**: Date manipulation and formatting utilities
- **clsx**: Conditional CSS class name utility
- **class-variance-authority**: Type-safe CSS class variants

## Replit Integration
- **Replit Plugins**: Development environment enhancements and error handling for Replit-specific features

The application is designed to be fully self-contained with minimal external service dependencies, making it suitable for deployment in various environments while maintaining high performance and reliability.