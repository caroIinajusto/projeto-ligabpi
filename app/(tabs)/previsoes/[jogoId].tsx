import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Image, ScrollView, StyleSheet, Alert } from 'react-native';
import { databases, DATABASE_ID, COLLECTIONS, ID, Query } from '@/lib/appwrite';
import { router, useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/context/AuthContext';

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

interface Jogadora {
    $id: string;
    nome: string;
    posicao?: string;
    foto?: string;
    clube?: string;
}

export default function PrevisaoJogoScreen() {
    const { user } = useAuth();
    const { jogoId } = useLocalSearchParams();
    const [jogo, setJogo] = useState<Jogo | null>(null);
    const [jogadorasCasa, setJogadorasCasa] = useState<Jogadora[]>([]);
    const [jogadorasFora, setJogadorasFora] = useState<Jogadora[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [previsao, setPrevisao] = useState({
        resultado: '',
        marcadoraId: ''
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const jogoResponse = await databases.getDocument(
                    DATABASE_ID,
                    COLLECTIONS.jogos,
                    jogoId as string
                );
                setJogo(jogoResponse as unknown as Jogo);

                const casaResponse = await databases.listDocuments(
                    DATABASE_ID,
                    COLLECTIONS.jogadoras,
                    [Query.equal('clube', jogoResponse.equipa_casa.$id)]
                );
                setJogadorasCasa(casaResponse.documents as unknown as Jogadora[]);

                const foraResponse = await databases.listDocuments(
                    DATABASE_ID,
                    COLLECTIONS.jogadoras,
                    [Query.equal('clube', jogoResponse.equipa_fora.$id)]
                );
                setJogadorasFora(foraResponse.documents as unknown as Jogadora[]);

            } catch (error) {
                console.error('Erro ao carregar dados:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [jogoId]);

    const handlePrevisao = (resultado: string) => {
        setPrevisao(prev => ({ ...prev, resultado }));
    };

    const handleMarcadora = (marcadoraId: string) => {
        setPrevisao(prev => ({ ...prev, marcadoraId }));
    };

    const submitPrevisao = async () => {
        if (!user || !previsao.resultado) {
            Alert.alert('Erro', 'Preencha o resultado para submeter a previsão');
            return;
        }

        setIsSubmitting(true);

        try {
            // Verificar se já existe previsão para este jogo + utilizador
            const existingPrevisoes = await databases.listDocuments(
                DATABASE_ID,
                COLLECTIONS.previsoes,
                [
                    Query.equal('utilizador', user.id),
                    Query.equal('jogo', jogoId as string)
                ]
            );

            if (existingPrevisoes.documents.length > 0) {
                Alert.alert(
                    'Limite Atingido',
                    'Só podes fazer uma previsão por jogo!'
                );
                return;
            }

            // Criar nova previsão
            const documentData = {
                utilizador: user.id,
                jogo: jogoId as string,
                resultado: previsao.resultado,
                primeira_marcadora: previsao.marcadoraId || null,
                data: new Date().toISOString()
            };

            await databases.createDocument(
                DATABASE_ID,
                COLLECTIONS.previsoes,
                ID.unique(),
                documentData
            );

            Alert.alert('Sucesso', 'Previsão registada com sucesso!');
            router.replace('/previsoes');
        } catch (error) {
            console.error('Erro ao registrar previsão:', error);
            const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
            Alert.alert('Erro', 'Erro ao registrar previsão: ' + errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading || !jogo) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#1e40af" />
            </View>
        );
    }

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.gameHeader}>
                <View style={styles.teamContainer}>
                    <Image
                        source={{ uri: jogo.equipa_casa.simbolo || 'https://via.placeholder.com/60' }}
                        style={styles.largeTeamLogo}
                    />
                    <Text style={styles.teamName}>{jogo.equipa_casa.nome}</Text>
                </View>

                <Text style={styles.vsTextLarge}>VS</Text>

                <View style={styles.teamContainer}>
                    <Image
                        source={{ uri: jogo.equipa_fora.simbolo || 'https://via.placeholder.com/60' }}
                        style={styles.largeTeamLogo}
                    />
                    <Text style={styles.teamName}>{jogo.equipa_fora.nome}</Text>
                </View>
            </View>

            <Text style={styles.gameDate}>
                {new Date(jogo.data).toLocaleDateString('pt-PT', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                })}
            </Text>

            <Text style={styles.sectionTitle}>Resultado Previsto</Text>
            <View style={styles.betOptions}>
                {['casa', 'empate', 'fora'].map((option) => (
                    <TouchableOpacity
                        key={option}
                        style={[
                            styles.betButton,
                            previsao.resultado === option && styles.betButtonSelected
                        ]}
                        onPress={() => handlePrevisao(option)}
                    >
                        <Text style={styles.betButtonText}>
                            {option === 'casa' ? 'Vitória Casa' : 
                             option === 'fora' ? 'Vitória Fora' : 'Empate'}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <Text style={styles.sectionTitle}>1ª Marcadora (Opcional)</Text>
            
            <Text style={styles.subSectionTitle}>{jogo.equipa_casa.nome}</Text>
            <View style={styles.playersGrid}>
                {jogadorasCasa.map(jogadora => (
                    <TouchableOpacity
                        key={jogadora.$id}
                        style={[
                            styles.playerButton,
                            previsao.marcadoraId === jogadora.$id && styles.playerButtonSelected
                        ]}
                        onPress={() => handleMarcadora(jogadora.$id)}
                    >
                        {jogadora.foto ? (
                            <Image
                                source={{ uri: jogadora.foto }}
                                style={styles.playerImage}
                            />
                        ) : (
                            <View style={styles.playerInitialContainer}>
                                <Text style={styles.playerInitial}>
                                    {jogadora.nome.charAt(0)}
                                </Text>
                            </View>
                        )}
                        <Text 
                            style={styles.playerName} 
                            numberOfLines={1}
                        >
                            {jogadora.nome}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <Text style={styles.subSectionTitle}>{jogo.equipa_fora.nome}</Text>
            <View style={styles.playersGrid}>
                {jogadorasFora.map(jogadora => (
                    <TouchableOpacity
                        key={jogadora.$id}
                        style={[
                            styles.playerButton,
                            previsao.marcadoraId === jogadora.$id && styles.playerButtonSelected
                        ]}
                        onPress={() => handleMarcadora(jogadora.$id)}
                    >
                        {jogadora.foto ? (
                            <Image
                                source={{ uri: jogadora.foto }}
                                style={styles.playerImage}
                            />
                        ) : (
                            <View style={styles.playerInitialContainer}>
                                <Text style={styles.playerInitial}>
                                    {jogadora.nome.charAt(0)}
                                </Text>
                            </View>
                        )}
                        <Text 
                            style={styles.playerName} 
                            numberOfLines={1}
                        >
                            {jogadora.nome}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <TouchableOpacity
                style={[
                    styles.submitButton, 
                    (!previsao.resultado || isSubmitting) && styles.submitButtonDisabled
                ]}
                disabled={!previsao.resultado || isSubmitting}
                onPress={submitPrevisao}
            >
                {isSubmitting ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.submitButtonText}>
                        Confirmar Previsão
                    </Text>
                )}
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        backgroundColor: '#fff',
        padding: 16,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff'
    },
    gameHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        paddingVertical: 20,
    },
    teamContainer: {
        alignItems: 'center',
        flex: 1,
    },
    largeTeamLogo: {
        width: 60,
        height: 60,
        borderRadius: 30,
        marginBottom: 8,
        resizeMode: 'contain', 
    },
    teamName: {
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
        color: '#1f2937',
    },
    vsTextLarge: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1e40af',
        marginHorizontal: 20,
    },
    gameDate: {
        fontSize: 16,
        textAlign: 'center',
        color: '#6b7280',
        marginBottom: 30,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 16,
        marginTop: 20,
    },
    subSectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1f2937',
        marginBottom: 12,
        marginTop: 16,
    },
    betOptions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    betButton: {
        flex: 1,
        backgroundColor: '#f3f4f6',
        paddingVertical: 12,
        paddingHorizontal: 8,
        borderRadius: 8,
        marginHorizontal: 4,
        alignItems: 'center',
    },
    betButtonSelected: {
        backgroundColor: '#1e40af',
    },
    betButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1f2937',
        textAlign: 'center',
    },
    playersGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    playerButton: {
        width: '48%',
        backgroundColor: '#f9fafb',
        borderRadius: 8,
        padding: 12,
        marginBottom: 12,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'transparent',
    },
    playerButtonSelected: {
        borderColor: '#1e40af',
        backgroundColor: '#eff6ff',
    },
    playerImage: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginBottom: 8,
    },
    playerInitialContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#e5e7eb',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    playerInitial: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1f2937',
    },
    playerName: {
        fontSize: 14,
        fontWeight: '500',
        color: '#1f2937',
        textAlign: 'center',
    },
    submitButton: {
        backgroundColor: '#1e40af',
        paddingVertical: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 30,
        marginBottom: 20,
    },
    submitButtonDisabled: {
        backgroundColor: '#9ca3af',
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
