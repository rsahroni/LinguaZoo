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
    language,
}) {
    // --- Logic for descriptive text ---
    const wordParts = word ? word.split(' ').filter(p => p) : [];
    const wordCount = wordParts.length;
    const letterCount = word ? word.replace(/ /g, '').length : 0;

    // Rule change: Lives equal to letter count
    const maxLives = letterCount > 0 ? letterCount : 5;

    const langName = language === 'IND' ? 'Bahasa Indonesia' : 'Bahasa Inggris';
    let description = `Kita main pakai ${langName} ya!\n`;

    if (wordCount > 1) {
        description += `Hewan ini ada ${wordCount} kata dan punya ${letterCount} huruf.`;
    } else if (letterCount > 0) {
        description += `Hewan ini punya ${letterCount} huruf.`;
    }
    // --- End of logic ---

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
                <View style={styles.infoBox}>
                    <Text style={styles.description}>{description}</Text>
                    <Text style={styles.clue}>Clue-nya: {clue}</Text>
                </View>

                {/* Pass wrongLetters to WordBox to display them above the slots */}
                <WordBox word={word} correctLetters={correctLetters} wrongLetters={wrongLetters} />

                <View style={styles.statusRow}>
                    <Text style={styles.status}>Kesempatan: {Math.max(0, maxLives - wrongLetters.length)}</Text>
                </View>

                {!isWin && !isLose ? (
                    <Keyboard onPressLetter={handleGuess} disabledLetters={[...correctLetters, ...wrongLetters]} />
                ) : (
                    <View style={styles.resultBox}>
                        <Text style={styles.resultText}>
                            {isWin ? 'Hore, Kamu Berhasil! 🥳🎉' : 'Yah, Coba Lagi Ya! 💪😊'}
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
    infoBox: {
        marginBottom: 16,
        gap: 4,
    },
    description: { fontSize: 16, fontFamily: 'PlaypenSans-Regular', color: '#555' },
    clue: { fontSize: 18, fontFamily: 'PlaypenSans-Regular', fontStyle: 'italic', color: '#333' },
    statusRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 12 },
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
