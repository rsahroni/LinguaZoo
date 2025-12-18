import React from 'react';
import { View, Text, StyleSheet, FlatList, } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomButton from './CustomButton';
import { toProperCase } from '../utils/formatters';

export default function AnimalList({
    animalList,
    deleteAnimal,
    ListHeaderComponent,
    onClose,
}) {
    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.headerContainer}>
                {ListHeaderComponent}
            </View>
            <FlatList
                contentContainerStyle={styles.listContentContainer}
                data={animalList}
                keyExtractor={(item, idx) => `${item.IND}-${item.ENG}-${idx}`}
                renderItem={({ item }) => {
                    return (
                        <View style={styles.row}>
                            {/* Mengelompokkan teks nama hewan agar tetap bersama */}
                            <View style={styles.animalNameContainer}>
                                <Text style={styles.itemText}>{item.IND}</Text>
                                <Text style={styles.itemEnglishText}>{toProperCase(item.ENG)}</Text>
                            </View>
                            <View style={styles.actions}>
                                <CustomButton title="Hapus" color="#d9534f" onPress={() => deleteAnimal(item)} style={styles.deleteButton} textStyle={styles.deleteButtonText} />
                            </View>
                        </View>
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
    },
    itemEnglishText: { fontSize: 13, fontStyle: 'italic', fontFamily: 'PlaypenSans-Regular', color: '#888', marginLeft: 8 }, // Gaya untuk nama Inggris
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
});
