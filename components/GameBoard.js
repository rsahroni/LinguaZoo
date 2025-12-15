import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import WordBox from './WordBox';
import Keyboard from './Keyboard';

export default function GameBoard({
    clue,
    word,
    correctLetters,
    wrongLetters,
    handleGuess,
    resetGame,
    onExit,
}) {
    // Calculate lives based on word length: 75% of length, min 5, max 8.
    const maxLives = word
        ? Math.min(8, Math.max(5, Math.floor(word.replace(/ /g, '').length * 0.75)))
        : 6;

    const isWin = word && word.split('').every(ch => ch === ' ' || correctLetters.includes(ch));
    const isLose = wrongLetters.length >= maxLives;

    return (
        <View style={styles.container}>
            <View style={styles.headerRow}>
                <Text style={styles.header}>LinguaZoo</Text>
                <Button title="Keluar" onPress={onExit} color="#FF6F61" />
            </View>
            <Text style={styles.clue}>Clue: {clue}</Text>

            <WordBox word={word} correctLetters={correctLetters} />

            <View style={styles.statusRow}>
                <Text style={styles.status}>Wrong: {wrongLetters.join(' ')}</Text>
                <Text style={styles.status}>Lives: {Math.max(0, maxLives - wrongLetters.length)}</Text>
            </View>

            {!isWin && !isLose ? (
                <Keyboard onPressLetter={handleGuess} disabledLetters={[...correctLetters, ...wrongLetters]} />
            ) : (
                <View style={styles.resultBox}>
                    <Text style={styles.resultText}>
                        {isWin ? 'Kamu menang! 🎉' : 'Kamu kalah! 😅'}
                    </Text>
                    <Text style={styles.answer}>Jawaban: {word}</Text>
                    <View style={styles.actions}>
                        <View style={{ flex: 1 }}>
                            <Button title="Main lagi" onPress={resetGame} />
                        </View>
                    </View>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 24 },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 50, // Added to push the header down
        marginBottom: 12,
    },
    header: { fontSize: 20, fontWeight: 'bold', color: '#FF6F61' },
    clue: { fontSize: 16, marginBottom: 16, color: '#333' },
    statusRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
    status: { fontSize: 14, color: '#333' },
    resultBox: { marginTop: 20, gap: 10 },
    resultText: { fontSize: 18, fontWeight: 'bold' },
    answer: { fontSize: 16 },
    actions: { flexDirection: 'row', gap: 10, marginTop: 10 },
});
