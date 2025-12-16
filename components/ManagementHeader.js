import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import CustomButton from './CustomButton';

export default function ManagementHeader({ onBack, onAddAnimal, isAdding, animalCount, onReset }) {
    const [newAnimal, setNewAnimal] = useState('');

    const handleAdd = async () => { // Ubah menjadi async
        if (newAnimal.trim()) {
            const success = await onAddAnimal(newAnimal); // Tunggu hasil dari onAddAnimal
            if (success) {
                setNewAnimal(''); // Kosongkan input hanya jika berhasil
            }
        }
    };

    return (
        <>
            <View style={styles.headerRow}>
                <Text style={styles.title}>Koleksi Hewan</Text>
                <CustomButton title="Kembali" onPress={onBack} color="#848484" />
            </View>
            <Text style={styles.label}>Tambah hewan (Indonesia):</Text>
            <View style={styles.inputContainer}>
                <TextInput placeholder="Contoh: KUCING" value={newAnimal} onChangeText={setNewAnimal} style={styles.input} onSubmitEditing={handleAdd} editable={!isAdding} />
                {newAnimal.length > 0 && !isAdding && (
                    <TouchableOpacity onPress={() => setNewAnimal('')} style={styles.clearButton}>
                        <Text style={styles.clearButtonText}>X</Text>
                    </TouchableOpacity>
                )}
            </View>
            <CustomButton title={isAdding ? "Memeriksa..." : "Tambah"} onPress={handleAdd} disabled={isAdding || newAnimal.trim() === ''} />
            <View style={styles.listTitleContainer}>
                <Text style={[styles.title, { marginTop: 10, fontSize: 18, marginBottom: 0 }]}>Daftar Hewan</Text>
                <View style={styles.rightHeaderItems}>
                    <Text style={styles.countText}>Total: {animalCount}</Text>
                    <CustomButton title="Reset" onPress={onReset} color="#e74c3c" style={styles.resetButton} textStyle={styles.resetButtonText} />
                </View>
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    title: { fontSize: 24, fontFamily: 'PlaypenSans-Bold', marginBottom: 10, color: '#FF6F61' },
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
    input: { flex: 1, fontFamily: 'PlaypenSans-Regular', padding: 10 },
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
    clearButton: {
        padding: 10,
    },
    clearButtonText: {
        color: '#888',
        fontSize: 16,
        fontFamily: 'PlaypenSans-Bold',
    },
});