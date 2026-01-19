import React from 'react';
import { View, Text, StyleSheet, Keyboard, TouchableOpacity } from 'react-native';
import CustomButton from './CustomButton';
import ClearableTextInput from './ClearableTextInput';

export default function ManagementHeader({ onAddAnimal, isAdding, animalCount, onOptionsPress, searchTerm, onSearchChange, isDuplicate }) {
    const handleAdd = async () => { // Ubah menjadi async
        if (searchTerm.trim()) {
            const success = await onAddAnimal(searchTerm, null); // Pass null as clue
            if (success) {
                onSearchChange(''); // Kosongkan input hanya jika berhasil
                Keyboard.dismiss(); // Close the keyboard on success
            }
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.headerRow}>
                <Text style={styles.title}>Koleksi Hewan</Text>
                <TouchableOpacity onPress={onOptionsPress} style={styles.optionsButton}>
                    <Text style={styles.optionsButtonText}>⚙️</Text>
                </TouchableOpacity>
            </View>
            <Text style={styles.label}>Cari atau tambah hewan (Indonesia):</Text>
            <ClearableTextInput
                placeholder="Contoh: KUCING"
                value={searchTerm}
                onChangeText={onSearchChange}
                onSubmitEditing={handleAdd}
                editable={!isAdding}
                returnKeyType="done"
            />
            <CustomButton
                title={isAdding ? "Memeriksa..." : (isDuplicate ? "Sudah Ada" : "Tambah")}
                onPress={handleAdd}
                disabled={isAdding || searchTerm.trim() === '' || isDuplicate}
            />
            <View style={styles.listTitleContainer}>
                <Text style={[styles.title, { marginTop: 10, fontSize: 18, marginBottom: 0 }]}>Daftar Hewan</Text>
                <View style={styles.rightHeaderItems}>
                    <Text style={styles.countText}>Total: {animalCount}</Text>
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
        alignItems: 'center',
    },
    listTitle: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    optionsButton: {
        padding: 5,
    },
    optionsButtonText: {
        fontSize: 22,
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