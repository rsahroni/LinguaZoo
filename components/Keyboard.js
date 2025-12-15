import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';

const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export default function Keyboard({ onPressLetter, disabledLetters = [] }) {
    return (
        <View style={styles.grid}>
            {letters.map((l) => {
                const disabled = disabledLetters.includes(l);
                return (
                    <TouchableOpacity
                        key={l}
                        style={[styles.key, disabled && styles.keyDisabled]}
                        onPress={() => !disabled && onPressLetter(l)}
                        disabled={disabled}
                    >
                        <Text style={[styles.keyText, disabled && styles.keyTextDisabled]}>{l}</Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 16 },
    key: {
        width: 36,
        height: 36,
        borderRadius: 8,
        backgroundColor: '#FF6F61',
        alignItems: 'center',
        justifyContent: 'center',
    },
    keyDisabled: { backgroundColor: '#ffc8c2' },
    keyText: { color: '#fff', fontWeight: 'bold' },
    keyTextDisabled: { color: '#fff' },
});
