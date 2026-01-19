import React from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';

/**
 * Displays the word to be guessed, handling multi-word phrases by splitting them into separate lines.
 * @param {object} props
 * @param {string} props.word - The full word/phrase to be guessed.
 * @param {string[]} props.correctLetters - An array of correctly guessed letters.
 * @param {string[]} props.wrongLetters - An array of wrongly guessed letters.
 */
export default function WordBox({ word, correctLetters, wrongLetters = [] }) {
    const { width: screenWidth } = useWindowDimensions();
    // Split the word by spaces to handle multi-word animals
    const wordParts = typeof word === 'string' ? word.split(' ').filter(part => part.trim().length > 0) : [];

    // Find the length of the longest word part to calculate the box size
    const longestPartLength = Math.max(...wordParts.map(part => part.length), 0);

    // --- Dynamic Box Sizing Logic ---
    const containerPadding = 40; // 20px padding on each side of the main screen
    const boxMargin = 4; // 2px margin on each side of a box
    const defaultBoxSize = 45;

    // Calculate the maximum possible size for a box
    const maxBoxSize = longestPartLength > 0
        ? (screenWidth - containerPadding - (longestPartLength * boxMargin)) / longestPartLength
        : defaultBoxSize;

    // Use the smaller value between the default size and the calculated max size
    const boxSize = Math.min(defaultBoxSize, maxBoxSize);
    const fontSize = boxSize * 0.75; // Calculate a dynamic font size based on the box size

    let charCounter = 0; // Counter to map wrongLetters to character slots sequentially

    return (
        <View style={styles.wrapper}>
            {wordParts.map((part, partIndex) => (
                <View key={`part-${partIndex}`} style={styles.container}>
                    {part.split('').map((char, charIndex) => {
                        const wrongChar = wrongLetters[charCounter] || '';
                        charCounter++;
                        return (
                            <View key={`char-${charIndex}`} style={styles.column}>
                                {/* Wrong Letter Slot (Above) */}
                                <Text style={[styles.wrongChar, { fontSize: fontSize * 0.8, height: boxSize * 0.8 }]}>
                                    {wrongChar}
                                </Text>
                                {/* Correct Letter Box (Below) */}
                                <View style={[styles.box, { width: boxSize, height: boxSize * 1.2 }]}>
                                    <Text style={[styles.char, { fontSize: fontSize }]}>
                                        {correctLetters.includes(char) ? char : ''}
                                    </Text>
                                </View>
                            </View>
                        );
                    })}
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
        alignItems: 'flex-end', // Align boxes to the bottom so they line up even if wrongChar is empty
    },
    column: {
        alignItems: 'center',
        marginHorizontal: 2,
    },
    box: {
        borderTopWidth: 2,
        borderBottomWidth: 2,
        borderLeftWidth: 2,
        borderRightWidth: 2,
        // width and height are now dynamic
        borderRadius: 10,
        backgroundColor: '#FFF',
        borderColor: '#333',
        justifyContent: 'center',
    },
    char: {
        // fontSize is now dynamic
        fontFamily: 'PlaypenSans-Bold',
        color: '#000',
        textAlign: 'center', // Ensures horizontal centering
        includeFontPadding: false, // Improves vertical centering for custom fonts on Android
        // Vertical centering is handled by `justifyContent: 'center'` on the parent `box` style
    },
    wrongChar: {
        fontFamily: 'PlaypenSans-Bold',
        color: '#e74c3c',
        textAlign: 'center',
        textAlignVertical: 'bottom', // For Android to align text to bottom of its container
    },
});