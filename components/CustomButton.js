import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';

export default function CustomButton({ title, onPress, color, style, textStyle, disabled }) {
    const buttonStyles = [
        styles.button,
        color ? { backgroundColor: color } : styles.defaultColor,
        style,
        disabled ? styles.disabled : {}
    ];

    return (
        <TouchableOpacity onPress={onPress} style={buttonStyles} disabled={disabled}>
            <Text style={[styles.text, textStyle]}>{title}</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    defaultColor: {
        backgroundColor: '#2196F3', // Warna biru default
    },
    text: {
        color: '#fff',
        fontFamily: 'PlaypenSans-Bold',
        fontSize: 16,
    },
    disabled: {
        backgroundColor: '#cccccc',
    },
});