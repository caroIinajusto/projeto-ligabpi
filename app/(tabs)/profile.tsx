
import React, { useState, useEffect } from 'react';
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Alert,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
} from "react-native";
import { router } from "expo-router";
import icons from "@/constants/icons";
import { useAuth } from "@/context/AuthContext";
import { getPrevisoes } from "@/lib/appwrite";

const Profile = () => {
  
  const { user, logout } = useAuth();
  const [numPrevisoes, setNumPrevisoes] = useState(0);

  const handleLogout = async () => {
    Alert.alert(
      'Confirmar Logout',
      'Tem a certeza que quer terminar a sessão?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout(); 
              router.replace('/(auth)/login');
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível terminar a sessão.');
            }
          }
        }
      ]
    );
  };

  
  useEffect(() => {
    async function fetchPrevisoes() {
      if (!user) return;
      try {
        const response = await getPrevisoes(user.id);
        setNumPrevisoes(response.total || 0);
      } catch (error) {
        console.error('Erro ao buscar previsões:', error);
      }
    }
    fetchPrevisoes();
  }, [user]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f8fafc" }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32, paddingHorizontal: 16 }}
      >
        
    

        
        <View style={styles.avatarBox}>
          <Image
            source={
              user?.avatar
                ? { uri: user.avatar }
                : require("@/assets/images/placeholder.png")
            }
            style={styles.avatar}
          />
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => Alert.alert("Editar Perfil", "Funcionalidade em breve!")}
          >
            <Image source={icons.edit} style={{ width: 28, height: 28 }} />
          </TouchableOpacity>
        </View>

       
        <View style={styles.infoBox}>
          <Text style={styles.name}>{user?.name || "Utilizador"}</Text>
          <Text style={styles.email}>{user?.email}</Text>
          {user?.clube_favorito && (
            <Text style={styles.club}>
              Clube Favorito: <Text style={{ fontWeight: "bold" }}>{user.clube_favorito}</Text>
            </Text>
          )}
         
          {user?.bio && (
            <Text style={styles.bio}>{user.bio}</Text>
          )}
        </View>

       
         <View style={styles.statsBox}>
      <View style={styles.stat}>
        <Text style={styles.statNumber}>{numPrevisoes}</Text>
        <Text style={styles.statLabel}>Previsões</Text>
      </View>
          <View style={styles.stat}>
            <Text style={styles.statNumber}>{user?.acertos || 0}</Text>
            <Text style={styles.statLabel}>Acertos</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statNumber}>{user?.ranking || "-"}</Text>
            <Text style={styles.statLabel}>Ranking</Text>
          </View>
        </View>

        <View style={{ flex: 1, minHeight: 120 }} />
       

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    alignItems: "center",
    marginTop: 10,
    marginBottom: 18,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1e40af",
    letterSpacing: 0.5,
  },
  avatarBox: {
    alignItems: "center",
    marginBottom: 10,
    marginTop: 10,
    position: "relative",
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#e5e7eb",
    borderWidth: 3,
    borderColor: "#1e40af",
  },
  editBtn: {
    position: "absolute",
    bottom: 0,
    right: 120 / 2 - 20,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 4,
    borderWidth: 1,
    borderColor: "#1e40af",
    elevation: 2,
  },
  infoBox: {
    alignItems: "center",
    marginBottom: 25,
    marginTop: 8,
  },
  name: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1e40af",
    marginBottom: 2,
  },
  email: {
    fontSize: 15,
    color: "#64748b",
    marginBottom: 2,
  },
  club: {
    fontSize: 15,
    color: "#059669",
    marginBottom: 4,
    marginTop: 2,
  },
  bio: {
    fontSize: 14,
    color: "#334155",
    marginTop: 6,
    fontStyle: "italic",
    textAlign: "center",
  },
  statsBox: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 24,
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  stat: {
    alignItems: "center",
    flex: 1,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1e40af",
  },
  statLabel: {
    fontSize: 13,
    color: "#64748b",
    marginTop: 2,
  },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginTop: 30,
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#f87171",
    elevation: 1,
  },
  logoutText: {
    color: "#f87171",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default Profile;
