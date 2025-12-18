import React, { useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import CustomButton from './CustomButton';
import AppHeader from './AppHeader';
import ClearableTextInput from './ClearableTextInput';

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
    onShowAbout,
}) {
    const clueInputRef = useRef(null);

    return (
        <View style={styles.pageContainer}>
            <ScrollView contentContainerStyle={styles.container}>
                <AppHeader size="large" />
                <Text style={styles.label}>
                    Masukkan nama hewan dan <Text style={styles.italic}>clue</Text>-nya dulu:
                </Text>
                <View style={styles.wordInputWrapper}>
                    <ClearableTextInput
                        placeholder="Hewan (contoh: KUCING)"
                        value={word}
                        onChangeText={onWordChange}
                        onBlur={onWordInputBlur}
                        editable={!isStartingGame}
                        returnKeyType="next"
                        onSubmitEditing={() => clueInputRef.current?.focus()}
                    />
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
                <ClearableTextInput
                    ref={clueInputRef}
                    placeholder="Clue (contoh: hewan berkaki empat)"
                    value={clue}
                    onChangeText={onClueChange}
                    editable={!isStartingGame}
                />
                <View style={styles.row}>
                    <View style={styles.rowBtn}>
                        <CustomButton title={isStartingGame ? "Memeriksa..." : "Mulai Permainan"} onPress={onStartGame} disabled={isStartingGame} />
                    </View>
                </View>

                <View style={styles.row}>
                    <View style={styles.rowBtn}>
                        <CustomButton title="Random Hewan" onPress={onRandomAnimal} color="#5bc0de" />
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
                <TouchableOpacity onPress={onShowAbout}>
                    <Text style={styles.versionText}>Versi {appVersion}</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    pageContainer: { flex: 1 },
    container: { padding: 20, paddingBottom: 40 },
    label: { fontSize: 16, fontFamily: 'PlaypenSans-Regular', color: '#444', marginBottom: 8 },
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
        color: '#007BFF', // Standard link color
        textAlign: 'center',
        textDecorationLine: 'underline',
    },
});