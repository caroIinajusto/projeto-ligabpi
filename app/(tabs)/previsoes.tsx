import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Image, StyleSheet } from 'react-native';
import { databases, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite';
import { Query } from 'react-native-appwrite';
import { router } from 'expo-router';

interface Jogo {
    $id: string;
    equipa_casa: {
        $id: string;
        nome: string;
        simbolo?: string;
    };
    equipa_fora: {
        $id: string;
        nome: string;
        simbolo?: string;
    };
    data: string;
    is_fictional: boolean;
}

export default function PrevisoesScreen() {
    const [jogos, setJogos] = useState<Jogo[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchJogos = async () => {
            try {
                const hoje = new Date().toISOString();
                const response = await databases.listDocuments(
                    DATABASE_ID,
                    COLLECTIONS.jogos,
                    [
                        Query.greaterThan("data", hoje),
                        Query.equal("is_fictional", true),
                        Query.orderAsc("data"),
                    
                    ]
                );
                setJogos(response.documents as unknown as Jogo[]);
            } catch (error) {
                console.error("Erro ao buscar jogos:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchJogos();
    }, []);

    const renderJogo = ({ item }: { item: Jogo }) => (
        <TouchableOpacity
            style={styles.gameItem}
            onPress={() => router.push(`/previsoes/${item.$id}`)}
        >
            <View style={styles.teamContainer}>
                <Image
                    source={{ uri: item.equipa_casa.simbolo || 'https://via.placeholder.com/40' }}
                    style={styles.teamLogo}
                />
                <Text style={styles.teamName} numberOfLines={1}>
                    {item.equipa_casa.nome}
                </Text>
            </View>

            <Text style={styles.vsText}>VS</Text>

            <View style={styles.teamContainer}>
                <Image
                    source={{ uri: item.equipa_fora.simbolo || 'https://via.placeholder.com/40' }}
                    style={styles.teamLogo}
                />
                <Text style={styles.teamName} numberOfLines={1}>
                    {item.equipa_fora.nome}
                </Text>
            </View>

            <Text style={styles.gameDate}>
                {new Date(item.data).toLocaleDateString('pt-PT', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                })}
            </Text>
            
            {item.is_fictional && (
                <Text style={styles.fictionalTag}>Jogo Imaginário</Text>
            )}
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#1e40af" />
                <Text style={styles.loadingText}>A carregar jogos...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.sectionTitle}>Jogos </Text>
            
            {jogos.length === 0 ? (
                <Text style={styles.emptyText}>Nenhum jogo disponível para previsão</Text>
            ) : (
                <FlatList
                    data={jogos}
                    renderItem={renderJogo}
                    keyExtractor={(item) => item.$id}
                    contentContainerStyle={{ paddingBottom: 20 }}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 16,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff'
    },
    loadingText: {
        marginTop: 10,
        color: '#6b7280',
        fontSize: 16,
    },
    sectionTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 20,
        textAlign: 'center',
    },
    emptyText: {
        textAlign: 'center',
        color: '#6b7280',
        fontSize: 16,
        marginTop: 50,
    },
    gameItem: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 3,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    teamContainer: {
        alignItems: 'center',
        flex: 1,
    },
    teamLogo: {
    width: 40,
    height: 40,
    marginBottom: 4,
    resizeMode: 'contain', 
  },
    teamName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1f2937',
        textAlign: 'center',
    },
    vsText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1e40af',
        marginHorizontal: 16,
    },
    gameDate: {
        fontSize: 12,
        color: '#6b7280',
        position: 'absolute',
        top: 8,
        right: 8,
    },
    fictionalTag: {
        fontSize: 10,
        color: '#059669',
        backgroundColor: '#d1fae5',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        position: 'absolute',
        bottom: 8,
        right: 8,
    },
});
