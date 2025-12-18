import React from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import WordBox from './WordBox';
import Keyboard from './Keyboard';
import CustomButton from './CustomButton';
import AppHeader from './AppHeader';

export default function GameBoard({
    clue,
    word,
    correctLetters,
    wrongLetters,
    handleGuess,
    onExit,
}) {
    // Calculate lives based on word length: 75% of length, min 5, max 8.
    const maxLives = word
        ? Math.min(8, Math.max(5, Math.floor(word.replace(/ /g, '').length * 0.75)))
        : 6;

    const isWin = word && word.split('').every(ch => ch === ' ' || correctLetters.includes(ch));
    const isLose = wrongLetters.length >= maxLives;

    const handleExitPress = () => {
        Alert.alert(
            "Keluar dari Permainan?",
            "Kamu yakin mau keluar? Permainan saat ini akan berakhir.",
            [
                { text: "Lanjut Main", style: "cancel" },
                { text: "Ya, Keluar", onPress: onExit, style: "destructive" },
            ]
        );
    };

    const handleFinishPress = () => {
        // Fungsi onExit sudah mereset game dan kembali ke menu utama
        onExit();
    };

    return (
        <View style={styles.pageContainer}>
            <View style={styles.mainContent}>
                <View style={styles.headerRow}>
                    <AppHeader size="large" style={{ marginBottom: 0 }} />
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
                    </View>
                )}
            </View>

            {/* Tombol Aksi di Bagian Bawah */}
            <View style={styles.actionsContainer}>
                {!isWin && !isLose
                    ? <CustomButton title="Keluar dari Permainan" onPress={handleExitPress} color="#e74c3c" />
                    : <CustomButton title="Selesai" onPress={handleFinishPress} />
                }
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    pageContainer: { flex: 1 },
    mainContent: { flex: 1, padding: 20 },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    clue: { fontSize: 18, fontFamily: 'PlaypenSans-Regular', marginBottom: 16, color: '#333' },
    statusRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
    status: { fontSize: 16, fontFamily: 'PlaypenSans-Regular', color: '#333' },
    resultBox: { marginTop: 20, gap: 10 },
    resultText: { fontSize: 20, fontFamily: 'PlaypenSans-Bold' },
    answer: { fontSize: 18, fontFamily: 'PlaypenSans-Regular' },
    actionsContainer: {
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
        backgroundColor: '#FFF8E7',
    },
});
