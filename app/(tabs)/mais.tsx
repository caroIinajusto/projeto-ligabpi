import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView, Modal, FlatList, ActivityIndicator, Image } from 'react-native';
import { databases, COLLECTIONS, DATABASE_ID, updateUserProfile } from '../../lib/appwrite';
import { useAuth } from '@/context/AuthContext';
import { router } from 'expo-router';


interface Clube {
    $id: string;
    nome: string;
    [key: string]: any; 
}

export default function MaisScreen() {
    const { user, logout, loading, refreshUser } = useAuth(); 
    const [clubes, setClubes] = useState<Clube[]>([]);
    const [showClubModal, setShowClubModal] = useState(false);
    const [loadingClubes, setLoadingClubes] = useState(true);
    const [updatingClub, setUpdatingClub] = useState(false);

    useEffect(() => {
        fetchClubes();
    }, []);

    const fetchClubes = async () => {
        setLoadingClubes(true);
        try {
            const response = await databases.listDocuments(DATABASE_ID, COLLECTIONS.clubes);
            setClubes(response.documents as unknown as Clube[]);
        } catch (error) {
            Alert.alert('Erro', 'Não foi possível carregar os clubes.');
        } finally {
            setLoadingClubes(false);
        }
    };

    const handleEscolherClube = async (clube: Clube) => {
        if (!user) return;
        setUpdatingClub(true);
        try {
            await updateUserProfile(user.id, { clube_favorito: clube.nome });
            
            await refreshUser();
            setShowClubModal(false);
            Alert.alert('Clube Favorito', `${clube.nome} definido como clube favorito!`);
        } catch (error) {
            Alert.alert('Erro', 'Não foi possível definir o clube favorito.');
        } finally {
            setUpdatingClub(false);
        }
    };


    const handlePrevisoes = () => {
        router.push('/previsoes');
    };

    const renderClube = ({ item }: { item: Clube }) => (
        <TouchableOpacity
            style={[styles.clubeItem, updatingClub && styles.clubeItemDisabled]}
            onPress={() => handleEscolherClube(item)}
            disabled={updatingClub}
        >
            <Text style={styles.clubeText}>{item.nome}</Text>
        </TouchableOpacity>
    );

   
    if (loading) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color="#211F62" />
                <Text style={{ marginTop: 16, color: '#666' }}>A carregar perfil...</Text>
            </View>
        );
    }

    
    if (!user) {
        return null;
    }

    return (
        <View style={styles.container}>
            <ScrollView>
                <TouchableOpacity
                    activeOpacity={0.85}

                    onPress={() => router.push('/profile')}
                >
                    <View style={styles.profileCard}>
                        <View style={styles.avatarBox}>
                            <Image
                                source={
                                    user?.avatar
                                        ? { uri: user.avatar }
                                        : require('../../assets/images/placeholder.png')
                                }
                                style={styles.avatar}
                            />
                        </View>
                        <View style={styles.info}>
                            <Text style={styles.profileName}>{user.name}</Text>
                            <Text style={styles.profileEmail}>{user.email}</Text>
                            <View style={styles.clubRow}>
                                <Text style={styles.clubFav}>
                                    {user.clube_favorito ? user.clube_favorito : 'Sem clube favorito'}
                                </Text>
                                <TouchableOpacity
                                    style={styles.editClubBtn}
                                    onPress={(e) => {
                                        e.stopPropagation(); 
                                        setShowClubModal(true);
                                    }}
                                >
                                    <Text style={styles.editClubText}>✎</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </TouchableOpacity>

                
                <TouchableOpacity
                    style={styles.botaoPrevisoes}
                    onPress={handlePrevisoes}
                >
                    <Text style={styles.textoBotao}>🏆 Previsões</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.botaoChat}
                    onPress={() => router.push('/chat')}
                >
                    <Text style={styles.textoBotao}>💬 Chat</Text>
                </TouchableOpacity>
            </ScrollView>

            
            <Modal
                visible={showClubModal}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => setShowClubModal(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Escolher Clube Favorito</Text>
                        <TouchableOpacity
                            onPress={() => setShowClubModal(false)}
                            disabled={updatingClub}
                        >
                            <Text style={styles.closeButton}>✕</Text>
                        </TouchableOpacity>
                    </View>
                    {loadingClubes ? (
                        <ActivityIndicator size="large" color="#211F62" style={{ marginTop: 32 }} />
                    ) : (
                        <FlatList
                            data={clubes}
                            keyExtractor={(item) => item.$id}
                            renderItem={renderClube}
                        />
                    )}
                    {updatingClub && (
                        <View style={styles.updatingOverlay}>
                            <ActivityIndicator size="small" color="#211F62" />
                            <Text style={styles.updatingText}>A atualizar...</Text>
                        </View>
                    )}
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    perfilSection: {
        margin: 16,
    },
    perfilBox: {
        backgroundColor: '#211F62',
        borderRadius: 12,
        padding: 20,
        marginBottom: 12,
        alignItems: 'center',
    },
    perfilTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    userName: {
        color: '#fff',
        fontSize: 16,
        marginBottom: 4,
    },
    userEmail: {
        color: '#bfc3e6',
        fontSize: 14,
        marginBottom: 8,
    },
    clubeFavorito: {
        color: '#FF6B35',
        fontSize: 14,
        fontWeight: 'bold',
    },
    clubeFavoritoButton: {
        backgroundColor: '#211F62',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    menuText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#fff',
        textAlign: 'center',
    },
    botaoPrevisoes: {
        backgroundColor: '#211F62',
        margin: 16,
        padding: 20,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 3
    },
    textoBotao: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: '600'
    },
    logoutButton: {
        backgroundColor: '#ffffff',
        padding: 20,
        margin: 16,
        borderRadius: 8,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    logoutText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#f53d2d',
    },
    modalContainer: {
        flex: 1,
        backgroundColor: '#fff',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#211F62',
    },
    closeButton: {
        fontSize: 24,
        color: '#666',
    },
    clubeItem: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    clubeItemDisabled: {
        opacity: 0.5,
    },
    clubeText: {
        fontSize: 16,
        color: '#211F62',
        fontWeight: '500'
    },
    updatingOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#f9fafb',
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderTopWidth: 1,
        borderTopColor: '#e5e7eb',
    },
    updatingText: {
        marginLeft: 8,
        color: '#666',
    },
    botaoChat: {
        backgroundColor: '#211F62',
        margin: 16,
        padding: 20,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 3
    },
    profileCard: {
        backgroundColor: '#211F62',
        margin: 16,
        padding: 20,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 3
    },
    avatarBox: {
        marginRight: 20, 
        marginBottom: 10, 
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#fff',
    },

    info: {
    flex: 1,
    alignItems: 'flex-start',   
    justifyContent: 'center',   
},

    profileName: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    profileEmail: {
        color: '#bfc3e6',
        fontSize: 14,
        marginBottom: 12,
    },
    clubRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    clubFav: {
        color: '#FF6B35',
        fontSize: 14,
        fontWeight: 'bold',
        marginRight: 8,
    },
    editClubBtn: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    editClubText: {
        color: '#fff',
        fontSize: 14,
    },
});
