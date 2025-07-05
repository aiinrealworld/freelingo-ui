# FreeLingo - AI-Powered Language Learning App

A modern, responsive React.js web application for language learning with AI-powered conversations. Built with TailwindCSS and shadcn/ui components.

## Features

### 🎯 Core Functionality
- **Google Authentication** - Secure login with Firebase
- **Interactive Dashboard** - Clean overview with progress tracking
- **Vocabulary Learning** - Interactive word cards with examples
- **AI Dialogue System** - Conversational practice with voice input
- **Word Management** - Add, edit, and organize your vocabulary

### 🎨 Design & UX
- **Duolingo-inspired** clean and modern interface
- **Fully responsive** - Works on desktop, tablet, and mobile
- **Smooth animations** and transitions
- **Accessible** design with proper contrast and navigation

### 📱 Pages
1. **Login Page** - Google sign-in with friendly design
2. **Dashboard** - Welcome message, navigation, and stats
3. **New Words** - Interactive vocabulary cards with progress
4. **Dialogue** - AI conversation with voice/text input
5. **Add/Edit Words** - Vocabulary management system

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: TailwindCSS + shadcn/ui
- **Routing**: React Router DOM
- **Authentication**: Firebase (mock implementation)
- **Build Tool**: Vite
- **Icons**: Lucide React

## Getting Started

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd freelingo-ui
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

## Project Structure

```
src/
├── components/
│   └── ui/                 # shadcn/ui components
│       ├── button.tsx
│       ├── card.tsx
│       ├── input.tsx
│       └── progress.tsx
├── contexts/
│   └── AuthContext.tsx     # Authentication state management
├── pages/
│   ├── LoginPage.tsx       # Google sign-in page
│   ├── Dashboard.tsx       # Main dashboard
│   ├── NewWordsPage.tsx    # Vocabulary learning
│   ├── DialoguePage.tsx    # AI conversation
│   └── AddEditWordsPage.tsx # Word management
├── lib/
│   └── utils.ts           # Utility functions
├── App.tsx                # Main app component
├── main.tsx              # Entry point
└── index.css             # Global styles
```

## Features in Detail

### 🔐 Authentication
- Mock Google authentication (ready for Firebase integration)
- Persistent session management
- Protected routes

### 📚 New Words Page
- Interactive vocabulary cards
- Progress tracking with visual indicators
- "Mark as Learned" functionality
- Completion celebration

### 💬 Dialogue Page
- Real-time chat interface
- Voice input simulation
- Progress bar for session tracking
- Responsive message bubbles
- Loading states and animations

### ✏️ Word Management
- Add new vocabulary with examples
- Edit existing words
- Delete words with confirmation
- Form validation

## Customization

### Styling
The app uses TailwindCSS with custom CSS variables for theming. Colors and styling can be modified in:
- `tailwind.config.js` - Tailwind configuration
- `src/index.css` - CSS variables and global styles

### Components
All UI components are built with shadcn/ui and can be customized in the `src/components/ui/` directory.

## Future Enhancements

- [ ] Real Firebase integration
- [ ] Voice-to-text API integration
- [ ] Multiple language support
- [ ] Spaced repetition algorithm
- [ ] Progress analytics
- [ ] Offline support
- [ ] Social features

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

---

Built with ❤️ using React, TailwindCSS, and shadcn/ui 