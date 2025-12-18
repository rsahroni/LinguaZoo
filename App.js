import React, { useCallback, useEffect, useState } from 'react';
import { View, StyleSheet, Alert, Platform, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ScreenOrientation from 'expo-screen-orientation';

import GameBoard from './components/GameBoard';
import AnimalList from './components/AnimalList';
import ManagementHeader from './components/ManagementHeader';
import HostPanel from './components/HostPanel';
import useGameLogic from './hooks/useGameLogic';
import AboutPage from './components/AboutPage';
import { translateToEnglish } from './utils/translate';
import { ANIMAL_SEED_DATA } from './data/seedData';
import { isLikelyAnimal } from './utils/validation';
import appConfig from './app.json';
import { toProperCase } from './utils/formatters';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [language, setLanguage] = useState('IND'); // 'IND' | 'ENG'
  const [animals, setAnimals] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [isManaging, setIsManaging] = useState(false); // State for management UI
  const [isAddingAnimal, setIsAddingAnimal] = useState(false); // Loading state for validation
  const [lastRandomAnimal, setLastRandomAnimal] = useState(null); // Track the last picked animal
  const [isAppReady, setIsAppReady] = useState(false);
  const [isAboutVisible, setIsAboutVisible] = useState(false);

  const [fontsLoaded] = useFonts({
    'PlaypenSans-Regular': require('./assets/fonts/PlaypenSans-Regular.ttf'),
    'PlaypenSans-Bold': require('./assets/fonts/PlaypenSans-Bold.ttf'),
  });

  const {
    word,
    clue,
    setWord,
    setClue,
    correctLetters,
    wrongLetters,
    gameStarted,
    setGameStarted,
    handleGuess,
    resetGame,
  } = useGameLogic();

  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);
    async function prepare() {
      try {
        // Load animals from storage
        const saved = await AsyncStorage.getItem('linguazoo_animals');
        const savedAnimals = saved ? JSON.parse(saved) : [];
        if (savedAnimals.length > 0) {
          setAnimals(savedAnimals);
        } else {
          // Use the larger seed data list
          setAnimals(ANIMAL_SEED_DATA);
          await AsyncStorage.setItem('linguazoo_animals', JSON.stringify(ANIMAL_SEED_DATA));
        }

        // Artificially delay for 2 seconds to show the splash screen longer
        await new Promise(resolve => setTimeout(resolve, 2000));

      } catch (e) {
        console.warn(e);
      } finally {
        // Tell the application to render
        setIsAppReady(true);
      }
    }

    prepare();
  }, []);

  const persistAnimals = async (list) => {
    setAnimals(list);
    await AsyncStorage.setItem('linguazoo_animals', JSON.stringify(list));
  };

  const addAnimal = useCallback(async (animalName, options = {}) => { // Returns a boolean
    setIsAddingAnimal(true);
    const { showDuplicateAlert = true, showConfirmationPrompt = true } = options; // Add new option

    const name = animalName.trim().toUpperCase();
    if (!name) return;

    const exists = animals.some(a => a.IND === name);
    if (exists) {
      if (showDuplicateAlert) {
        Alert.alert('Sudah Ada!', 'Hore! Hewan ini sudah ada di kebun binatang kita.');
      }
      setIsAddingAnimal(false);
      return false; // Failed because it's a duplicate
    }

    // Validate if this is a valid animal name
    const { isValid, englishName, errorType } = await isLikelyAnimal(name);
    setIsAddingAnimal(false); // Set loading to false after validation attempt

    if (errorType === 'network') {
      Alert.alert('Koneksi Internet Diperlukan', 'Untuk menambahkan hewan baru, pastikan perangkatmu terhubung ke internet ya!');
      return false;
    }
    if (!isValid && showDuplicateAlert) { // Only show alert on manual add, and if not a network error
      Alert.alert('Hmm...', `Sepertinya "${name}" bukan nama hewan, deh. Coba periksa lagi, yuk!`);
      return false; // Failed because it's not a valid animal
    }
    if (!isValid && !showDuplicateAlert && errorType === 'word_not_found') {
      // This case is for handleStartGame where showDuplicateAlert is false,
      // and we want to show the "not an animal" alert if it's not a network error.
      Alert.alert('Hmm...', `Sepertinya "${name}" bukan nama hewan, deh. Coba periksa lagi, yuk!`);
      return false;
    }

    // If confirmation is skipped, add the animal directly
    if (!showConfirmationPrompt) {
      const name_eng = englishName ? englishName.toUpperCase() : (await translateToEnglish(name)).toUpperCase();
      const updated = [...animals, { IND: name, ENG: name_eng }];
      await persistAnimals(updated);
      setIsAddingAnimal(false);
      return true; // Success: animal added directly
    }

    // If valid, show a confirmation prompt before adding
    return new Promise(async (resolve) => {
      const name_eng_for_alert = englishName ? englishName.toUpperCase() : (await translateToEnglish(name)).toUpperCase();
      Alert.alert(
        "Tambahkan Hewan Ini?",
        `Hore! Sepertinya "${toProperCase(name)}" atau dalam Bahasa Inggris "${toProperCase(name_eng_for_alert)}" adalah hewan sungguhan. Yakin mau menambahkannya?`,
        [
          {
            text: "Jangan, deh",
            onPress: () => resolve(false), // Failed: cancelled by user
            style: "cancel",
          },
          {
            text: "Ya, Tambahkan!",
            onPress: async () => { // Use name_eng_for_alert here
              const updated = [...animals, { IND: name, ENG: name_eng_for_alert }];
              await persistAnimals(updated);
              resolve(true); // Success: animal added
            },
          },
        ]
      );
    });
  }, [animals]); // This function only changes if the `animals` list changes

  const resetAnimals = () => {
    Alert.alert(
      "Mulai dari Awal?",
      "Kamu yakin mau mengosongkan kebun binatang dan mulai dari awal? Hewan-hewan yang sudah kamu tambah akan pergi, lho.",
      [
        {
          text: "Batal",
          style: "cancel",
        },
        {
          text: "Reset",
          onPress: () => persistAnimals(ANIMAL_SEED_DATA),
          style: "destructive",
        },
      ]
    );
  };

  const deleteAnimal = (item) => {
    Alert.alert(
      "Dadah, Hewan!",
      `Kamu yakin mau bilang dadah ke "${item.IND}"? Dia akan keluar dari kebun binatang, lho.`,
      [
        {
          text: "Batal",
          style: "cancel",
        },
        {
          text: "Hapus",
          onPress: () => persistAnimals(animals.filter(a => a.IND !== item.IND)),
          style: "destructive",
        },
      ]
    );
  };

  const pickRandomAnimal = () => {
    if (animals.length === 0) {
      Alert.alert('Oh, Kosong!', 'Ups, kebun binatangnya masih kosong. Tambah hewan dulu, yuk!');
      return;
    }

    // If there's only one animal, just pick it.
    if (animals.length === 1) {
      const chosen = animals[0];
      setWord(chosen[language.toUpperCase()]);
      setClue('');
      setLastRandomAnimal(chosen);
      return;
    }

    let chosen;
    do {
      const idx = Math.floor(Math.random() * animals.length);
      chosen = animals[idx];
    } while (lastRandomAnimal && chosen.IND === lastRandomAnimal.IND); // Ensure it's not the same as the last one

    setLastRandomAnimal(chosen); // Update the last picked animal
    setWord(chosen[language.toUpperCase()]);
    setClue('');
  };

  const toggleLanguage = () => {
    setLanguage(prev => (prev === 'IND' ? 'ENG' : 'IND'));
  };

  const exitAndResetGame = () => {
    setGameStarted(false);
    resetGame(); // Resets correct/wrong letters from the hook
    setWord('');   // Clears the manual word input
    setClue('');   // Clears the manual clue input
    setSuggestions([]); // Clears the suggestions list
  };

  const handleWordInputBlur = () => {
    // Add a short delay to allow suggestion item press to register
    // before the suggestion list is cleared.
    setTimeout(() => {
      setSuggestions([]);
    }, 1000);
  };

  // Handle word input change for suggestions
  const handleWordInputChange = (text) => {
    const upperText = text.toUpperCase();
    setWord(upperText);

    if (upperText.length > 1) {
      const filtered = animals
        .filter((animal) => animal.IND.startsWith(upperText))
        .slice(0, 5); // Show max 5 suggestions
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  };

  const handleStartGame = async () => {
    if (!word || !clue) {
      Alert.alert('Tunggu Dulu!', 'Jangan lupa isi nama hewan dan petunjuknya ya, atau pilih hewan acak!');
      return;
    }

    const trimmedWord = word.trim().toUpperCase();
    const isExisting = animals.some(a => a.IND === trimmedWord);

    if (isExisting) {
      // Animal already exists
      Alert.alert(
        "Siap Main?",
        `Asyik! Kita akan main tebak-tebakan dengan "${trimmedWord}". Sudah siap?`,
        [
          { text: "Ganti hewan", style: "cancel" },
          { text: "Mulai!", onPress: () => setGameStarted(true) },
        ]
      );
      return;
    }

    // New animal, perform validation first
    setIsAddingAnimal(true);
    const { isValid, englishName, errorType } = await isLikelyAnimal(trimmedWord);
    setIsAddingAnimal(false);

    if (errorType === 'network') {
      Alert.alert('Koneksi Internet Diperlukan', 'Untuk memulai permainan dengan hewan baru, pastikan perangkatmu terhubung ke internet ya!');
      return;
    }

    if (!isValid) { // If not valid (and not a network error, handled above)
      Alert.alert('Hmm...', `Sepertinya "${trimmedWord}" bukan nama hewan, deh. Coba periksa lagi, yuk!`);
      return;
    }
    // If valid, then show the confirmation prompt
    Alert.alert(
      "Hewan Baru!",
      `Wow, "${trimmedWord}" atau dalam Bahasa Inggris "${englishName.toUpperCase()}" akan jadi penghuni baru! Kamu mau pakai hewan ini untuk main?`,
      [
        { text: "Pilih lagi", style: "cancel" },
        {
          text: "Ya, pakai ini!",
          onPress: async () => {
            // Call addAnimal without re-validation, as it's already been validated
            const success = await addAnimal(word, { showDuplicateAlert: false, showConfirmationPrompt: false });
            if (success) {
              setGameStarted(true);
            }
          },
        },
      ]
    );
  };

  const handleSuggestionPress = (selectedWord) => {
    setWord(selectedWord);
    setSuggestions([]);
  };

  const onLayoutRootView = useCallback(async () => {
    if (isAppReady && fontsLoaded) {
      // This tells the splash screen to hide immediately! If we call this after
      // `setIsAppReady`, then we may see a blank screen while the app is
      // loading its initial state and rendering its first pixels. So instead,
      // we hide the splash screen once we know the root view has already
      // performed layout.
      await SplashScreen.hideAsync();
    }
  }, [isAppReady, fontsLoaded]);

  if (!isAppReady || !fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar hidden />
      <View style={styles.container} onLayout={onLayoutRootView}>
        {gameStarted ? (
          <GameBoard
            clue={clue}
            word={word}
            correctLetters={correctLetters}
            wrongLetters={wrongLetters}
            handleGuess={handleGuess}
            onExit={exitAndResetGame}
          />
        ) : (
          // Main Host Panel UI
          <HostPanel
            word={word}
            clue={clue}
            suggestions={suggestions}
            language={language}
            onWordChange={handleWordInputChange}
            onWordInputBlur={handleWordInputBlur}
            onClueChange={setClue}
            onSuggestionPress={handleSuggestionPress}
            onStartGame={handleStartGame}
            onRandomAnimal={pickRandomAnimal}
            isStartingGame={isAddingAnimal}
            onToggleLanguage={toggleLanguage}
            onManageAnimals={() => setIsManaging(true)}
            appVersion={appConfig.expo.version}
            onShowAbout={() => setIsAboutVisible(true)}
          />
        )}
      </View>

      {/* Animal Management Modal */}
      <Modal
        animationType="slide"
        visible={isManaging}
        onRequestClose={() => setIsManaging(false)}
      >
        <AnimalList
          onClose={() => setIsManaging(false)}
          animalList={animals}
          deleteAnimal={deleteAnimal}
          ListHeaderComponent={<ManagementHeader onAddAnimal={addAnimal} isAdding={isAddingAnimal} animalCount={animals.length} onReset={resetAnimals} />}
        />
      </Modal>

      {/* About Page Modal */}
      <AboutPage isVisible={isAboutVisible} onClose={() => setIsAboutVisible(false)} appVersion={appConfig.expo.version} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFF8E7' },
  container: { flex: 1, backgroundColor: '#FFF8E7' },
});
