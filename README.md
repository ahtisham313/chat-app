# Chat Application : https://chat-app-xi-gray.vercel.app/

A modern, full-featured chat application built with Next.js, TypeScript, and Firebase. This application includes real-time messaging, audio/video calling simulation, interactive dashboard, and user authentication.

## Features

### 1. Dashboard Page 
(The dashboard data is fetched from the JSONPlaceholder API, which may not work reliably in Pakistan. If the data does not load, please use a VPN to fetch the dashboard data properly.)
- **Interactive Data Display**: View recent messages, call logs, and user statistics in card and table layouts
- **Filtering**: Filter records by categories (active users, call status, user status)
- **Pagination**: Handle large datasets with 10 items per page
- **Hover Effects & Tooltips**: Enhanced user interaction with informative tooltips
- **Actionable Items**: Click to view detailed pages for messages, calls, and users
- **Dynamic Loading**: Optimized performance with lazy loading and loading states
- **External API Integration**: Fetches data from JSONPlaceholder API

### 2. Real-Time Chat Feature
- **Real-Time Messaging**: Send and receive messages using Firebase Realtime Database
- **Chat Interface**: Modern WhatsApp-style chat interface with conversation sidebar
- **Message Display**: 
  - Timestamps for each message
  - User avatars and names
  - Message bubbles with proper alignment
- **Auto-Scroll**: New messages automatically scroll to bottom
- **Dark/Light Mode**: Toggle theme for the chat interface
- **Responsive Design**: Mobile-first design with separate views for mobile and desktop

### 3. Audio/Video Calling Simulation
- **Call Controls**:
  - Start audio or video call
  - Mute/Unmute microphone
  - Toggle video on/off
  - End call button
- **Call Timer**: Real-time timer that starts when call is connected
- **Call Status**: Dynamic status transitions (Ringing → Connected → Ended)
- **Visual Simulation**: Realistic call interface with static images for video calls
- **Call Overlay**: Full-screen overlay during active calls

### 4. User Authentication
- **Firebase Authentication**: Secure user authentication system
- **Features**:
  - User sign up with email and password
  - User login
  - User logout
  - Profile display (name, email, profile picture)
- **Protected Routes**: Authentication-required pages with automatic redirect
- **Session Persistence**: User session maintained across page reloads

### 5. State Management
- **React Context API**: Global state management for:
  - User authentication status
  - Active chat messages and user details
  - Active call details and status
- **State Persistence**: Authentication state persisted using Firebase Auth

### 6. Responsive Design
- **Mobile-First**: Fully responsive design using Tailwind CSS
- **Breakpoints**: Optimized for mobile, tablet, and desktop
- **Adaptive Layout**: Sidebar and chat area adapt based on screen size
- **Touch-Friendly**: Mobile-optimized interactions

### 7. Performance Optimization
- **Next.js Image Component**: Optimized image loading
- **Dynamic Imports**: Lazy loading for heavy components
- **React Suspense**: Loading states for better UX
- **Code Splitting**: Automatic code splitting by Next.js
- **Memoization**: Optimized re-renders with useMemo and useCallback

## Tech Stack

- **Framework**: Next.js 16.1.1 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **UI Components**:  shadcn/ui
- **Authentication**: Firebase Authentication
- **Database**: Firebase Realtime Database
- **API**: JSONPlaceholder (for dashboard data)
- **State Management**: React Context API
- **Icons**: Lucide React
- **Theme**: next-themes (dark/light mode)

## Project Structure

```
chat-app/
├── app/
│   ├── (routes)/
│   │   ├── dashboard/          # Dashboard page with data tables
│   │   ├── chat/               # Real-time chat interface
│   │   ├── call/               # Call room detail pages
│   │   ├── user/               # User detail pages
│   │   └── login/              # Authentication page
│   ├── layout.tsx              # Root layout
│   └── page.tsx                # Home page (redirects to dashboard)
├── src/
│   ├── components/
│   │   ├── auth/               # Authentication components
│   │   ├── call/               # Call interface components
│   │   ├── chat/               # Chat interface components
│   │   ├── dashboard/          # Dashboard components
│   │   ├── layout/             # Layout components (Navbar)
│   │   └── providers/          # Context providers
│   ├── context/
│   │   ├── AuthContext.tsx     # Authentication state
│   │   └── CallContext.tsx     # Call state management
│   ├── lib/
│   │   ├── api.ts              # JSONPlaceholder API integration
│   │   ├── chat-service.ts     # Firebase chat service
│   │   ├── users-service.ts    # User management service
│   │   ├── firebase/
│   │   │   └── config.ts       # Firebase configuration
│   │   └── utils.ts            # Utility functions
│   ├── types/                  # TypeScript type definitions
│   └── data/                   # Static mock data
├── components/
│   └── ui/                     # shadcn/ui components
└── public/                     # Static assets
```

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Firebase project with:
  - Authentication enabled
  - Realtime Database enabled

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd chat-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
   NEXT_PUBLIC_FIREBASE_DATABASE_URL=your_database_url
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
npm run build
npm start
```

## Usage

### Authentication

1. Navigate to `/login`
2. Sign up with email and password (or sign in if you have an account)
3. You'll be redirected to the dashboard after successful authentication

### Dashboard

- View statistics cards showing total messages, calls, active users, and call duration
- Switch between tabs: Messages, Calls, Users
- Filter data by status (for calls and users)
- Navigate to detail pages by clicking the eye icon
- Paginate through large datasets

### Chat

1. Navigate to `/chat`
2. Select a conversation from the sidebar
3. Send and receive messages in real-time
4. Toggle dark/light mode using the theme button
5. Start audio or video calls from the chat header

### Calling

1. Start a call from the chat interface
2. Call status will transition: Ringing → Connected → Ended
3. Use controls to:
   - Mute/unmute microphone
   - Toggle video on/off (for video calls)
   - End the call
4. View call timer during connected calls

## API Integration

The dashboard fetches data from **JSONPlaceholder API**:
- Messages: Mapped from `/comments` endpoint
- Call Logs: Mapped from `/todos` endpoint
- User Stats: Mapped from `/users` and `/posts` endpoints

Data is personalized based on the logged-in user's ID.

## Firebase Configuration

### Realtime Database Rules

Set up your Firebase Realtime Database with appropriate security rules:

```json
{
  "rules": {
    "messages": {
      ".read": "auth != null",
      ".write": "auth != null"
    },
    "users": {
      ".read": "auth != null",
      ".write": "auth != null"
    }
  }
}
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import your repository in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

The application is optimized for Vercel deployment with Next.js.

## Features Implementation Details

### Real-Time Chat
- Uses Firebase Realtime Database listeners for real-time message updates
- Automatic message synchronization across devices
- Last message preview in conversation sidebar
- Room-based messaging system

### Call Simulation
- React state management for call status
- Timer implementation using setInterval
- Visual feedback for call states
- Simulated video with static images

### Dashboard Data
- Client-side data fetching from JSONPlaceholder
- Error handling and timeout management
- Loading states and error boundaries
- URL-based pagination and filtering

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

This project is private and proprietary.

## Author

Built as a full-stack chat application demonstration project.
