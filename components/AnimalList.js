import React from 'react';
import { View, Text, StyleSheet, TextInput, Button, FlatList } from 'react-native';

export default function AnimalList({
    animalList,
    editAnimal,
    editText,
    setEditText,
    startEdit,
    confirmEdit,
    deleteAnimal,
    language,
    ListHeaderComponent,
}) {
    return (
        <View style={styles.listContainer}>
            <FlatList
                contentContainerStyle={styles.container}
                data={animalList}
                ListHeaderComponent={ListHeaderComponent}
                ListHeaderComponentStyle={styles.headerContainer}
                keyExtractor={(item, idx) => `${item.IND}-${item.ENG}-${idx}`}
                renderItem={({ item }) => {
                    const display = language === 'IND' ? item.IND : item.ENG;
                    const isEditing = editAnimal && editAnimal.IND === item.IND;
                    return (
                        <View style={styles.row}>
                            {isEditing ? (
                                <>
                                    <TextInput
                                        value={editText}
                                        onChangeText={setEditText}
                                        style={styles.input}
                                    />
                                    <View style={styles.actions}>
                                        <Button title="Simpan" onPress={confirmEdit} />
                                        <Button title="Batal" onPress={() => startEdit(null)} />
                                    </View>
                                </>
                            ) : (
                                <>
                                    <Text style={styles.itemText}>{display}</Text>
                                    <View style={styles.actions}>
                                        <Button title="Edit" onPress={() => startEdit(item)} />
                                        <Button title="Hapus" color="#d9534f" onPress={() => deleteAnimal(item)} />
                                    </View>
                                </>
                            )}
                        </View>
                    );
                }}
                ListEmptyComponent={<Text style={styles.empty}>Belum ada hewan. Tambahkan di atas.</Text>}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    listContainer: { flex: 1 },
    container: { padding: 20 },
    row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 8 },
    itemText: { fontSize: 16, color: '#333', flex: 1 },
    actions: { flexDirection: 'row', gap: 8 },
    input: { borderWidth: 1, borderColor: '#333', padding: 8, borderRadius: 8, backgroundColor: '#fff', flex: 1 },
    empty: { color: '#666', fontStyle: 'italic', marginTop: 8 },
});
