# 🐾 LinguaZoo

An interactive educational game to guess animal names in two languages: **Indonesian ↔ English**

---

## 🎯 Purpose

LinguaZoo is designed to:

- Make learning animal vocabulary fun and engaging
- Help children practice both Indonesian and English simultaneously
- Provide an interactive and educational gaming experience

---

## 🚀 Key Features

- 🔒 Screen orientation locked to **portrait** for better gameplay
- 🐾 Manage animal list with CRUD (Create, Read, Update, Delete)
- 🌐 Automatic translation from Indonesian → English
- 🔄 Toggle between Indonesian and English
- 🎮 Game logic: clues, letter guessing, win/lose conditions

---

## 📂 Project Structure

- **components/**
  - `WordBox.js` → Displays word boxes for guessed letters
  - `Keyboard.js` → Virtual keyboard A–Z
  - `AnimalList.js` → Manage animal list (CRUD)
  - `GameBoard.js` → Main game board UI
- **hooks/**
  - `useGameLogic.js` → Custom hook for game state & logic
- **utils/**
  - `translate.js` → Helper function for translation
- **App.js** → Application entry point

---

## 🛠️ Installation

```bash
# 1. Clone the repository
git clone https://github.com/username/LinguaZoo.git
cd LinguaZoo

# 2. Install dependencies
npm install

# 3. Start the project with Expo
npx expo start
```

## 📱 How to Run

# Install Expo Go on your mobile device (Android/iOS)

# Run the project

npx expo start

# Scan the QR code with Expo Go

# The game will launch directly on your device
