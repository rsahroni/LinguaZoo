import React, { useCallback, useEffect, useState } from 'react';
import { View, StyleSheet, Alert, Platform, Modal, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ScreenOrientation from 'expo-screen-orientation';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';

import GameBoard from './components/GameBoard';
import AnimalList from './components/AnimalList';
import ManagementHeader from './components/ManagementHeader';
import HostPanel from './components/HostPanel';
import CustomButton from './components/CustomButton';
import useGameLogic from './hooks/useGameLogic';
import AboutPage from './components/AboutPage';
import { translateToEnglish } from './utils/translate';
import { ANIMAL_SEED_DATA } from './data/seedData';
import { isLikelyAnimal, isLikelyEnglishAnimal } from './utils/validation';
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
  const [isSinglePlayerModalVisible, setSinglePlayerModalVisible] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [managementSearchTerm, setManagementSearchTerm] = useState('');
  const [isOptionsModalVisible, setOptionsModalVisible] = useState(false);

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

  const addClue = async (animalInd, newClue) => {
    const updatedAnimals = animals.map(a => {
      if (a.IND === animalInd) {
        // Avoid duplicates
        if (a.CLUES && a.CLUES.includes(newClue)) return a;
        return { ...a, CLUES: [...(a.CLUES || []), newClue] };
      }
      return a;
    });
    // Only persist if changed
    if (JSON.stringify(updatedAnimals) !== JSON.stringify(animals)) {
      await persistAnimals(updatedAnimals);
    }
  };

  const deleteClue = async (animalInd, clueToDelete) => {
    const updatedAnimals = animals.map(a => {
      if (a.IND === animalInd && a.CLUES) {
        return { ...a, CLUES: a.CLUES.filter(c => c !== clueToDelete) };
      }
      return a;
    });
    if (JSON.stringify(updatedAnimals) !== JSON.stringify(animals)) {
      await persistAnimals(updatedAnimals);
    }
  };

  const addAnimal = useCallback(async (animalName, initialClue = null, options = {}) => { // Returns a boolean
    setIsAddingAnimal(true);
    const { showDuplicateAlert = true, showConfirmationPrompt = true } = options; // Add new option

    const name = animalName.trim().toUpperCase();
    if (!name) return;

    const exists = animals.some(a => a.IND === name);
    if (exists) {
      // If animal exists and we have a new clue, add it silently to the DB
      if (initialClue) {
        const updatedAnimals = animals.map(a => {
          if (a.IND === name && (!a.CLUES || !a.CLUES.includes(initialClue))) {
            return { ...a, CLUES: [...(a.CLUES || []), initialClue] };
          }
          return a;
        });
        if (JSON.stringify(updatedAnimals) !== JSON.stringify(animals)) {
          await persistAnimals(updatedAnimals);
        }
      }

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
      const updated = [...animals, { IND: name, ENG: name_eng, CLUES: initialClue ? [initialClue] : [] }];
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
              const updated = [...animals, { IND: name, ENG: name_eng_for_alert, CLUES: initialClue ? [initialClue] : [] }];
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

    // 1. Check if exists in the CURRENT language
    const isExisting = animals.some(a => a[language] === trimmedWord);

    if (isExisting) {
      Alert.alert(
        "Siap Main?",
        `Asyik! Kita akan main tebak-tebakan dengan "${trimmedWord}". Sudah siap?`,
        [
          { text: "Ganti hewan", style: "cancel" },
          {
            text: "Mulai!", onPress: async () => {
              // Update the existing animal with the new clue if provided
              if (clue) {
                await addAnimal(trimmedWord, clue, { showDuplicateAlert: false });
              }
              setGameStarted(true);
            }
          },
        ]
      );
      return;
    }

    // 2. Check if exists in the WRONG language (Cross-language check)
    const otherLang = language === 'IND' ? 'ENG' : 'IND';
    const wrongLangEntry = animals.find(a => a[otherLang] === trimmedWord);

    if (wrongLangEntry) {
      const msg = language === 'IND'
        ? `Kamu memilih Bahasa Indonesia, tapi "${trimmedWord}" sepertinya Bahasa Inggris. Coba pakai nama Indonesianya: "${wrongLangEntry.IND}"!`
        : `Kamu memilih Bahasa Inggris, tapi "${trimmedWord}" sepertinya Bahasa Indonesia. Coba pakai nama Inggrisnya: "${wrongLangEntry.ENG}"!`;

      Alert.alert("Bahasa Tidak Sesuai", msg);
      return;
    }

    // 3. New animal validation
    setIsAddingAnimal(true);

    // Run both validations in parallel to check cross-language validity
    const [indCheck, engCheck] = await Promise.all([
      isLikelyAnimal(trimmedWord),
      isLikelyEnglishAnimal(trimmedWord)
    ]);

    setIsAddingAnimal(false);

    if (indCheck.errorType === 'network' || engCheck.errorType === 'network') {
      Alert.alert('Koneksi Internet Diperlukan', 'Untuk memulai permainan dengan hewan baru, pastikan perangkatmu terhubung ke internet ya!');
      return;
    }

    if (language === 'IND') {
      // --- INDONESIAN MODE ---
      if (engCheck.isValid && !indCheck.isValid) {
        Alert.alert("Bahasa Tidak Sesuai", `"${trimmedWord}" sepertinya nama hewan dalam Bahasa Inggris. Yuk pakai Bahasa Indonesia!`);
        return;
      }

      if (!indCheck.isValid) {
        Alert.alert('Hmm...', `Sepertinya "${trimmedWord}" bukan nama hewan, deh. Coba periksa lagi, yuk!`);
        return;
      }

      // Valid Indonesian Animal -> Add to DB logic
      Alert.alert(
        "Hewan Baru!",
        `Wow, "${trimmedWord}" atau dalam Bahasa Inggris "${indCheck.englishName.toUpperCase()}" akan jadi penghuni baru! Kamu mau pakai hewan ini untuk main?`,
        [
          { text: "Pilih lagi", style: "cancel" },
          {
            text: "Ya, pakai ini!",
            onPress: async () => {
              const success = await addAnimal(word, clue, { showDuplicateAlert: false, showConfirmationPrompt: false });
              if (success) {
                setGameStarted(true);
              }
            },
          },
        ]
      );
    } else {
      // --- ENGLISH MODE ---
      if (indCheck.isValid && !engCheck.isValid) {
        Alert.alert("Bahasa Tidak Sesuai", `"${trimmedWord}" terdeteksi sebagai nama hewan dalam Bahasa Indonesia. Mohon gunakan Bahasa Inggris!`);
        return;
      }

      if (!engCheck.isValid) {
        Alert.alert('Hmm...', `"${trimmedWord}" sepertinya bukan nama hewan yang valid dalam Bahasa Inggris.`);
        return;
      }

      // Valid English Animal (New)
      // Currently we don't support saving new animals from English mode (need EN->ID translation).
      // So we allow playing, but warn that it won't be saved.
      Alert.alert(
        "Hewan Baru!",
        `"${trimmedWord}" adalah hewan yang valid! Ayo mainkan. (Catatan: Hewan ini belum akan disimpan ke koleksi).`,
        [
          { text: "Batal", style: "cancel" },
          { text: "Main!", onPress: () => setGameStarted(true) }
        ]
      );
    }
  };

  const startSinglePlayerGame = () => {
    // 1. Pick a random animal
    let chosen;
    do {
      const idx = Math.floor(Math.random() * animals.length);
      chosen = animals[idx];
    } while (animals.length > 1 && lastRandomAnimal && chosen.IND === lastRandomAnimal.IND);

    setLastRandomAnimal(chosen);

    const targetWord = chosen[language];
    const firstLetter = targetWord.charAt(0);

    // 2. Generate Bot Clue
    let botClue;
    // Check if we have stored clues for this animal
    if (chosen.CLUES && chosen.CLUES.length > 0) {
      // Pick a random clue from the database
      const randomIndex = Math.floor(Math.random() * chosen.CLUES.length);
      botClue = chosen.CLUES[randomIndex];
    } else {
      // Fallback if no clues exist
      botClue = language === 'IND'
        ? `Namaku berawalan huruf ${firstLetter}. Coba tebak!`
        : `My name starts with the letter ${firstLetter}. Guess me!`;
    }

    setWord(targetWord);
    setClue(botClue);
    setGameStarted(true);
  };

  const handleSinglePlayerPress = () => {
    if (animals.length === 0) {
      Alert.alert('Oh, Kosong!', 'Ups, kebun binatangnya masih kosong. Tambah hewan dulu, yuk!');
      return;
    }
    setCountdown(5); // Set timer to 5 seconds
    setSinglePlayerModalVisible(true);
  };

  const handleExportDatabase = async () => {
    try {
      const date = new Date();
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const dateString = `${year}${month}${day}`;

      const fileUri = FileSystem.documentDirectory + `linguazoo-animal-db-${dateString}.json`;
      await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(animals, null, 2));

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'application/json',
          dialogTitle: 'Export Database Hewan',
          UTI: 'public.json' // for iOS
        });
      } else {
        Alert.alert("Maaf", "Fitur berbagi tidak tersedia di perangkat ini.");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Gagal mengekspor database.");
    }
  };

  const handleImportDatabase = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/json',
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      const fileUri = result.assets[0].uri;
      const fileContent = await FileSystem.readAsStringAsync(fileUri);

      let parsedData;
      try {
        parsedData = JSON.parse(fileContent);
      } catch (e) {
        Alert.alert("Error", "File tidak valid atau rusak.");
        return;
      }

      if (!Array.isArray(parsedData)) {
        Alert.alert("Error", "Format data salah. Harus berupa list hewan.");
        return;
      }

      Alert.alert(
        "Import Database",
        `Ditemukan ${parsedData.length} hewan dari file. Data saat ini akan diganti total. Yakin?`,
        [
          { text: "Batal", style: "cancel" },
          {
            text: "Ya, Ganti!",
            style: "destructive",
            onPress: async () => {
              await persistAnimals(parsedData);
              Alert.alert("Berhasil", "Database berhasil di-import!");
              setOptionsModalVisible(false);
            }
          }
        ]
      );
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Gagal mengimpor database.");
    }
  };

  useEffect(() => {
    let timer;
    if (isSinglePlayerModalVisible) {
      if (countdown > 0) {
        timer = setTimeout(() => setCountdown(prev => prev - 1), 1000);
      } else {
        setSinglePlayerModalVisible(false);
        startSinglePlayerGame();
      }
    }
    return () => clearTimeout(timer);
  }, [isSinglePlayerModalVisible, countdown]);

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

  const isManagementDuplicate = animals.some(a => a.IND === managementSearchTerm.trim().toUpperCase());

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
            language={language}
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
            onSinglePlayer={handleSinglePlayerPress}
            isStartingGame={isAddingAnimal}
            onToggleLanguage={toggleLanguage}
            onManageAnimals={() => {
              setManagementSearchTerm('');
              setIsManaging(true);
            }}
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
          animalList={animals.filter(a => a.IND.includes(managementSearchTerm.toUpperCase()) || a.ENG.includes(managementSearchTerm.toUpperCase()))}
          deleteAnimal={deleteAnimal}
          onAddClue={addClue}
          onDeleteClue={deleteClue}
          ListHeaderComponent={
            <ManagementHeader
              onAddAnimal={addAnimal}
              isAdding={isAddingAnimal}
              animalCount={animals.length}
              onOptionsPress={() => setOptionsModalVisible(true)}
              searchTerm={managementSearchTerm}
              onSearchChange={setManagementSearchTerm}
              isDuplicate={isManagementDuplicate}
            />
          }
        />
      </Modal>

      {/* About Page Modal */}
      <AboutPage isVisible={isAboutVisible} onClose={() => setIsAboutVisible(false)} appVersion={appConfig.expo.version} />

      {/* Single Player Confirmation Modal */}
      <Modal
        transparent={true}
        visible={isSinglePlayerModalVisible}
        animationType="fade"
        onRequestClose={() => setSinglePlayerModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Lawan Bot 🤖</Text>
            <Text style={styles.modalText}>Permainan dimulai dalam:</Text>
            <Text style={styles.countdownText}>{countdown}</Text>
            <View style={styles.modalButtons}>
              <CustomButton title="Batal" onPress={() => setSinglePlayerModalVisible(false)} color="#e74c3c" />
              <CustomButton title="Gas Terus! 🚀" onPress={() => {
                setSinglePlayerModalVisible(false);
                startSinglePlayerGame();
              }} color="#2ecc71" />
            </View>
          </View>
        </View>
      </Modal>

      {/* Options Modal (Export/Reset) */}
      <Modal
        transparent={true}
        visible={isOptionsModalVisible}
        animationType="fade"
        onRequestClose={() => setOptionsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Opsi Database</Text>
            <View style={{ width: '100%', gap: 10 }}>
              <CustomButton title="Export Database (JSON) 📤" onPress={handleExportDatabase} color="#2ecc71" />
              <CustomButton title="Import Database (JSON) 📥" onPress={handleImportDatabase} color="#3498db" />
              <CustomButton title="Reset Database ⚠️" onPress={() => {
                setOptionsModalVisible(false);
                setTimeout(() => resetAnimals(), 500); // Delay slightly to allow modal to close
              }} color="#e74c3c" />
              <CustomButton title="Tutup" onPress={() => setOptionsModalVisible(false)} color="#95a5a6" />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFF8E7' },
  container: { flex: 1, backgroundColor: '#FFF8E7' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalTitle: { fontSize: 22, fontFamily: 'PlaypenSans-Bold', color: '#6f42c1', marginBottom: 10 },
  modalText: { fontSize: 16, fontFamily: 'PlaypenSans-Regular', color: '#333', textAlign: 'center' },
  countdownText: {
    fontSize: 48,
    fontFamily: 'PlaypenSans-Bold',
    color: '#FF6F61',
    marginVertical: 10,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
});
