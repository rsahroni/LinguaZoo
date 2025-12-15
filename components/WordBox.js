import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

/**
 * Displays the word to be guessed, handling multi-word phrases by splitting them into separate lines.
 * @param {object} props
 * @param {string} props.word - The full word/phrase to be guessed.
 * @param {string[]} props.correctLetters - An array of correctly guessed letters.
 */
export default function WordBox({ word, correctLetters }) {
    // Split the word by spaces to handle multi-word animals
    const wordParts = typeof word === 'string' ? word.split(' ').filter(part => part.trim().length > 0) : [];

    return (
        <View style={styles.wrapper}>
            {wordParts.map((part, partIndex) => (
                <View key={`part-${partIndex}`} style={styles.container}>
                    {part.split('').map((char, charIndex) => (
                        <View key={`char-${charIndex}`} style={styles.box}>
                            <Text style={styles.char}>
                                {correctLetters.includes(char) ? char : ''}
                            </Text>
                        </View>
                    ))}
                </View>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        alignItems: 'center', // Center the rows horizontally
        gap: 10, // Add space between rows
    },
    container: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    box: {
        width: 35,
        height: 45,
        borderTopWidth: 3,
        borderBottomWidth: 3,
        borderLeftWidth: 2,
        borderRightWidth: 2,
        borderRadius: 10,
        backgroundColor: '#FFF',
        borderColor: '#333',
        marginHorizontal: 4,
        alignItems: 'center',
        justifyContent: 'center',
    },
    char: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#000',
    },
});