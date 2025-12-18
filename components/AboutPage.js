import React from 'react';
import { View, Text, StyleSheet, Modal, ScrollView, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppHeader from './AppHeader';
import CustomButton from './CustomButton';

export default function AboutPage({ isVisible, onClose, appVersion }) {
    return (
        <Modal
            animationType="slide"
            transparent={false}
            visible={isVisible}
            onRequestClose={onClose}
        >
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.pageContainer}>
                    <ScrollView contentContainerStyle={styles.container}>
                        <AppHeader size="large" />
                        <Text style={styles.version}>Versi {appVersion}</Text>

                        <Text style={styles.sectionTitle}>Tentang LinguaZoo</Text>
                        <Text style={styles.paragraph}>
                            LinguaZoo adalah permainan tebak kata yang dirancang untuk membantu anak-anak belajar nama-nama hewan dalam Bahasa Indonesia dan Bahasa Inggris dengan cara yang menyenangkan dan interaktif.
                        </Text>

                        <Text style={styles.sectionTitle}>Kredit</Text>
                        <Text style={styles.paragraph}>
                            Dibuat dengan ❤️ oleh Rahmat Sahroni
                        </Text>
                        <Text style={styles.paragraph}>
                            • Font "Playpen Sans" oleh Google Fonts.
                        </Text>
                        <Text style={styles.paragraph}>
                            • API terjemahan oleh MyMemory.
                        </Text>
                        <Text style={styles.paragraph}>
                            • API kamus oleh DictionaryAPI.dev.
                        </Text>
                    </ScrollView>
                    <View style={styles.footer}>
                        <CustomButton title="Tutup" onPress={onClose} />
                    </View>
                </View>
            </SafeAreaView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#FFF8E7' },
    pageContainer: { flex: 1 },
    container: { padding: 20, paddingBottom: 40 },
    version: {
        textAlign: 'center',
        marginTop: -10,
        marginBottom: 20,
        fontFamily: 'PlaypenSans-Regular',
        color: '#888',
    },
    sectionTitle: {
        fontSize: 20,
        fontFamily: 'PlaypenSans-Bold',
        color: '#FF6F61',
        marginTop: 10,
        marginBottom: 5,
    },
    paragraph: {
        fontSize: 16,
        fontFamily: 'PlaypenSans-Regular',
        color: '#444',
        lineHeight: 24,
        marginBottom: 8,
    },
    footer: {
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
    },
});