# Project Brief: Snowgoose

## Overview

Snowgoose is a standalone NextJS 14 application that provides a unified interface for connecting to various AI services. It handles all functionality internally, including database management and AI service integration.

## Core Requirements

1. Support multiple AI service providers

   - OpenAI integration
   - Anthropic integration
   - Google integration
   - OpenRouter integration
   - Extensible for future providers

2. Feature Support

   - Text chat capabilities
   - Vision/image analysis
   - Image generation
   - Direct database integration through Prisma
   - Personas that set system prompt
   - Output format to request different outputs like Markdown, HTML, or plain text
   - Supabase integration for authentication
   - Thinking mode support for Anthropic and Google thinking models
   - Conversation history management
   - MCP tool integration
   - Subscription management via Stripe
   - Logging via Axiom
   - Email notifications via Resend
   - User onboarding tour

3. Key Goals
   - Clean, beautiful, and responsive UI/UX (including mobile)
   - Complete database management through Prisma
   - Elegant error handling
   - Efficient server actions

## Project Scope

- Full-stack application with Next.js 14
- Direct database integration with Prisma ORM
- Easily extensible as AI providers add new features
- Comprehensive error handling and reliability
- Security and authentication
- Server-side processing with Server Actions
- Standalone AI vendor integration package (snowgander)
- Payment processing and subscription management
