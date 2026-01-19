import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomButton from './CustomButton';
import { toProperCase } from '../utils/formatters';

export default function AnimalList({
    animalList,
    deleteAnimal,
    ListHeaderComponent,
    onAddClue,
    onDeleteClue,
    onClose,
}) {
    const [selectedAnimal, setSelectedAnimal] = useState(null);
    const [newClue, setNewClue] = useState('');

    const currentAnimal = selectedAnimal ? animalList.find(a => a.IND === selectedAnimal.IND) : null;

    // Sort the list alphabetically by Indonesian name
    const sortedAnimalList = [...animalList].sort((a, b) => a.IND.localeCompare(b.IND));

    const handleSaveClue = () => {
        if (newClue.trim() && currentAnimal) {
            onAddClue(currentAnimal.IND, newClue.trim());
            setNewClue('');
        }
    };

    const handleDeleteClue = (clueToDelete) => {
        Alert.alert(
            "Hapus Clue",
            `Yakin mau hapus clue "${clueToDelete}"?`,
            [
                { text: "Batal", style: "cancel" },
                { text: "Hapus", onPress: () => onDeleteClue(currentAnimal.IND, clueToDelete), style: "destructive" }
            ]
        );
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.headerContainer}>
                {ListHeaderComponent}
            </View>
            <FlatList
                contentContainerStyle={styles.listContentContainer}
                data={sortedAnimalList}
                keyExtractor={(item, idx) => `${item.IND}-${item.ENG}-${idx}`}
                renderItem={({ item }) => {
                    return (
                        <TouchableOpacity style={styles.row} onPress={() => setSelectedAnimal(item)}>
                            {/* Mengelompokkan teks nama hewan agar tetap bersama */}
                            <View style={styles.animalNameContainer}>
                                <Text style={styles.itemText}>{item.IND}</Text>
                                <Text style={styles.itemEnglishText}>{`${toProperCase(item.ENG)}  `}</Text>
                            </View>
                            <View style={styles.actions}>
                                <CustomButton title="Hapus" color="#d9534f" onPress={() => deleteAnimal(item)} style={styles.deleteButton} textStyle={styles.deleteButtonText} />
                            </View>
                        </TouchableOpacity>
                    );
                }}
                ListEmptyComponent={
                    <Text style={styles.empty}>
                        Belum ada hewan. <Text style={styles.italic}>Tambahkan di atas.</Text>
                    </Text>
                }
            />
            <View style={styles.footer}>
                <CustomButton title="Tutup" onPress={onClose} />
            </View>

            {/* Modal Detail Hewan & Clue */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={!!selectedAnimal}
                onRequestClose={() => setSelectedAnimal(null)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>{currentAnimal?.IND}</Text>
                            <Text style={styles.modalSubtitle}>{` ${toProperCase(currentAnimal?.ENG)}  `}</Text>
                        </View>

                        <Text style={styles.sectionLabel}>Daftar Clue:</Text>
                        <ScrollView style={styles.clueList}>
                            {currentAnimal?.CLUES && currentAnimal.CLUES.length > 0 ? (
                                currentAnimal.CLUES.map((c, i) => (
                                    <View key={i} style={styles.clueItem}>
                                        <Text style={styles.clueText}>• {c}</Text>
                                        <TouchableOpacity onPress={() => handleDeleteClue(c)} style={styles.deleteClueButton}>
                                            <Text style={styles.deleteClueText}>🗑️</Text>
                                        </TouchableOpacity>
                                    </View>
                                ))
                            ) : (
                                <Text style={styles.emptyClueText}>Belum ada clue tersimpan.</Text>
                            )}
                        </ScrollView>

                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.input}
                                placeholder="Tambah clue baru..."
                                value={newClue}
                                onChangeText={setNewClue}
                            />
                            <CustomButton title="Simpan" onPress={handleSaveClue} disabled={!newClue.trim()} style={styles.saveButton} />
                        </View>

                        <CustomButton title="Tutup" onPress={() => setSelectedAnimal(null)} color="#e74c3c" style={{ marginTop: 10 }} />
                    </View>
                </View>
            </Modal>

        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#FFF8E7' },
    headerContainer: {
        paddingTop: 20,
        paddingBottom: 10, // Ganti marginBottom menjadi paddingBottom
        backgroundColor: '#FFF8E7', // Warna yang sama dengan latar belakang utama
        // Bayangan untuk iOS
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        // Bayangan untuk Android
        elevation: 3,
    },
    listContentContainer: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 40 },
    row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 6 },
    itemText: { fontSize: 17, fontFamily: 'PlaypenSans-Regular', color: '#333' },
    actions: { flexDirection: 'row', gap: 8 },
    animalNameContainer: {
        flexDirection: 'row',
        alignItems: 'baseline', // Menyelaraskan teks pada baseline
        flex: 1, // Memungkinkan container mengambil ruang yang tersedia
        flexWrap: 'wrap', // Agar teks turun ke bawah jika terlalu panjang
    },
    // Tambahkan paddingRight untuk mencegah huruf miring (italic) terpotong
    itemEnglishText: { fontSize: 13, fontStyle: 'italic', fontFamily: 'PlaypenSans-Regular', color: '#888', marginLeft: 8, paddingRight: 10 },
    empty: { fontFamily: 'PlaypenSans-Regular', color: '#666', marginTop: 8 },
    italic: { fontStyle: 'italic', color: '#444' },
    footer: {
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
        backgroundColor: '#FFF8E7',
    },
    deleteButton: {
        paddingVertical: 6,
        paddingHorizontal: 10,
    },
    deleteButtonText: {
        fontSize: 14,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '85%',
        maxHeight: '80%',
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 20,
        elevation: 5,
    },
    modalHeader: {
        alignItems: 'center',
        marginBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        paddingBottom: 10,
    },
    modalTitle: { fontSize: 24, fontFamily: 'PlaypenSans-Bold', color: '#FF6F61' },
    modalSubtitle: { fontSize: 16, fontFamily: 'PlaypenSans-Regular', fontStyle: 'italic', color: '#888' },
    sectionLabel: { fontSize: 16, fontFamily: 'PlaypenSans-Bold', color: '#444', marginBottom: 5 },
    clueList: { maxHeight: 200, marginBottom: 15 },
    clueItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
        paddingHorizontal: 8,
        paddingVertical: 8,
        backgroundColor: '#f9f9f9',
        borderRadius: 8,
    },
    clueText: { fontSize: 14, fontFamily: 'PlaypenSans-Regular', color: '#555', flex: 1, marginRight: 10 },
    deleteClueText: { fontSize: 16 },
    emptyClueText: { fontSize: 14, fontFamily: 'PlaypenSans-Regular', color: '#999', fontStyle: 'italic' },
    inputContainer: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 10,
    },
    input: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 8,
        fontFamily: 'PlaypenSans-Regular',
        fontSize: 14,
    },
    saveButton: {
        paddingVertical: 8,
        paddingHorizontal: 15,
        backgroundColor: '#2ecc71',
    },
});
