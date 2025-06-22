import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    ActivityIndicator,
    TouchableOpacity,
    Image
} from 'react-native';
import { databases, config, storage } from '@/lib/appwrite';
import { Query } from "react-native-appwrite";
import { router } from 'expo-router';

// Interfaces para os dados
interface Noticia {
    $id: string;
    $createdAt: string;
    titulo: string;
    imagem?: string;
}

interface Clube {
    $id: string;
    nome: string;
    simbolo?: string;
}

interface Classificacao {
    $id: string;
    nome: string;
    pontos: number;
    jogos?: number;
    vitorias?: number;
    empates?: number;
    derrotas?: number;
    golos_marcados?: number;
    golos_sofridos?: number;
    simbolo?: string;
}

interface Marcadora {
    $id: string;
    nome: string;
    golos: number;
    clube: Clube;
    foto?: string;
}

// Função utilitária para obter URL de imagem (ID ou URL direto)
const getImageSrc = (value: string | undefined): string | undefined => {
    if (!value) return undefined;
    // Se for URL completo, devolve como está
    if (typeof value === 'string' && (value.startsWith('http://') || value.startsWith('https://'))) {
        return value;
    }
    // Se for só ID, gera preview do Appwrite Storage
    return storage.getFilePreview(
        config.colecoes.mediaBucketId,
        value
    ).href;
};

export default function HomeScreen() {
    const [noticias, setNoticias] = useState<Noticia[]>([]);
    const [classificacao, setClassificacao] = useState<Classificacao[]>([]);
    const [marcadoras, setMarcadoras] = useState<Marcadora[]>([]);
    const [clubes, setClubes] = useState<Clube[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                // Buscar clubes para mapear nomes e símbolos
                const clubesData = await databases.listDocuments(
                    config.databaseId,
                    config.colecoes.clubes,
                    [Query.limit(100)]
                );
                setClubes(clubesData.documents as unknown as Clube[]);

                // Buscar notícias
                const noticiasData = await databases.listDocuments(
                    config.databaseId,
                    config.colecoes.noticias,
                    [Query.orderDesc("$createdAt"), Query.limit(5)]
                );
                setNoticias(noticiasData.documents as unknown as Noticia[]);

                // Buscar classificação
                const classificacaoData = await databases.listDocuments(
                    config.databaseId,
                    config.colecoes.classificacao,
                    [Query.orderDesc("pontos"), Query.limit(5)]
                );
                setClassificacao(classificacaoData.documents as unknown as Classificacao[]);

                // Buscar marcadoras
                const marcadorasData = await databases.listDocuments(
                    config.databaseId,
                    config.colecoes.marcadoras,
                    [Query.orderDesc("golos"), Query.limit(5)]
                );
                setMarcadoras(marcadorasData.documents as unknown as Marcadora[]);
            } catch (error) {
                console.error("Erro ao carregar dados:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Utilitário para buscar info do clube por ID
    const getClubeInfo = (clubeId: string): Clube | undefined => {
        return clubes.find(c => c.$id === clubeId);
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#1e40af" />
                <Text style={styles.loadingText}>Carregando dados...</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            {/* Seção de Notícias */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Notícias Recentes</Text>
                {noticias.length === 0 ? (
                    <Text style={styles.emptyText}>Nenhuma notícia encontrada.</Text>
                ) : (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {noticias.map((noticia) => (
                            <TouchableOpacity
                                key={noticia.$id}
                                style={styles.newsCard}
                                onPress={() => router.push({
                                    pathname: "/(tabs)/noticia/[id]",
                                    params: { id: noticia.$id }
                                })}
                            >
                                {noticia.imagem && (
                                    <Image
                                        source={{ uri: getImageSrc(noticia.imagem) }}
                                        style={styles.newsImage}
                                        resizeMode="cover"
                                    />
                                )}
                                <Text style={styles.newsTitle}>{noticia.titulo}</Text>
                                <Text style={styles.newsDate}>
                                    {new Date(noticia.$createdAt).toLocaleDateString('pt-PT')}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                )}
            </View>

            {/* Tabela de Classificação */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Top 5 - Classificação</Text>
                <ScrollView horizontal>
                    <View>
                        <View style={styles.tableHeader}>
                            <Text style={[styles.headerCell, { width: 30 }]}>#</Text>
                            <Text style={[styles.headerCell, { width: 150 }]}>Clube</Text>
                            <Text style={[styles.headerCell, { width: 40 }]}>Pts</Text>
                            <Text style={[styles.headerCell, { width: 40 }]}>J</Text>
                            <Text style={[styles.headerCell, { width: 40 }]}>V</Text>
                            <Text style={[styles.headerCell, { width: 40 }]}>E</Text>
                            <Text style={[styles.headerCell, { width: 40 }]}>D</Text>
                            <Text style={[styles.headerCell, { width: 40 }]}>GM</Text>
                            <Text style={[styles.headerCell, { width: 40 }]}>GS</Text>
                        </View>
                        {classificacao.map((equipa, index) => (
                            <View key={equipa.$id} style={styles.tableRow}>
                                <Text style={[styles.cell, { width: 30, fontWeight: 'bold' }]}>{index + 1}</Text>
                                <View style={[styles.clubInfo, { width: 150 }]}>
                                    {equipa.simbolo && (
                                        <Image
                                            source={{ uri: getImageSrc(equipa.simbolo) }}
                                            style={styles.clubLogo}
                                        />
                                    )}
                                    <Text style={styles.teamName}>{equipa.nome}</Text>
                                </View>
                                <Text style={[styles.cell, { width: 40, fontWeight: 'bold', color: '#059669' }]}>{equipa.pontos}</Text>
                                <Text style={[styles.cell, { width: 40 }]}>{equipa.jogos || 0}</Text>
                                <Text style={[styles.cell, { width: 40 }]}>{equipa.vitorias || 0}</Text>
                                <Text style={[styles.cell, { width: 40 }]}>{equipa.empates || 0}</Text>
                                <Text style={[styles.cell, { width: 40 }]}>{equipa.derrotas || 0}</Text>
                                <Text style={[styles.cell, { width: 40 }]}>{equipa.golos_marcados || 0}</Text>
                                <Text style={[styles.cell, { width: 40 }]}>{equipa.golos_sofridos || 0}</Text>
                            </View>
                        ))}
                    </View>
                </ScrollView>
            </View>

            {/* Top 5 Marcadoras */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Top 5 - Marcadoras</Text>
                {marcadoras.length === 0 ? (
                    <Text style={styles.emptyText}>Nenhuma marcadora encontrada.</Text>
                ) : (
                    <>
                        {marcadoras.map((marcadora, idx) => {
                            // O campo clube da marcadora é um objeto, não apenas o ID
                            const clubeInfo = clubes.find(c => c.$id === marcadora.clube.$id);
                            return (
                                <View key={marcadora.$id} style={styles.scorerItem}>
                                    {/* Foto da marcadora */}
                                    {marcadora.foto ? (
                                        <Image
                                            source={{ uri: getImageSrc(marcadora.foto) }}
                                            style={styles.scorerImage}
                                            resizeMode="cover"
                                            onError={() => console.log('Erro ao carregar imagem:', marcadora.foto)}
                                        />
                                    ) : (
                                        <View style={{
                                            width: 40, height: 40, borderRadius: 20, backgroundColor: '#eee',
                                            marginRight: 10, justifyContent: 'center', alignItems: 'center'
                                        }}>
                                            <Text style={{ color: '#aaa', fontWeight: 'bold', fontSize: 18 }}>
                                                {marcadora.nome ? marcadora.nome[0] : '?'}
                                            </Text>
                                        </View>
                                    )}
                                    <View style={styles.scorerInfo}>
                                        <Text style={styles.scorerName}>{marcadora.nome}</Text>
                                        <Text style={styles.scorerClub}>
                                            {clubeInfo?.nome || marcadora.clube?.nome || "Clube não especificado"}
                                        </Text>
                                    </View>
                                    <Text style={styles.scorerGoals}>{marcadora.golos} golos</Text>
                                </View>
                            );
                        })}
                    </>
                )}
            </View>
        </ScrollView>
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
        fontSize: 16,
        color: '#6b7280',
    },
    section: {
        backgroundColor: '#ffffff',
        margin: 10,
        padding: 15,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1e40af',
        marginBottom: 15,
        textAlign: 'center',
    },
    headerCell: {
        paddingVertical: 8,
        textAlign: 'center',
        fontWeight: 'bold',
        color: '#1e40af',
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#e0e7ff',
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
        alignItems: 'center',
    },
    cell: {
        paddingVertical: 8,
        textAlign: 'center',
        color: '#1f2937',
    },
    clubLogo: {
        width: 30,
        height: 30,
        marginRight: 10,
        borderRadius: 15,
        backgroundColor: '#eee',
    },
    clubInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        width: 110,
    },
    teamName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1f2937',
    },
    scorerItem: {
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
        paddingVertical: 10,
        paddingHorizontal: 4,
    },
    scorerInfo: {
        flex: 1,
        marginLeft: 8,
        justifyContent: 'center',
    },
    scorerName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1f2937',
    },
    scorerClub: {
        fontSize: 13,
        color: '#6b7280',
    },
    scorerGoals: {
        width: 70,
        fontSize: 16,
        fontWeight: 'bold',
        color: '#F56328',
        textAlign: 'right',
    },
    scorerImage: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 10,
        backgroundColor: '#eee',
    },
    emptyText: {
        textAlign: 'center',
        color: '#8B5A96',
        marginVertical: 10,
    },
    newsCard: {
        width: 240,
        marginRight: 16,
        backgroundColor: '#211F62',
        borderRadius: 10,
        padding: 12,
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
    },
    newsImage: {
        width: '100%',
        height: 120,
        borderRadius: 8,
        marginBottom: 8,
    },
    newsTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 6,
    },
    newsDate: {
        fontSize: 12,
        color: '#6b7280',
    },
});
