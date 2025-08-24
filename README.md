# 🐠 Fish Tapper - ELSA IoT Platform

**Smart Aquaculture Gaming Experience**

A modern, water-themed React game developed for the ELSA IoT Platform. Experience progressive difficulty gameplay where fish speed increases from slow to fast, featuring beautiful water animations and aquaculture-inspired design. Built with cutting-edge web technologies and backed by Supabase for real-time leaderboards.

## 🎮 Game Features

- **Progressive Difficulty** - Fish speed increases gradually from slow to fast
- **30-second gameplay** - Challenging time-limited rounds
- **Smart Aquaculture Theme** - Beautiful blue water design with realistic fish animations
- **Dynamic water effects** - Animated waves, bubbles, and light rays
- **Real-time scoring** - Each successful tap earns 1 point with splash effects
- **Public leaderboard** - Top 10 scores with ELSA IoT community rankings
- **Responsive design** - Optimized for desktop, tablet, and mobile devices
- **Modern UI/UX** - User-centered design with smooth animations and water physics

## 🛠️ Tech Stack

- **Frontend**: React 18 + Vite
- **Database**: Supabase (PostgreSQL)
- **Styling**: Custom CSS with water-themed gradients and animations
- **Security**: Row Level Security (RLS) policies
- **Platform**: ELSA IoT Integration Ready
- **Deployment**: Static site compatible

## 📋 Prerequisites

- Node.js 16+ and npm/yarn
- Supabase account (free tier works)
- Modern web browser

## 🚀 Quick Start

### 1. Clone and Install

```bash
# Clone the repository (or copy files)
cd fish-tapper
npm install
```

### 2. Set Up Supabase

1. Create a new project at [https://app.supabase.com](https://app.supabase.com)
2. Once created, go to **SQL Editor** in your project
3. Copy and paste the entire contents of `supabase-setup.sql`
4. Run the SQL script to create the table and policies

### 3. Configure Environment

1. In Supabase, go to **Settings > API**
2. Copy your **Project URL** and **anon public** key
3. Create a `.env` file in the project root:

```bash
cp .env.example .env
```

4. Edit `.env` and replace the placeholders:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key-here
```

### 4. Run Development Server

```bash
npm run dev
```

The game will open automatically at [http://localhost:3000](http://localhost:3000)

## 📦 Production Build

```bash
npm run build
```

This creates an optimized build in the `dist` directory.

### Preview Production Build

```bash
npm run preview
```

## 🌐 Deployment

The built app is a static site that can be deployed to:

### Vercel
```bash
npx vercel --prod
```

### Netlify
```bash
# Drag and drop the dist folder to Netlify
# Or use CLI:
npx netlify deploy --prod --dir=dist
```

### GitHub Pages
```bash
# Add to package.json scripts:
"deploy": "vite build && gh-pages -d dist"

# Then run:
npm run deploy
```

### Static Hosting
Upload the contents of `dist` folder to any static hosting service (AWS S3, Firebase Hosting, etc.)

## 🔒 Security Notes

- **Never commit `.env` files** - They contain sensitive keys
- **Use only anon keys** - Never expose service keys in frontend
- **RLS is enabled** - Database access is restricted by policies
- **Input validation** - Names are sanitized and length-limited
- **Score validation** - Only non-negative scores are accepted

## 🎯 Game Rules

1. Enter your name (1-24 characters)
2. Click "Start Game" to begin
3. Click/tap fish as they swim in the water
4. Fish start slow and gradually speed up
5. Each successful hit scores 1 point with splash effects
6. Game ends after 30 seconds
7. Your score is automatically saved to the ELSA IoT leaderboard
8. Compete with the community for the top spot!

## 🐛 Troubleshooting

### Supabase Connection Issues

**Problem**: "Database not configured" message
- **Solution**: Check `.env` file has correct Supabase URL and key

**Problem**: Scores not saving
- **Solution**: Verify RLS policies are created correctly in Supabase

### Build Issues

**Problem**: Build fails with module errors
- **Solution**: Delete `node_modules` and run `npm install` again

### Game Performance

**Problem**: Low FPS or laggy gameplay
- **Solution**: Close other browser tabs, use Chrome/Firefox for best performance

## 📊 Database Schema

```sql
public.scores
├── id (uuid, primary key)
├── name (text, 1-24 chars)
├── score (integer, >= 0)
└── created_at (timestamptz)
```

## 🔧 Configuration Options

Edit these constants in `src/components/GameCanvas.jsx` for difficulty tuning:

```javascript
const GAME_DURATION = 30;                    // Game length in seconds
const FISH_RADIUS = 35;                      // Fish size in pixels
const INITIAL_FISH_MIN_LIFETIME = 1500;      // Starting fish visibility (ms)
const INITIAL_FISH_MAX_LIFETIME = 2000;      // Starting max visibility
const FINAL_FISH_MIN_LIFETIME = 600;         // Ending fish visibility (faster)
const FINAL_FISH_MAX_LIFETIME = 900;         // Ending max visibility
const INITIAL_SPAWN_DELAY = 800;             // Starting spawn delay
const FINAL_SPAWN_DELAY = 200;               // Ending spawn delay (faster)
```

## ✅ Success Criteria Checklist

- [ ] Game runs for exactly 30 seconds
- [ ] Fish spawn at random positions
- [ ] Each fish appears for ~1 second
- [ ] Clicking fish increases score by 1
- [ ] Score is saved to Supabase on game end
- [ ] Leaderboard shows top 10 scores
- [ ] Scores are sorted by score (desc), then time (desc)
- [ ] Name validation works (1-24 characters)
- [ ] RLS policies prevent unauthorized access
- [ ] Game is responsive on mobile devices
- [ ] No console errors in production
- [ ] Loading states display correctly
- [ ] Error messages are user-friendly

## 📝 Common Pitfalls & Fixes

### Pitfall 1: CORS Errors
**Fix**: Ensure you're using the anon key, not the service key

### Pitfall 2: Leaderboard Not Updating
**Fix**: Check browser console for errors, verify Supabase connection

### Pitfall 3: Fish Not Appearing
**Fix**: Check canvas element is rendering, no CSS conflicts

### Pitfall 4: Score Not Incrementing
**Fix**: Ensure click events are properly registered on canvas

## 🤝 Contributing

Feel free to fork and submit pull requests for:
- Bug fixes
- Performance improvements
- New features
- Better fish graphics!

## 📄 License

MIT License - feel free to use for learning and development!

## 🎉 Credits

Developed for **ELSA IoT Platform** - Smart Aquaculture Solutions

Built with React, Vite, and Supabase to showcase modern web technologies in aquaculture gaming.

---

**ELSA IoT - Empowering Smart Aquaculture** 🐠💧

**Happy Fishing!**
