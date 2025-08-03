# Tetris Neo 🎮

A modern, responsive Tetris game built with vanilla HTML5, CSS3, and JavaScript. Features a sleek neon aesthetic with retro sound effects and smooth 60fps gameplay.

## 🎯 Play Now

**[🚀 Play Tetris Neo](http://petcareconnect.me/web-tetris/)**

*Replace the link above with your actual deployment URL*

## ✨ Features

### 🎮 Complete Tetris Gameplay
- **Classic Tetris Mechanics**: All 7 standard Tetriminos (I, O, T, S, Z, J, L)
- **Line Clearing**: Clear 1-4 lines simultaneously with satisfying animations
- **Progressive Difficulty**: Speed increases as you advance through levels
- **Next Piece Preview**: See upcoming piece (desktop only)
- **Hard Drop**: Instantly drop pieces to the bottom (Space key)
- **Soft Drop**: Manually drop pieces faster (Down arrow)

### 📱 Cross-Platform Support
- **Desktop Controls**: Arrow keys for movement, Space for hard drop
- **Mobile Touch Controls**: Intuitive swipe gestures and tap-to-rotate
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Adaptive UI**: Interface adjusts automatically based on screen size
- **Mobile-First Design**: Streamlined interface for mobile gameplay

### 🎵 Audio Experience
- **Retro Sound Effects**: Synthesized classic Tetris sounds
- **Web Audio API**: High-quality audio synthesis
- **Audio Controls**: Available on desktop (hidden on mobile for cleaner UI)

### 🎨 Modern Visual Design
- **Neon Aesthetic**: Cyberpunk-inspired color scheme with glowing effects
- **Smooth Animations**: 60fps gameplay with fluid piece movement
- **Dynamic Background**: Animated grid pattern for visual depth
- **Retro Typography**: Classic pixel fonts for authentic feel

## 🎯 Controls

### Desktop (Keyboard)
- **←/→ Arrow Keys**: Move piece left/right
- **↑ Arrow Key**: Rotate piece clockwise
- **↓ Arrow Key**: Soft drop (faster fall)
- **Space Bar**: Hard drop (instant drop)
- **P**: Pause/Resume game

### Mobile (Touch)
- **Tap**: Rotate piece
- **Swipe Left/Right**: Move piece horizontally
- **Swipe Down**: Soft drop
- **Swipe Up**: Hard drop

## 🛠️ Technical Implementation

### Technologies Used
- **HTML5 Canvas**: Game rendering and graphics
- **CSS3**: Responsive design with Flexbox and CSS Grid
- **Vanilla JavaScript**: Game logic and mechanics
- **Web Audio API**: Real-time audio synthesis
- **CSS Custom Properties**: Theme system for easy customization

### Key Features
- **7-Bag Randomizer**: Ensures fair piece distribution
- **Wall Kick System**: Smart piece rotation near boundaries
- **Dynamic Canvas Resizing**: Adapts to different screen sizes
- **Touch Event Handling**: Advanced gesture recognition for mobile
- **Progressive Difficulty**: Algorithm-based speed scaling

## 📊 Game Interface

### Desktop Features
- **Score & Statistics**: Complete game stats display
- **Next Piece Preview**: Shows upcoming Tetrimino
- **Audio Controls**: Volume slider and mute toggle
- **Game Timer**: Real-time play duration tracking

### Mobile Features
- **Streamlined UI**: Clean, minimal interface optimized for mobile
- **Essential Stats Only**: Score and time display
- **Touch-Optimized**: Large, accessible touch targets
- **Game Over Popup**: Modal with final stats and restart option
- **No Distractions**: Removed tooltips and unnecessary UI elements

## 📊 Game Mechanics

### Scoring System
- **Single Line**: 100 × Level
- **Double Lines**: 300 × Level  
- **Triple Lines**: 500 × Level
- **Tetris (4 Lines)**: 800 × Level

### Level Progression
- **Level Up**: Every 10 lines cleared
- **Speed Increase**: Drop interval decreases by 50ms per level
- **Minimum Speed**: Capped at 50ms for maximum challenge

## 🚀 Getting Started

### Option 1: Play Online
Click the **[Play Now](#-play-now)** link above to play instantly in your browser.

### Option 2: Run Locally
1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/web-tetris.git
   cd web-tetris
   ```

2. **Start a local server**:
   ```bash
   # Using Python 3
   python -m http.server 8000
   
   # Using Node.js
   npx serve .
   
   # Using PHP
   php -S localhost:8000
   ```

3. **Open in browser**: Visit `http://localhost:8000`

## 📁 Project Structure

```
web-tetris/
├── index.html          # Main HTML structure
├── style.css           # Responsive CSS styling
├── script.js           # Game logic and mechanics
└── README.md           # Project documentation
```

## 🎮 Game Architecture

### Core Components
- **Game Loop**: RequestAnimationFrame-based rendering
- **Collision Detection**: Real-time boundary and piece checking
- **Piece Rotation**: Matrix transformation with wall kicks
- **Line Clearing**: Row detection and removal algorithms
- **Audio System**: Web Audio API with synthetic sounds

### Mobile Optimization
- **Touch Gestures**: Advanced swipe detection
- **Responsive Canvas**: Dynamic sizing for mobile viewports
- **Performance**: Optimized for 60fps on mobile devices
- **UI Adaptation**: Touch-friendly controls and layouts
- **Streamlined Interface**: Clean mobile UI with essential game info only
- **Device Detection**: Automatic control scheme based on device type

## 🌟 Browser Compatibility

### Fully Supported
- **Chrome/Edge**: 90+
- **Firefox**: 85+
- **Safari**: 14+
- **Mobile Chrome**: 90+
- **Mobile Safari**: 14+

### Required Features
- HTML5 Canvas support
- ES6+ JavaScript features
- CSS Flexbox and Grid
- Web Audio API (for sound)
- Touch Events API (for mobile)

## 🤝 Contributing

Contributions are welcome! Here are some ways you can help:

1. **Bug Reports**: Found a bug? Open an issue with details
2. **Feature Requests**: Have an idea? Suggest new features
3. **Code Improvements**: Submit pull requests for enhancements
4. **Documentation**: Help improve the README or add comments

### Development Setup
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and test thoroughly
4. Commit with clear messages: `git commit -m 'Add amazing feature'`
5. Push to your branch: `git push origin feature/amazing-feature`
6. Submit a pull request

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- **Classic Tetris**: Inspired by Alexey Pajitnov's original 1984 game
- **Modern Web Standards**: Built with current best practices
- **Community**: Thanks to all contributors and players

---

## 🔗 Quick Links

- **[Play Game](https://your-username.github.io/web-tetris)** - Start playing now
- **[Report Bug](https://github.com/your-username/web-tetris/issues)** - Found an issue?
- **[Request Feature](https://github.com/your-username/web-tetris/issues)** - Have an idea?
- **[View Source](https://github.com/your-username/web-tetris)** - Check out the code

Made with ❤️ and JavaScript | © 2025

---

*Enjoy playing Tetris Neo! If you like this project, please ⭐ star it on GitHub.*
