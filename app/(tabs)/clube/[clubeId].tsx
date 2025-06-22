import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, FlatList, Image, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Stack } from 'expo-router';
import { databases, DATABASE_ID, COLLECTIONS } from '../../../lib/appwrite';
import { Query } from 'react-native-appwrite';

interface Clube {
    $id: string;
    nome: string;
    cidade?: string;
    simbolo?: string;
    fundacao?: string;
    treinador?: string;
}

interface Jogadora {
    $id: string;
    nome: string;
    posicao?: string;
    foto?: string;
    clube?: string;
}

export default function ClubeScreen() {
    const { clubeId } = useLocalSearchParams<{ clubeId: string }>();
    const router = useRouter();
    const [clube, setClube] = useState<Clube | null>(null);
    const [jogadoras, setJogadoras] = useState<Jogadora[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchClubeInfo();
    }, [clubeId]);

    const fetchClubeInfo = async () => {
        try {
            const clubeResp = await databases.getDocument(
                DATABASE_ID,
                COLLECTIONS.clubes,
                clubeId
            ) as unknown as Clube;
            setClube(clubeResp);

            const jogadorasResp = await databases.listDocuments(
                DATABASE_ID,
                COLLECTIONS.jogadoras,
                [Query.equal('clube', clubeId)]
            );
            setJogadoras(jogadorasResp.documents as unknown as Jogadora[]);
            setLoading(false);
        } catch (error) {
            console.error('Erro ao buscar info do clube:', error);
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#1e40af" />
                <Text style={styles.loadingText}>A carregar informações...</Text>
            </View>
        );
    }

    if (!clube) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Clube não encontrado.</Text>
            </View>
        );
    }

    return (
        <>
            <Stack.Screen options={{ title: 'Plantel' }} />
            <FlatList
                data={jogadoras}
                keyExtractor={item => item.$id}
                ListHeaderComponent={
                    <View style={styles.header}>
                        {clube.simbolo && (
                            <Image source={{ uri: clube.simbolo }} style={styles.logo} />
                        )}
                        <Text style={styles.clubName}>{clube.nome}</Text>
                        <Text style={styles.clubCity}>{clube.cidade}</Text>
                        {clube.fundacao && <Text style={styles.clubInfo}>Fundação: {clube.fundacao}</Text>}
                        {clube.treinador && <Text style={styles.clubInfo}>Treinador(a): {clube.treinador}</Text>}
                        <Text style={styles.sectionTitle}>Jogadoras</Text>
                        {jogadoras.length === 0 && (
                            <Text style={styles.noPlayers}>Sem jogadoras registadas.</Text>
                        )}
                    </View>
                }
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.playerRow}
                        onPress={() =>
                            router.push({
                                pathname: `/jogadora/${item.$id}`,
                                params: { jogadoranome: item.nome }
                            })
                        }
                    >
                        {item.foto && (
                            <Image source={{ uri: item.foto }} style={styles.playerPhoto} />
                        )}
                        <View style={{ flex: 1 }}>
                            <Text style={styles.playerName}>{item.nome}</Text>
                            <Text style={styles.playerInfo}>{item.posicao}</Text>
                        </View>
                    </TouchableOpacity>
                )}
                contentContainerStyle={styles.container}
                showsVerticalScrollIndicator={false}
            />
        </>
    );
}


const styles = StyleSheet.create({
    container: {
        padding: 16,
        backgroundColor: '#f8fafc',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
    },
    loadingText: {
        marginTop: 10,
        color: '#6b7280',
    },
    header: {
        alignItems: 'center',
        marginBottom: 20,
    },
    logo: {
        width: 70,
        height: 70,
        borderRadius: 35,
        marginBottom: 10,
        backgroundColor: '#e5e7eb',
    },
    clubName: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#1e40af',
        marginBottom: 2,
    },
    clubCity: {
        fontSize: 16,
        color: '#6b7280',
        marginBottom: 4,
    },
    clubInfo: {
        fontSize: 14,
        color: '#334155',
        marginBottom: 2,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1e40af',
        marginTop: 16,
        marginBottom: 8,
    },
    noPlayers: {
        color: '#6b7280',
        fontStyle: 'italic',
        textAlign: 'center',
        marginTop: 8,
    },
    playerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 10,
        marginBottom: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 2,
        elevation: 1,
    },
    playerPhoto: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 10,
        backgroundColor: '#e5e7eb',
    },
    playerName: {
        fontWeight: 'bold',
        fontSize: 15,
        color: '#1e293b',
    },
    playerInfo: {
        color: '#64748b',
        fontSize: 13,
    },
});
