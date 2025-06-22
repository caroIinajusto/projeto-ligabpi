import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    ActivityIndicator,
    TouchableOpacity,
    Image,
    Dimensions,
} from 'react-native';
import { databases, DATABASE_ID, COLLECTIONS } from '../../lib/appwrite';
import { router } from 'expo-router';
import { Models } from 'react-native-appwrite';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 40) / 2;

export default function ClubesScreen() {
    const [clubes, setClubes] = useState<Models.Document[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchClubes();
    }, []);

    const fetchClubes = async () => {
        try {
            const response = await databases.listDocuments(
                DATABASE_ID,
                COLLECTIONS.clubes
            );
            setClubes(response.documents);
            setLoading(false);
        } catch (error) {
            console.error('Erro ao buscar clubes:', error);
            setLoading(false);
        }
    };

    const getClubImage = (simbolo?: string) => {
        if (simbolo) {
            return { uri: simbolo };
        }
        return require('../../assets/images/placeholder.png');
    };

    const renderClube = ({ item, index }: { item: Models.Document; index: number }) => (
        <TouchableOpacity
            style={[
                styles.clubCard,
                { 
                    marginLeft: index % 2 === 0 ? 0 : 8,
                    marginRight: index % 2 === 0 ? 8 : 0,
                }
            ]}
            onPress={() => router.push(`/clube/${item.$id}`)}
            activeOpacity={0.9}
        >
            <View style={styles.cardContent}>
                <View style={styles.clubImageContainer}>
                    <Image
                        source={getClubImage(item.simbolo)}
                        style={styles.clubImage}
                        defaultSource={require('../../assets/images/placeholder.png')}
                        resizeMode="contain"
                    />
                </View>
                
                <View style={styles.clubInfo}>
                    <Text style={styles.clubName} numberOfLines={2}>
                        {item.nome}
                    </Text>
                    <View style={styles.locationContainer}>
                        <Text style={styles.locationIcon}>📍</Text>
                        <Text style={styles.clubLocation} numberOfLines={1}>
                            {item.cidade}
                        </Text>
                    </View>
                </View>

                <View style={styles.arrowContainer}>
                    <View style={styles.arrowBox}>
                        <Text style={styles.arrow}>→</Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#1e40af" />
                <Text style={styles.loadingText}>A carregar clubes...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={clubes}
                renderItem={renderClube}
                keyExtractor={(item) => item.$id}
                numColumns={2}
                contentContainerStyle={styles.listContainer}
                showsVerticalScrollIndicator={false}
                initialNumToRender={12}
                onEndReachedThreshold={0.1}
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
        marginTop: 16,
        color: '#64748b',
        fontSize: 16,
        fontWeight: '500',
    },
    listContainer: {
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 20,
    },
    clubCard: {
        width: CARD_WIDTH,
        marginBottom: 16,
        borderRadius: 16,
        backgroundColor: '#fff',
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 5,
    },
    cardContent: {
        padding: 16,
        minHeight: 140,
        justifyContent: 'space-between',
    },
    clubImageContainer: {
        alignItems: 'center',
        marginBottom: 12,
    },
    clubImage: {
        width: 50,
        height: 50,
    },
    clubInfo: {
        flex: 1,
        alignItems: 'center',
    },
    clubName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1e293b',
        textAlign: 'center',
        marginBottom: 8,
        lineHeight: 20,
    },
    locationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f1f5f9',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    locationIcon: {
        fontSize: 12,
        marginRight: 4,
    },
    clubLocation: {
        fontSize: 12,
        color: '#64748b',
        fontWeight: '500',
    },
    arrowContainer: {
        alignItems: 'center',
        marginTop: 12,
    },
    arrowBox: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#1e40af',
    },
    arrow: {
        fontSize: 16,
        color: '#ffffff',
        fontWeight: 'bold',
    },
});
