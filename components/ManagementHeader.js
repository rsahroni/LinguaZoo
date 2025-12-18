import React, { useState } from 'react';
import { View, Text, StyleSheet, Keyboard } from 'react-native';
import CustomButton from './CustomButton';
import ClearableTextInput from './ClearableTextInput';

export default function ManagementHeader({ onAddAnimal, isAdding, animalCount, onReset }) {
    const [newAnimal, setNewAnimal] = useState('');

    const handleAdd = async () => { // Ubah menjadi async
        if (newAnimal.trim()) {
            const success = await onAddAnimal(newAnimal); // Tunggu hasil dari onAddAnimal
            if (success) {
                setNewAnimal(''); // Kosongkan input hanya jika berhasil
                Keyboard.dismiss(); // Close the keyboard on success
            }
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.headerRow}>
                <Text style={styles.title}>Koleksi Hewan</Text>
            </View>
            <Text style={styles.label}>Tambah hewan (Indonesia):</Text>
            <ClearableTextInput
                placeholder="Contoh: KUCING"
                value={newAnimal}
                onChangeText={setNewAnimal}
                onSubmitEditing={handleAdd}
                editable={!isAdding}
                returnKeyType="done"
            />
            <CustomButton title={isAdding ? "Memeriksa..." : "Tambah"} onPress={handleAdd} disabled={isAdding || newAnimal.trim() === ''} />
            <View style={styles.listTitleContainer}>
                <Text style={[styles.title, { marginTop: 10, fontSize: 18, marginBottom: 0 }]}>Daftar Hewan</Text>
                <View style={styles.rightHeaderItems}>
                    <Text style={styles.countText}>Total: {animalCount}</Text>
                    <CustomButton title="Reset" onPress={onReset} color="#e74c3c" style={styles.resetButton} textStyle={styles.resetButtonText} />
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { paddingHorizontal: 20 },
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    title: { fontSize: 24, fontFamily: 'PlaypenSans-Bold', marginBottom: 10, color: '#FF6F61' },
    label: { fontSize: 16, fontFamily: 'PlaypenSans-Regular', color: '#444', marginBottom: 8 },
    listTitleContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'baseline',
    },
    countText: {
        fontFamily: 'PlaypenSans-Regular',
        fontSize: 14,
        color: '#666',
    },
    rightHeaderItems: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    resetButton: {
        paddingVertical: 4,
        paddingHorizontal: 8,
    },
    resetButtonText: {
        fontSize: 12,
    },
});