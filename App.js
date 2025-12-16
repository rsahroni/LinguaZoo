import React, { useCallback, useEffect, useState } from 'react';
import { View, StyleSheet, Alert, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFonts } from 'expo-font';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ScreenOrientation from 'expo-screen-orientation';

import GameBoard from './components/GameBoard';
import AnimalList from './components/AnimalList';
import ManagementHeader from './components/ManagementHeader';
import HostPanel from './components/HostPanel';
import useGameLogic from './hooks/useGameLogic';
import { translateToEnglish } from './utils/translate';
import { ANIMAL_SEED_DATA } from './data/seedData';
import { isLikelyAnimal } from './utils/validation';

export default function App() {
  const [language, setLanguage] = useState('IND'); // 'IND' | 'ENG'
  const [animals, setAnimals] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [isManaging, setIsManaging] = useState(false); // State for management UI
  const [isAddingAnimal, setIsAddingAnimal] = useState(false); // Loading state for validation
  const [lastRandomAnimal, setLastRandomAnimal] = useState(null); // Track the last picked animal

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
    (async () => {
      const saved = await AsyncStorage.getItem('linguazoo_animals');
      const savedAnimals = saved ? JSON.parse(saved) : [];
      if (savedAnimals.length > 0) {
        setAnimals(savedAnimals);
      } else {
        // Use the larger seed data list
        setAnimals(ANIMAL_SEED_DATA);
        await AsyncStorage.setItem('linguazoo_animals', JSON.stringify(ANIMAL_SEED_DATA));
      }
    })();
  }, []);

  const persistAnimals = async (list) => {
    setAnimals(list);
    await AsyncStorage.setItem('linguazoo_animals', JSON.stringify(list));
  };

  const addAnimal = useCallback(async (animalName, options = {}) => { // Mengembalikan boolean
    setIsAddingAnimal(true);
    const { showDuplicateAlert = true } = options; // Default to showing the alert

    const name = animalName.trim().toUpperCase();
    if (!name) return;

    const exists = animals.some(a => a.IND === name);
    if (exists) {
      if (showDuplicateAlert) {
        Alert.alert('Sudah Ada!', 'Hore! Hewan ini sudah ada di kebun binatang kita.');
      }
      setIsAddingAnimal(false);
      return false; // Gagal karena duplikat
    }

    // Validasi apakah ini nama hewan yang valid
    const isValidAnimal = await isLikelyAnimal(name);
    if (!isValidAnimal && showDuplicateAlert) { // Hanya tampilkan alert saat menambah manual
      Alert.alert('Hmm...', `Sepertinya "${name}" bukan nama hewan, deh. Coba periksa lagi, yuk!`);
      setIsAddingAnimal(false);
      return false; // Gagal karena tidak valid
    }

    const name_eng = (await translateToEnglish(name)).toUpperCase();
    const updated = [...animals, { IND: name, ENG: name_eng }];
    await persistAnimals(updated);
    setIsAddingAnimal(false);
    return true; // Berhasil ditambahkan
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
    // Memberikan jeda singkat agar penekanan pada item saran sempat terdaftar
    // sebelum daftar sarannya dihilangkan.
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
      // Hewan sudah ada
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

    // Hewan baru, lakukan validasi terlebih dahulu
    setIsAddingAnimal(true);
    const isValid = await isLikelyAnimal(trimmedWord);
    setIsAddingAnimal(false);

    if (!isValid) {
      Alert.alert('Hmm...', `Sepertinya "${trimmedWord}" bukan nama hewan, deh. Coba periksa lagi, yuk!`);
      return;
    }

    // Jika valid, baru tampilkan konfirmasi
    Alert.alert(
      "Hewan Baru!",
      `Wow, "${trimmedWord}" akan jadi penghuni baru kebun binatang kita! Kamu mau pakai hewan ini untuk main?`,
      [
        { text: "Pilih lagi", style: "cancel" },
        {
          text: "Ya, pakai ini!",
          onPress: async () => {
            // Panggil addAnimal tanpa validasi ulang, karena sudah divalidasi
            const success = await addAnimal(word, { showDuplicateAlert: false });
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

  if (!fontsLoaded) {
    return null; // Atau tampilkan loading screen
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {gameStarted ? (
          <GameBoard
            clue={clue}
            word={word}
            correctLetters={correctLetters}
            wrongLetters={wrongLetters}
            handleGuess={handleGuess}
            onExit={exitAndResetGame}
          />
        ) : isManaging ? (
          // Animal Management UI
          <AnimalList
            animalList={animals}
            deleteAnimal={deleteAnimal}
            language={language}
            ListHeaderComponent={<ManagementHeader onBack={() => setIsManaging(false)} onAddAnimal={addAnimal} isAdding={isAddingAnimal} animalCount={animals.length} onReset={resetAnimals} />}
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
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFF8E7' },
  container: { flex: 1, backgroundColor: '#FFF8E7' },
});
