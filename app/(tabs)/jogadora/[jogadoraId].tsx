import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Image, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Stack } from 'expo-router';
import { databases, DATABASE_ID, COLLECTIONS } from '../../../lib/appwrite';

interface Jogadora {
    $id: string;
    nome: string;
    posicao: string;
    idade: number;
    numero: number;
    nacionalidade?: string;
    altura?: number;
    pe_preferido?: string;
    jogos?: number;
    golos?: number;
    assistencias?: number;
    foto?: string;
}

export default function JogadoraScreen() {
    const { jogadoraId } = useLocalSearchParams<{ jogadoraId: string }>();
    const [jogadora, setJogadora] = useState<Jogadora | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchJogadoraInfo();
    }, [jogadoraId]);

    const fetchJogadoraInfo = async () => {
        try {
            const resp = await databases.getDocument(
                DATABASE_ID,
                COLLECTIONS.jogadoras,
                jogadoraId as string
            );
            setJogadora(resp as unknown as Jogadora);
        } catch (error) {
            setJogadora(null);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#2236b6" />
                <Text style={styles.loadingText}>A carregar jogadora...</Text>
            </View>
        );
    }

    if (!jogadora) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Jogadora não encontrada.</Text>
            </View>
        );
    }

    return (
        <>
            <Stack.Screen options={{ title: jogadora.nome || 'Jogadora' }} />
            <ScrollView style={{ flex: 1, backgroundColor: '#f4f6fb' }}>
                <View style={styles.header}>
                    <View style={styles.photoWrapper}>
                        {jogadora.foto && (
                            <Image
                                source={{ uri: jogadora.foto }}
                                style={styles.playerPhoto}
                            />
                        )}
                    </View>
                    <Text style={styles.playerName}>{jogadora.nome}</Text>
                    <Text style={styles.playerPosition}>{jogadora.posicao}</Text>
                </View>

                <View style={styles.infoBlock}>
                    <Text style={styles.sectionTitle}>Dados Pessoais</Text>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Idade:</Text>
                        <Text style={styles.infoValue}>{jogadora.idade}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Número:</Text>
                        <Text style={styles.infoValue}>{jogadora.numero}</Text>
                    </View>
                    {jogadora.nacionalidade && (
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Nacionalidade:</Text>
                            <Text style={styles.infoValue}>{jogadora.nacionalidade}</Text>
                        </View>
                    )}
                    {jogadora.altura && (
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Altura:</Text>
                            <Text style={styles.infoValue}>{jogadora.altura} cm</Text>
                        </View>
                    )}
                    {jogadora.pe_preferido && (
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Pé preferido:</Text>
                            <Text style={styles.infoValue}>{jogadora.pe_preferido}</Text>
                        </View>
                    )}
                </View>

                <View style={styles.infoBlock}>
                    <Text style={styles.sectionTitle}>Estatísticas</Text>
                    {jogadora.jogos !== undefined && (
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Jogos:</Text>
                            <Text style={styles.infoValue}>{jogadora.jogos}</Text>
                        </View>
                    )}
                    {jogadora.golos !== undefined && (
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Golos:</Text>
                            <Text style={styles.infoValue}>{jogadora.golos}</Text>
                        </View>
                    )}
                    {jogadora.assistencias !== undefined && (
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Assistências:</Text>
                            <Text style={styles.infoValue}>{jogadora.assistencias}</Text>
                        </View>
                    )}
                </View>
            </ScrollView>
        </>
    );
}


const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f4f6fb',
    },
    loadingText: {
        marginTop: 10,
        color: '#6b7280',
    },
    header: {
        alignItems: 'center',
        backgroundColor: '#2236b6',
        paddingBottom: 32,
        paddingTop: 48,
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
        marginBottom: -60,
    },
    photoWrapper: {
        backgroundColor: '#fff',
        borderRadius: 70,
        padding: 6,
        marginBottom: 8,
        elevation: 6,
        shadowColor: '#2236b6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
    },
    playerPhoto: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#e5e7eb',
        resizeMode: 'contain',
    },
    playerName: {
        fontWeight: 'bold',
        fontSize: 24,
        color: '#fff',
        marginTop: 12,
    },
    playerPosition: {
        fontSize: 16,
        color: '#e0e7ff',
        marginBottom: 10,
    },
    infoBlock: {
        backgroundColor: '#fff',
        borderRadius: 18,
        padding: 20,
        marginHorizontal: 18,
        marginTop: 70,
        marginBottom: 18,
        elevation: 2,
        shadowColor: '#2236b6',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2236b6',
        marginBottom: 14,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    infoLabel: {
        color: '#64748b',
        fontSize: 16,
        fontWeight: '500',
    },
    infoValue: {
        color: '#2236b6',
        fontSize: 16,
        fontWeight: '600',
    },
});
