# Housifi - Enterprise Frontend

An enterprise-level Next.js frontend application with Google OAuth authentication.

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   └── auth/[...nextauth]/     # NextAuth API routes
│   ├── login/                        # Login page with Google OAuth
│   ├── dashboard/                    # Landing/dashboard page
│   ├── layout.tsx                    # Root layout with session provider
│   ├── page.tsx                      # Home page (redirects based on auth)
│   ├── globals.css                   # Global styles
│   └── providers.tsx                 # Session provider
```

## Prerequisites

- Node.js 18+
- npm or yarn

## Setup Instructions

### 1. Install Dependencies

Dependencies are already installed. If you need to reinstall:

```bash
npm install
```

### 2. Configure Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project
3. Enable the Google+ API
4. Create OAuth 2.0 credentials (Web Application)
5. Set authorized redirect URIs to: `http://localhost:3000/api/auth/callback/google`

### 3. Environment Variables

Update `.env.local` with your Google OAuth credentials:

```bash
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here-change-this-in-production

# Google OAuth - Get these from Google Cloud Console
GOOGLE_CLIENT_ID=your-google-client-id-here
GOOGLE_CLIENT_SECRET=your-google-client-secret-here
```

To generate a secure `NEXTAUTH_SECRET`:
```bash
openssl rand -base64 32
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Features

- **Google OAuth Authentication**: Sign in with Google account
- **Session Management**: Automatic session handling with NextAuth.js
- **Protected Routes**: Dashboard page is protected and requires authentication
- **Responsive Design**: Built with Tailwind CSS for responsive UI
- **Enterprise Ready**: Best practices for authentication and state management

## Pages

- **`/`** - Home page (redirects to login or dashboard based on auth status)
- **`/login`** - Login page with Google sign-in button
- **`/dashboard`** - Landing/dashboard page (protected, requires authentication)

## Development

### Build

```bash
npm run build
```

### Lint

```bash
npm run lint
```

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy

For other platforms, ensure you set the `NEXTAUTH_URL` to your production URL.

## Key Technologies

- **Next.js 15** - React framework
- **TypeScript** - Type safety
- **NextAuth.js** - Authentication
- **Tailwind CSS** - Styling
- **ESLint** - Code quality

## Best Practices

- Never commit `.env.local` to version control
- Always use environment variables for sensitive data
- Keep `NEXTAUTH_SECRET` secure in production
- Regularly update dependencies

## Security Considerations

- CSRF protection enabled by NextAuth.js
- Secure session cookies
- Protected API routes
- Environment variables for secrets
- Update dependencies regularly for security patches

## Learning Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [NextAuth.js Documentation](https://next-auth.js.org)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
