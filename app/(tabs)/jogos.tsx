import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Image, TouchableOpacity } from 'react-native';
import { databases, config } from '@/lib/appwrite';
import { Query } from 'react-native-appwrite';

interface Equipa {
    nome: string;
    simbolo?: string;
}

interface Jogo {
    $id: string;
    jornada: number;
    data: string;
    equipa_casa?: Equipa;
    equipa_fora?: Equipa;
    resultado?: string;
    estado?: string;
    estadio?: string;
    arbitro?: string;
}

export default function JogosScreen() {
    const [jogos, setJogos] = useState<Jogo[]>([]);
    const [jornadas, setJornadas] = useState<number[]>([]);
    const [selectedJornada, setSelectedJornada] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchJogos();
    }, []);

    const fetchJogos = async () => {
        try {
            const response = await databases.listDocuments(
                config.databaseId,
                config.colecoes.jogos,
                [
                    Query.orderAsc('jornada'),
                    Query.orderAsc('data'),
                    Query.limit(1000)
                ]
            );
            setJogos(response.documents as unknown as Jogo[]);

            const jornadasUnicas = Array.from(new Set(response.documents.map((j: any) => j.jornada))).sort((a, b) => a - b);
            setJornadas(jornadasUnicas);
            setSelectedJornada(jornadasUnicas[jornadasUnicas.length - 1]);
            setLoading(false);
        } catch (error) {
            console.error('Erro ao buscar jogos:', error);
            setLoading(false);
        }
    };

    const jogosFiltrados = jogos.filter(j => j.jornada === selectedJornada);

    const renderJornada = ({ item }: { item: number }) => (
        <TouchableOpacity
            style={[
                styles.jornadaButton,
                selectedJornada === item && styles.jornadaButtonSelected
            ]}
            onPress={() => setSelectedJornada(item)}
            activeOpacity={0.8}
        >
            <Text style={[
                styles.jornadaButtonText,
                selectedJornada === item && styles.jornadaButtonTextSelected
            ]}>
                JORNADA {item}
            </Text>
        </TouchableOpacity>
    );

    const renderJogo = ({ item }: { item: Jogo }) => {
        const dataJogo = new Date(item.data);
        const dataFormatada = dataJogo.toLocaleDateString('pt-PT');
        const horaFormatada = dataJogo.toLocaleTimeString('pt-PT', {
            hour: '2-digit',
            minute: '2-digit'
        });

        return (
            <View style={styles.gameItem}>
                <View style={styles.gameHeader}>
                    <Text style={styles.gameDate}>{dataFormatada}</Text>
                    <Text style={styles.gameTime}>{horaFormatada}</Text>
                </View>
                <View style={styles.matchContainer}>
                    <View style={styles.teamContainer}>
                        {item.equipa_casa?.simbolo && (
                            <Image
                                source={{ uri: item.equipa_casa.simbolo }}
                                style={styles.teamLogo}
                            />
                        )}
                        <Text style={styles.teamName}>
                            {item.equipa_casa?.nome || "Equipa desconhecida"}
                        </Text>
                    </View>
                    <View style={styles.scoreContainer}>
                        <Text style={styles.score}>
                            {item.resultado || "—"}
                        </Text>
                        {item.estado ? (
                            <Text style={styles.status}>{item.estado}</Text>
                        ) : null}
                    </View>
                    <View style={styles.teamContainer}>
                        {item.equipa_fora?.simbolo && (
                            <Image
                                source={{ uri: item.equipa_fora.simbolo }}
                                style={styles.teamLogo}
                            />
                        )}
                        <Text style={styles.teamName}>
                            {item.equipa_fora?.nome || "Equipa desconhecida"}
                        </Text>
                    </View>
                </View>
                
            </View>
        );
    };

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
            <FlatList
                data={jornadas}
                renderItem={renderJornada}
                keyExtractor={item => String(item)}
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.jornadasFlatList}
                contentContainerStyle={styles.jornadasContent}
                getItemLayout={(_, index) => ({
                    length: 110,
                    offset: 110 * index,
                    index,
                })}
            />
            <FlatList
                data={jogosFiltrados}
                renderItem={renderJogo}
                keyExtractor={item => item.$id}
                contentContainerStyle={styles.gamesList}
                ListEmptyComponent={
                    <Text style={styles.noGames}>Sem jogos para esta jornada.</Text>
                }
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
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
    jornadasFlatList: {
        height: 48,
        marginTop: 10,
    },
    jornadasContent: {
        alignItems: 'center',
        paddingHorizontal: 8,
    },
    jornadaButton: {
        width: 110,
        height: 36,
        backgroundColor: '#e5e7eb',
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    jornadaButtonSelected: {
        backgroundColor: '#1e40af',
    },
    jornadaButtonText: {
        color: '#334155',
        fontWeight: 'bold',
        fontSize: 15,
    },
    jornadaButtonTextSelected: {
        color: '#fff',
    },
    gamesList: {
        padding: 16,
    },
    gameItem: {
        backgroundColor: '#ffffff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 3,
    },
    gameHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
        paddingBottom: 8,
    },
    gameDate: {
        fontSize: 15,
        color: '#8B5A96',
        fontWeight: '600',
    },
    gameTime: {
        fontSize: 14,
        color: '#1e40af',
        fontWeight: '500',
    },
    matchContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginVertical: 12,
    },
    teamContainer: {
        flex: 1,
        alignItems: 'center',
    },
    teamLogo: {
        width: 40,
        height: 40,
        marginBottom: 8,
        resizeMode: 'contain',
    },
    teamName: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1e40af',
        textAlign: 'center',
    },
    scoreContainer: {
        alignItems: 'center',
        marginHorizontal: 16,
    },
    score: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#8B5A96',
        marginVertical: 8,
    },
    status: {
        fontSize: 12,
        color: '#059669',
        fontWeight: '500',
    },
    footer: {
        borderTopWidth: 1,
        borderTopColor: '#e5e7eb',
        paddingTop: 12,
        marginTop: 12,
    },
    stadium: {
        fontSize: 13,
        color: '#6b7280',
        textAlign: 'center',
    },
    referee: {
        fontSize: 12,
        color: '#6b7280',
        textAlign: 'center',
        marginTop: 4,
    },
    noGames: {
        color: '#6b7280',
        fontSize: 16,
        textAlign: 'center',
        marginTop: 40,
    },
});
