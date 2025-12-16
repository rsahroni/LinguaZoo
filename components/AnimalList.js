import React from 'react';
import { View, Text, StyleSheet, FlatList, } from 'react-native';
import CustomButton from './CustomButton';
import { toProperCase } from '../utils/formatters';

export default function AnimalList({
    animalList,
    editAnimal,
    editText,
    deleteAnimal,
    language,
    ListHeaderComponent,
}) {
    return (
        <View style={styles.pageContainer}>
            <View style={styles.headerContainer}>{ListHeaderComponent}</View>
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
                                <CustomButton title="Hapus" color="#d9534f" onPress={() => deleteAnimal(item)} />
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
        </View>
    );
}

const styles = StyleSheet.create({
    pageContainer: { flex: 1 },
    headerContainer: {
        paddingHorizontal: 20,
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
    listContentContainer: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 20 },
    row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 8 },
    itemText: { fontSize: 18, fontFamily: 'PlaypenSans-Regular', color: '#333' },
    actions: { flexDirection: 'row', gap: 8 },
    animalNameContainer: {
        flexDirection: 'row',
        alignItems: 'baseline', // Menyelaraskan teks pada baseline
        flex: 1, // Memungkinkan container mengambil ruang yang tersedia
    },
    itemEnglishText: { fontSize: 14, fontFamily: 'PlaypenSans-Regular', color: '#888', marginLeft: 5 }, // Gaya untuk nama Inggris
    input: { fontFamily: 'PlaypenSans-Regular', borderWidth: 1, borderColor: '#333', padding: 8, borderRadius: 8, backgroundColor: '#fff', flex: 1 },
    empty: { fontFamily: 'PlaypenSans-Regular', color: '#666', marginTop: 8 },
    italic: { fontStyle: 'italic', color: '#444' },
});
