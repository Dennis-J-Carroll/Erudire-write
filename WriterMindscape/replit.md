# Erudire - AI-Powered Writing Assistant

## Overview

Erudire is an intelligent writing application built with React, Express, and PostgreSQL. It provides writers with AI-powered assistance, document organization through folders and mind maps, dictionary integration, and customizable writing environments. The application features a modern, distraction-free interface inspired by minimalist writing tools, with real-time writing suggestions and comprehensive document management capabilities.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui component library
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query for server state, React hooks for local state
- **UI Components**: Radix UI primitives with custom theming
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Server**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **API**: RESTful endpoints for documents, folders, and AI services
- **Development**: Hot module replacement with Vite integration
- **Production**: ESBuild bundling for server-side code

### Key Components

1. **Writing Editor**: Core text editing interface with AI assistance, formatting tools, and real-time statistics
2. **Mind Map View**: Visual document organization and relationship mapping
3. **Document Management**: Hierarchical folder structure with search capabilities
4. **AI Integration**: OpenAI-powered writing suggestions and assistance
5. **Dictionary Panel**: Word lookup and definition display
6. **Theme System**: Multiple writing environments (light, dark, beige)
7. **Settings Panel**: Customizable writing preferences and AI behavior

## Data Flow

1. **Document Creation/Editing**: User interactions trigger mutations that update the database via REST API
2. **AI Assistance**: Writing pauses trigger background requests to OpenAI service for contextual suggestions
3. **Real-time Updates**: Document statistics (word count, character count) update automatically as user types
4. **State Synchronization**: TanStack Query manages cache invalidation and background refetching
5. **Theme Persistence**: User preferences stored in localStorage and applied via CSS custom properties

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database connectivity
- **drizzle-orm**: Type-safe database operations
- **@tanstack/react-query**: Server state management
- **@radix-ui/react-***: Accessible UI primitives
- **openai**: AI writing assistance integration
- **wouter**: Lightweight routing

### Development Tools
- **tsx**: TypeScript execution for development
- **esbuild**: Production bundling
- **drizzle-kit**: Database schema management
- **vite**: Development server and build tool

## Deployment Strategy

### Development Environment
- **Platform**: Replit with Node.js 20, Web, and PostgreSQL 16 modules
- **Hot Reload**: Vite development server with HMR
- **Database**: Managed PostgreSQL instance
- **Port Configuration**: Server runs on port 5000, mapped to external port 80

### Production Build
- **Frontend**: Vite builds React app to static assets
- **Backend**: ESBuild bundles Express server with external dependencies
- **Deployment**: Autoscale deployment target on Replit
- **Database Migrations**: Drizzle Kit manages schema changes

### Environment Configuration
- **Database**: PostgreSQL connection via DATABASE_URL environment variable
- **AI Services**: OpenAI API key configuration
- **Session Management**: PostgreSQL-backed sessions with connect-pg-simple

## Changelog

```
Changelog:
- June 26, 2025. Initial setup
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```