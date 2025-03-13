# Project Brief: Snowgoose

## Overview

Snowgoose is a NextJS 14 frontend that provides a unified interface for connecting to various AI services. It connects to a specialized AI API called GPTFlask that handles the various backend work.

## Core Requirements

1. Support multiple AI service providers

   - OpenAI integration
   - Anthropic integration
   - Google integration
   - Extensible for future providers

2. Feature Support

   - Text chat capabilities
   - Vision/image analysis
   - Image generation
   - Standardized API interface
   - Personas that set system prompt
   - Output format to request different outputs like Markdown, HTML, or plain text
   - Clerk integration for authentication
   - Thinking mode support for Anthropic and Google thinking models
   - Can save conversations to return to later

3. Key Goals
   - Clean, beautiful UI/UX
   - Full access to the GPTFlask database through the settings page
   - Elegant handling of API errors

## Project Scope

- Frontend only. Backend is seperate and out of scope
- Easily extensable as AI providers add new features
- Error handling and reliability
- Security and authentication
