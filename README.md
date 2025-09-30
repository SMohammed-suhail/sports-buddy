# sports-buddy
Sports Buddy is a web app that helps users discover, join, and manage sports events nearby. Platform built with React, TypeScript, and Firebase., it enables user registration, event creation, and admin management of sports, cities, and areas. Features include secure login, logging, responsive UI, and Firebase hosting.

Live demo - https://sports-buddys.netlify.app/
 
## ✨ Features

### 🏠 **Landing Page**
- Modern, responsive design with animated backgrounds
- Feature showcase and platform statistics
- Clean navigation with role-based access

### 👥 **User Management**
- **Regular Users**: Browse and join sports events
- **Admin Users**: Post and manage sports events
- Secure Firebase authentication
- Role-based access control

### 🎯 **Event Management**
- **For Admins**: Create, edit, and delete sports events
- **For Users**: Browse, search, and filter events
- Real-time event updates
- Multiple sports categories support

### 🏅 **Team Management**
- Users can join events with team details
- Team information collection (name, members, contact)
- Admin dashboard to view all teams per event
- Contact management for event organizers

## 🚀 Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Firebase (Authentication, Firestore)
- **Icons**: Lucide React
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with custom animations

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/sports-buddy.git
   cd sports-buddy
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Firebase Setup**
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Authentication (Email/Password)
   - Create Firestore database
   - Update `src/config/firebase.ts` with your Firebase config

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   ```
   http://localhost:5173
   ```

## 🔧 Firebase Configuration

Update `src/config/firebase.ts` with your Firebase project credentials:

```typescript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id",
  measurementId: "your-measurement-id"
};
```

## 📊 Database Structure

### Collections:

#### `users`
```typescript
{
  uid: string,
  email: string,
  displayName: string,
  isAdmin: boolean,
  createdAt: string
}
```

#### `sportsEvents`
```typescript
{
  name: string,
  sport: string,
  location: string,
  date: string,
  time: string,
  description: string,
  createdBy: string,
  createdAt: string
}
```

#### `teamJoins`
```typescript
{
  teamName: string,
  totalMembers: number,
  phoneNumber: string,
  eventId: string,
  eventName: string,
  joinedBy: string,
  joinedAt: string
}
```

## 🎮 User Roles & Access

### 👤 **Regular Users**
- ✅ Browse all sports events
- ✅ Search and filter events
- ✅ Join events with team details
- ❌ Cannot create events

### 👑 **Admin Users**
- ✅ Create, edit, delete sports events
- ✅ View all teams that joined events
- ✅ Access team contact information
- ❌ Cannot browse events (focused on management)

## 🛠️ Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build

# Code Quality
npm run lint         # Run ESLint
```

## 🎨 Design Features

- **Responsive Design**: Works on all device sizes
- **Modern UI**: Clean, professional interface
- **Animated Backgrounds**: Subtle animations for visual appeal
- **Role-based Theming**: Different color schemes for user types
- **Accessibility**: Proper contrast ratios and keyboard navigation

## 📱 Supported Sports

- Football
- Basketball
- Tennis
- Soccer
- Baseball
- Volleyball
- Cricket
- Badminton
- Swimming
- Running
- Cycling
- Other (custom)

## 🔐 Security Features

- Firebase Authentication
- Role-based access control
- Input validation and sanitization
- Secure database rules
- Protected routes

## 🚀 Deployment

### Netlify/Vercel
1. Build the project: `npm run build`
2. Deploy the `dist` folder
3. Set up environment variables for Firebase

### Firebase Hosting
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**S Mohammed Suhail**
- GitHub: [@yourusername](https://github.com/yourusername)
- Email: your.email@example.com

## 🙏 Acknowledgments

- [React](https://reactjs.org/) - UI Library
- [Firebase](https://firebase.google.com/) - Backend Services
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Lucide React](https://lucide.dev/) - Icons
- [Vite](https://vitejs.dev/) - Build Tool

## 📸 Screenshots

### Home Page
![Home Page](https://images.pexels.com/photos/3621104/pexels-photo-3621104.jpeg?auto=compress&cs=tinysrgb&w=800)

### Browse Events
![Browse Events](https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg?auto=compress&cs=tinysrgb&w=800)

### Admin Dashboard
![Admin Dashboard](https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg?auto=compress&cs=tinysrgb&w=800)

---

⭐ **Star this repository if you found it helpful!**

🐛 **Found a bug?** [Open an issue](https://github.com/yourusername/sports-buddy/issues)

💡 **Have a feature request?** [Start a discussion](https://github.com/yourusername/sports-buddy/discussions)
