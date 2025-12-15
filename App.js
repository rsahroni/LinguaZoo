import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ScrollView, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ScreenOrientation from 'expo-screen-orientation';

import GameBoard from './components/GameBoard';
import AnimalList from './components/AnimalList';
import useGameLogic from './hooks/useGameLogic';
import { translateToEnglish } from './utils/translate';
import { ANIMAL_SEED_DATA } from './data/seedData';

export default function App() {
  const [language, setLanguage] = useState('IND'); // 'IND' | 'ENG'
  const [animals, setAnimals] = useState([]);
  const [newAnimal, setNewAnimal] = useState('');
  const [editAnimal, setEditAnimal] = useState(null);
  const [editText, setEditText] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isManaging, setIsManaging] = useState(false); // State for management UI

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

  const addAnimal = async () => {
    const name = newAnimal.trim().toUpperCase();
    if (!name) return;
    const eng = (await translateToEnglish(name)).toUpperCase();
    const exists = animals.some(a => a.IND === name || a.ENG === eng);
    if (exists) {
      Alert.alert('Duplikat', 'Hewan sudah ada dalam daftar.');
      return;
    }
    const updated = [...animals, { IND: name, ENG: eng }];
    await persistAnimals(updated);
    setNewAnimal('');
  };

  const startEdit = (item) => {
    setEditAnimal(item);
    if (item) {
      setEditText(item.IND);
    } else {
      setEditText(''); // Clear text on cancel
    }
  };

  const confirmEdit = async () => {
    const name = editText.trim().toUpperCase();
    if (!name || !editAnimal) return;
    const eng = (await translateToEnglish(name)).toUpperCase();
    const updated = animals.map((a) =>
      a.IND === editAnimal.IND ? { IND: name, ENG: eng } : a
    ); // Compare by ID to be safer
    await persistAnimals(updated);
    setEditAnimal(null);
    setEditText('');
  };

  const deleteAnimal = async (item) => {
    const updated = animals.filter(a => a !== item);
    await persistAnimals(updated);
  };

  const pickRandomAnimal = () => {
    if (animals.length === 0) {
      Alert.alert('Kosong', 'Tambahkan hewan terlebih dahulu.');
      return;
    }
    const idx = Math.floor(Math.random() * animals.length);
    const chosen = animals[idx][language.toUpperCase()];
    setWord(chosen);
    setClue('Tebak nama hewan ini!');
    setGameStarted(true);
  };

  const toggleLanguage = () => {
    setLanguage(prev => (prev === 'IND' ? 'ENG' : 'IND'));
  };

  const exitAndResetGame = () => {
    setGameStarted(false);
    resetGame(); // Resets correct/wrong letters from the hook
    setWord('');   // Clears the manual word input
    setClue('');   // Clears the manual clue input
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

  // Header for the Animal Management screen
  const renderManagementHeader = () => (
    <>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Manajemen Hewan</Text>
        <Button title="Kembali" onPress={() => setIsManaging(false)} />
      </View>
      <Text style={styles.label}>Tambah hewan (Indonesia)</Text>
      <TextInput placeholder="Contoh: KUCING" value={newAnimal} onChangeText={setNewAnimal} style={styles.input} />
      <Button title="Tambah" onPress={addAnimal} />
      <Text style={[styles.title, { marginTop: 20, fontSize: 18 }]}>Daftar Hewan</Text>
    </>
  );

  // Header for the main Host Panel
  const renderHostPanelHeader = () => (
    <>
      <Text style={styles.title}>LinguaZoo — Host Panel</Text>
      <Text style={styles.label}>Masukkan kata dan clue manual</Text>
      <TextInput
        placeholder="Kata (contoh: KUCING)"
        value={word}
        onChangeText={handleWordInputChange}
        style={styles.input}
      />
      {suggestions.length > 0 && (
        <View style={styles.suggestionContainer}>
          {suggestions.map((item) => (
            <TouchableOpacity
              key={item.IND}
              style={styles.suggestionItem}
              onPress={() => {
                setWord(item.IND);
                setSuggestions([]);
              }}>
              <Text>{item.IND}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
      <TextInput
        placeholder="Clue (contoh: hewan berkaki empat)"
        value={clue}
        onChangeText={setClue}
        style={[styles.input, { marginTop: suggestions.length > 0 ? 10 : 0 }]}
      />
      <View style={styles.row}>
        <View style={styles.rowBtn}>
          <Button title="Mulai Game" onPress={() => {
            if (!word || !clue) {
              Alert.alert('Lengkapi', 'Isi kata dan clue terlebih dahulu atau gunakan Random.');
              return;
            }
            // Auto-add word if it's new
            const isNewWord = !animals.some(a => a.IND === word.trim());
            if (isNewWord) {
              // Use a temporary state for the new word to avoid race conditions
              addAnimal(word.trim());
            }
            setGameStarted(true);
          }} />
        </View>
        <View style={styles.rowBtn}>
          <Button title="Random Hewan" onPress={pickRandomAnimal} />
        </View>
      </View>

      <View style={styles.row}>
        <View style={styles.rowBtn}>
          <Button
            title={language === 'IND' ? 'Bahasa: Indonesia' : 'Bahasa: English'}
            onPress={toggleLanguage}
          />
        </View>
      </View>

      <View style={{ marginTop: 30 }}>
        <Button title="Manajemen Hewan" onPress={() => setIsManaging(true)} color="#FF6F61" />
      </View>
    </>
  );

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
            resetGame={resetGame}
            onExit={exitAndResetGame}
          />
        ) : isManaging ? (
          // Animal Management UI
          <AnimalList
            animalList={animals}
            editAnimal={editAnimal}
            editText={editText}
            setEditText={setEditText}
            startEdit={startEdit}
            confirmEdit={confirmEdit}
            deleteAnimal={deleteAnimal}
            language={language}
            ListHeaderComponent={renderManagementHeader}
          />
        ) : (
          // Main Host Panel UI
          <ScrollView contentContainerStyle={styles.leftPanel}>{renderHostPanelHeader()}</ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFF8E7' },
  container: { flex: 1, backgroundColor: '#FFF8E7' },
  leftPanel: { padding: 20 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 10, color: '#FF6F61' },
  label: { fontSize: 14, color: '#444', marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#333', padding: 10, marginBottom: 10, borderRadius: 8, backgroundColor: '#fff' },
  row: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  rowBtn: { flex: 1 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  suggestionContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 10,
  },
  suggestionItem: {
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
});
