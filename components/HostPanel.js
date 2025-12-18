import React, { useRef } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import CustomButton from './CustomButton';
import AppHeader from './AppHeader';

export default function HostPanel({
    word,
    clue,
    suggestions,
    language,
    onWordChange,
    onWordInputBlur,
    onClueChange,
    onSuggestionPress,
    onStartGame,
    onRandomAnimal,
    isStartingGame,
    onToggleLanguage,
    onManageAnimals,
    appVersion,
}) {
    const clueInputRef = useRef(null);

    const handleRandomAnimalPress = () => {
        onRandomAnimal(); // Call the original function from the parent
        clueInputRef.current?.focus(); // Then, immediately focus the clue input
    };

    return (
        <View style={styles.pageContainer}>
            <ScrollView contentContainerStyle={styles.container}>
                <AppHeader size="large" />
                <Text style={styles.label}>
                    Masukkan nama hewan dan <Text style={styles.italic}>clue</Text>-nya dulu:
                </Text>
                <View style={styles.wordInputWrapper}>
                    <View style={styles.inputContainer}>
                        <TextInput
                            placeholder="Hewan (contoh: KUCING)"
                            value={word}
                            onChangeText={onWordChange}
                            onBlur={onWordInputBlur}
                            editable={!isStartingGame}
                            style={styles.input}
                            returnKeyType="next"
                            onSubmitEditing={() => clueInputRef.current?.focus()}
                        />
                        {word.length > 0 && !isStartingGame && (
                            <TouchableOpacity onPress={() => onWordChange('')} style={styles.clearButton}>
                                <Text style={styles.clearButtonText}>X</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                    {suggestions.length > 0 && (
                        <View style={styles.suggestionContainer}>
                            {suggestions.map((item) => (
                                <TouchableOpacity
                                    key={item.IND}
                                    style={styles.suggestionItem}
                                    onPress={() => onSuggestionPress(item.IND)}>
                                    <Text>{item.IND}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                </View>
                <View style={styles.inputContainer}>
                    <TextInput
                        ref={clueInputRef}
                        placeholder="Clue (contoh: hewan berkaki empat)"
                        value={clue}
                        onChangeText={onClueChange}
                        editable={!isStartingGame}
                        style={styles.input}
                    />
                    {clue.length > 0 && !isStartingGame && (
                        <TouchableOpacity onPress={() => onClueChange('')} style={styles.clearButton}>
                            <Text style={styles.clearButtonText}>X</Text>
                        </TouchableOpacity>
                    )}
                </View>
                <View style={styles.row}>
                    <View style={styles.rowBtn}>
                        <CustomButton title={isStartingGame ? "Memeriksa..." : "Mulai Permainan"} onPress={onStartGame} disabled={isStartingGame} />
                    </View>
                </View>

                <View style={styles.row}>
                    <View style={styles.rowBtn}>
                        <CustomButton title="Random Hewan" onPress={handleRandomAnimalPress} color="#5bc0de" />
                    </View>
                    <View style={styles.rowBtn}>
                        <CustomButton
                            title={language === 'IND' ? 'Bahasa: Indonesia' : 'Bahasa: English'}
                            onPress={onToggleLanguage} color="#848484"
                        />
                    </View>
                </View>

            </ScrollView>
            <View style={styles.footerContainer}>
                <CustomButton title="Koleksi Hewan" onPress={onManageAnimals} color="#FF6F61" />
                <Text style={styles.versionText}>Versi {appVersion}</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    pageContainer: { flex: 1 },
    container: { padding: 20, paddingBottom: 40 },
    label: { fontSize: 16, fontFamily: 'PlaypenSans-Regular', color: '#444', marginBottom: 8 },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#333',
        borderRadius: 8,
        backgroundColor: '#fff',
        marginBottom: 10,
    },
    input: { flex: 1, fontFamily: 'PlaypenSans-Regular', padding: 10, },
    italic: { fontStyle: 'italic' },
    row: { flexDirection: 'row', gap: 10, marginBottom: 10 },
    rowBtn: { flex: 1 },
    suggestionContainer: {
        position: 'absolute',
        top: '100%',
        left: 0,
        right: 0,
        zIndex: 1,
        backgroundColor: '#fff',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    suggestionItem: {
        padding: 10,
        backgroundColor: '#f0f0f0',
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    clearButton: {
        padding: 10,
    },
    clearButtonText: {
        color: '#888',
        fontSize: 16,
        fontFamily: 'PlaypenSans-Bold',
    },
    wordInputWrapper: {
        position: 'relative', // Diperlukan untuk pemosisian absolut anak
    },
    footerContainer: {
        padding: 20,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
        backgroundColor: '#FFF8E7',
    },
    versionText: {
        marginTop: 8,
        fontSize: 12,
        fontFamily: 'PlaypenSans-Regular',
        color: '#aaa',
        textAlign: 'center',
    },
});