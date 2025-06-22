import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    ActivityIndicator,
    ScrollView,
    Image
} from 'react-native';
import { databases, DATABASE_ID, COLLECTIONS } from '../../lib/appwrite';
import { Query } from 'react-native-appwrite';

type ClassificacaoItem = {
    $id: string;
    nome: string;
    clube?: { simbolo?: string };
    jogos: number;
    vitorias: number;
    empates: number;
    derrotas: number;
    golos_marcados: number;
    golos_sofridos: number;
    pontos: number;
};

export default function ClassificacaoScreen() {
    const [classificacao, setClassificacao] = useState<ClassificacaoItem[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        fetchClassificacao();
    }, []);

    const fetchClassificacao = async () => {
        try {
            const response = await databases.listDocuments(
                DATABASE_ID,
                COLLECTIONS.classificacao,
                [
                    Query.orderDesc('pontos'),
                    
                ]
            );
            setClassificacao(response.documents as unknown as ClassificacaoItem[]);
            setLoading(false);
        } catch (error) {
            console.error('Erro ao buscar classificação:', error);
            setLoading(false);
        }
    };

    const renderEquipa = ({ item, index }: { item: ClassificacaoItem; index: number }) => {
        const diferencaGolos = item.golos_marcados - item.golos_sofridos;
        const sinalDiferenca = diferencaGolos > 0 ? '+' : '';
        const simboloUrl = item.clube?.simbolo;

        return (
            <View style={[
                styles.row,
                index % 2 === 0 ? styles.evenRow : styles.oddRow
            ]}>
               
                <View style={styles.positionCell}>
                    <Text style={styles.positionText}>{index + 1}º</Text>
                </View>

                
                <View style={styles.teamCell}>
                    {simboloUrl && (
                        <Image
                            source={{ uri: simboloUrl }}
                            style={styles.logo}
                            resizeMode="contain"
                        />
                    )}
                    <Text style={styles.teamText} numberOfLines={1}>
                        {item.nome}
                    </Text>
                </View>

                
                <Text style={styles.numberCell}>{item.jogos}</Text>
               
                <Text style={styles.pontosCell}>{item.pontos}</Text>
                
                <Text style={styles.numberCell}>{item.vitorias}</Text>
               
                <Text style={styles.numberCell}>{item.empates}</Text>
                
                <Text style={styles.numberCell}>{item.derrotas}</Text>
                
                <Text style={styles.goalCell}>{item.golos_marcados}</Text>
                
                <Text style={styles.goalCell}>{item.golos_sofridos}</Text>
                
                <Text style={[
                    styles.numberCell,
                    diferencaGolos > 0 ? styles.positiveGoals :
                        diferencaGolos < 0 ? styles.negativeGoals : styles.neutralGoals
                ]}>
                    {sinalDiferenca}{diferencaGolos}
                </Text>
            </View>
        );
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#1e40af" />
                <Text style={styles.loadingText}>A carregar classificação...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.tableContainer}>
                    
                    <View style={styles.headerRow}>
                        <Text style={styles.headerPosition}>#</Text>
                        <Text style={styles.headerTeam}>EQUIPA</Text>
                        <Text style={styles.headerCell}>JOGOS</Text>
                        <Text style={styles.headerCell}>PONTOS</Text>
                        <Text style={styles.headerCell}>VITÓRIAS</Text>
                        <Text style={styles.headerCell}>EMPATES</Text>
                        <Text style={styles.headerCell}>DERROTAS</Text>
                        <Text style={styles.headerCell}>GOLOS MARCADOS</Text>
                        <Text style={styles.headerCell}>GOLOS SOFRIDOS</Text>
                        <Text style={styles.headerCell}>DIF. GOLOS</Text>
                    </View>
                    
                    <FlatList
                        data={classificacao}
                        renderItem={renderEquipa}
                        keyExtractor={(item) => item.$id}
                        scrollEnabled={false}
                        showsVerticalScrollIndicator={false}
                    />
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f1f5f9',
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
    tableContainer: {
        minWidth: 900,
        backgroundColor: '#fff',
        margin: 10,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    headerRow: {
        flexDirection: 'row',
        backgroundColor: '#cbd5e1',
        paddingVertical: 12,
        paddingHorizontal: 8,
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
    },
    headerPosition: {
        width: 40,
        fontWeight: 'bold',
        color: '#1e293b',
        textAlign: 'center',
        fontSize: 12,
    },
    headerTeam: {
        width: 150,
        fontWeight: 'bold',
        color: '#1e293b',
        textAlign: 'left',
        paddingLeft: 45,
        fontSize: 12,
    },
    headerCell: {
        width: 100,
        fontWeight: 'bold',
        color: '#1e293b',
        textAlign: 'center',
        fontSize: 11,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
    },
    evenRow: {
        backgroundColor: '#f8fafc',
    },
    oddRow: {
        backgroundColor: '#ffffff',
    },
    positionCell: {
        width: 40,
        alignItems: 'center',
    },
    positionText: {
        fontWeight: 'bold',
        color: '#64748b',
        fontSize: 14,
    },
    teamCell: {
        width: 150,
        flexDirection: 'row',
        alignItems: 'center',
        paddingLeft: 8,
    },
    logo: {
        width: 30,         
        height: 30,
        marginRight: 8,
        resizeMode: 'contain', 
    },
    teamText: {
        fontWeight: '600',
        color: '#1e293b',
        fontSize: 14,
        flexShrink: 1,
    },
    numberCell: {
        width: 100,
        textAlign: 'center',
        color: '#475569',
        fontSize: 14,
        fontWeight: '500',
    },
    goalCell: {
        width: 100,
        textAlign: 'center',
        color: '#475569',
        fontSize: 12,
        fontWeight: '500',
    },
    positiveGoals: {
        color: '#059669',
    },
    negativeGoals: {
        color: '#dc2626',
    },
    neutralGoals: {
        color: '#6b7280',
    },
    pontosCell: {
        width: 100,
        textAlign: 'center',
        fontWeight: 'bold',
        color: '#1e40af',
        fontSize: 16,
    },
});
