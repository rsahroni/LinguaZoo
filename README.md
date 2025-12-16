# 🐾 LinguaZoo

<p align="center">
  <img src="https://img.shields.io/badge/version-1.1.0-blue.svg" alt="Version" />
  <img src="https://img.shields.io/badge/React%20Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React Native" />
  <img src="https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white" alt="Expo" />
  <img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License: MIT" />
</p>

A fun and interactive Hangman-style educational game designed for kids to learn animal names in both Indonesian and English.

---

## 🚀 Key Features

- **🎨 Kid-Friendly UI**: Designed with a cheerful font (`Playpen Sans`) and a playful color palette.
- **🗣️ Bilingual Gameplay**: Seamlessly switch between Indonesian and English modes.
- **🦓 Flexible Animal Collection**:
  - Start with a built-in list of 100 animals.
  - Add new animals with smart validation.
  - Delete animals from the collection.
  - Reset the collection to the initial default list.
- **🧠 Smart Input Validation**: Automatically checks if a user-added word is a valid animal name using an external dictionary API.
- **🎲 Intelligent Randomization**: The "Random Animal" feature avoids picking the same animal twice in a row.
- **💡 Autocomplete Suggestions**: A dropdown menu suggests animals as the user types, improving usability.
- **🎮 Classic Hangman Mechanics**: Guess letters to reveal the animal's name based on a clue.
- **📱 Portrait-Only Mode**: Locked in portrait orientation for a consistent and focused gameplay experience.

---

## ️ Tech Stack

- **Framework**: React Native with Expo
- **State Management**: React Hooks (`useState`, `useEffect`, `useCallback`)
- **Navigation**: Conditional rendering for screen transitions
- **Storage**: `@react-native-async-storage/async-storage` for persisting the animal list
- **Fonts**: `expo-font` for loading custom fonts
- **APIs**:
  - `translate` library for language translation.
  - `dictionaryapi.dev` for animal name validation.
- **Release Management**: `standard-version` for automated versioning and changelog generation.

---

## 📂 Project Structure

- **components/**
  - `GameBoard.js` → The main screen during gameplay.
  - `HostPanel.js` → The main control panel before the game starts.
  - `AnimalList.js` → Displays the list of animals in the collection.
  - `ManagementHeader.js` → The header for the animal collection screen.
  - `CustomButton.js` → A reusable, styled button component.
  - `WordBox.js` & `Keyboard.js` → Core game UI elements.
- **hooks/**
  - `useGameLogic.js` → Custom hook containing the core game state and logic.
- **utils/**
  - `translate.js`, `validation.js`, `formatters.js` → Helper functions for various tasks.
- **data/**
  - `seedData.js` → The initial list of 100 animals.
- **assets/**
  - `fonts/` → Contains the `Playpen Sans` font files.
- **App.js** → The main entry point and primary state manager for the application.

---

## ⚙️ Getting Started

### Prerequisites

- Node.js (LTS version recommended)
- Git
- Expo Go app on your mobile device (iOS or Android)

### Installation

```bash
# 1. Clone this repository
git clone https://github.com/rsahroni/LinguaZoo.git
cd LinguaZoo

# 2. Install all the required dependencies
npm install

# 3. Start the development server
npx expo start
```

## 📱 How to Run

```bash
# Install Expo Go on your mobile device (Android/iOS)

# Run the project
npx expo start

# Scan the QR code with Expo Go

# The game will launch directly on your device
```
