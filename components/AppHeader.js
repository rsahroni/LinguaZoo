import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

/**
 * A reusable application header component with the app icon and title.
 * @param {object} props
 * @param {'large' | 'small'} [props.size='large'] - The size of the header.
 * @param {object} [props.style] - Optional additional styles for the container.
 */
export default function AppHeader({ size = 'large', style }) {
    const isLarge = size === 'large';
    const iconSize = isLarge ? 50 : 30;

    const iconStyle = [
        styles.icon,
        { width: iconSize, height: iconSize },
        isLarge && styles.largeIcon,
    ];

    return (
        <View style={[styles.container, style]}>
            <Image source={require('../assets/linguazoo-icon-v1.png')} style={iconStyle} />
            <Text style={styles.title}>LinguaZoo</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    icon: {
        marginRight: 8,
        resizeMode: 'contain',
    },
    largeIcon: {
        borderStyle: 'solid',
        borderColor: '#FF6F61',
        borderWidth: 2,
        borderRadius: 15,
    },
    title: {
        fontSize: 24,
        fontFamily: 'PlaypenSans-Bold',
        color: '#FF6F61',
    },
});