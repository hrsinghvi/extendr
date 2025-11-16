# Authentication Setup Guide

## Overview
The application now includes a complete authentication flow with:
- Sign Up and Log In modal variations
- Google OAuth integration
- GitHub OAuth integration
- Email authentication (redirects to Auth page)
- Protected build screen route

## How It Works

### 1. User Flow from Landing Page
- User enters a prompt in the Hero section and clicks Send/Enter
- System checks if user is authenticated
- If **NOT authenticated**: Sign Up modal appears
- If **authenticated**: User is redirected to `/build` screen with their prompt

### 2. Header Button Authentication
- **"Sign in" button**: Opens Log In modal
- **"Get started" button**: Opens Sign Up modal

### 3. Modal Variations
- **Sign Up Modal**: 
  - Title: "Start Building."
  - Subtitle: "Create free account"
  - Includes Terms of Service and Privacy Policy footer
  
- **Log In Modal**: 
  - Title: "Start Building."
  - Subtitle: "Log in to your account"
  - No footer

### 4. Authentication Options
1. **Continue with Google**: OAuth with Google (requires Supabase OAuth setup)
2. **Continue with GitHub**: OAuth with GitHub (requires Supabase OAuth setup)
3. **Continue with email**: Redirects to `/auth` page for email/password authentication

### 5. Building Screen (`/build`)
- Protected route (redirects to home if not authenticated)
- Left sidebar: Chat interface with AI
- Right side: Preview panel for the app being built
- Bottom: Input box for continuing conversation
- Includes "Thinking..." animation when AI is processing

## Supabase Configuration Required

To enable Google and GitHub OAuth, you need to configure them in your Supabase project:

### 1. Google OAuth Setup
1. Go to your Supabase project dashboard
2. Navigate to Authentication > Providers
3. Enable Google provider
4. Add your Google OAuth credentials (Client ID and Secret)
5. Add authorized redirect URL: `https://your-project.supabase.co/auth/v1/callback`

### 2. GitHub OAuth Setup
1. Go to your Supabase project dashboard
2. Navigate to Authentication > Providers
3. Enable GitHub provider
4. Create a GitHub OAuth App at https://github.com/settings/developers
5. Add callback URL: `https://your-project.supabase.co/auth/v1/callback`
6. Copy Client ID and Secret to Supabase

### 3. Email Authentication
Email authentication is already enabled by default in Supabase. The `/auth` page handles email/password sign up and login.

## Files Created/Modified

### New Files:
- `src/components/AuthModal.tsx` - Authentication modal component
- `src/pages/Build.tsx` - Building screen with chat and preview
- `AUTH_SETUP.md` - This file

### Modified Files:
- `src/components/Hero.tsx` - Added auth check and modal trigger
- `src/components/Header.tsx` - Connected buttons to auth modals
- `src/App.tsx` - Added `/build` route

## Testing the Flow

1. **Test Sign Up from Hero**:
   - Go to homepage
   - Enter a prompt in the center input box
   - Press Enter or click Send
   - Sign Up modal should appear

2. **Test Sign In from Header**:
   - Click "Sign in" button in header
   - Log In modal should appear

3. **Test Get Started from Header**:
   - Click "Get started" button in header
   - Sign Up modal should appear with Terms/Privacy footer

4. **Test Building Screen**:
   - After authentication, you should be redirected to `/build`
   - Chat interface on left, preview on right
   - Try sending messages in the chat

## Environment Variables

Make sure you have these in your `.env` file:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
```

## Next Steps

1. Configure OAuth providers in Supabase dashboard
2. Test authentication flow with Google and GitHub
3. Customize the building screen preview panel with actual app preview
4. Implement AI chat integration in the build screen
5. Add file upload functionality for the chat

