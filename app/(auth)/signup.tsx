import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  StyleSheet,
  StatusBar,
} from "react-native";
import { register } from "@/lib/appwrite";
import { router } from "expo-router";

const SignupScreen = () => {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [processando, setProcessando] = useState(false);

  const handleSignup = async () => {
    if (!nome || !email || !senha) {
      Alert.alert("Erro", "Preencha todos os campos!");
      return;
    }

    if (senha.length < 8) {
      Alert.alert("Erro", "A senha deve ter pelo menos 8 caracteres");
      return;
    }

    setProcessando(true);
    try {
      await register(nome, email, senha);
      Alert.alert("Sucesso", "Conta criada! Faça login.");
      router.replace("/(auth)/login");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro ao criar conta";
      Alert.alert("Erro", errorMessage);
    } finally {
      setProcessando(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
       
        <View style={styles.header}>
          <Text style={styles.welcomeText}>Bem-vindo à</Text>
          <Text style={styles.titleText}>
            Liga BPI{"\n"}
            <Text style={styles.subtitleText}>Futebol Feminino</Text>
          </Text>
          <Text style={styles.descriptionText}>
            Crie a sua conta para acompanhar o campeonato
          </Text>
        </View>

        
        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Nome completo"
              placeholderTextColor="#9CA3AF"
              value={nome}
              onChangeText={setNome}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#9CA3AF"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Senha (mínimo 8 caracteres)"
              placeholderTextColor="#9CA3AF"
              value={senha}
              onChangeText={setSenha}
              secureTextEntry
            />
          </View>

          <TouchableOpacity
            style={[styles.button, processando && styles.buttonDisabled]}
            onPress={handleSignup}
            disabled={processando}
          >
            <Text style={styles.buttonText}>
              {processando ? "Criando conta..." : "Registar"}
            </Text>
          </TouchableOpacity>
        </View>

        
        <View style={styles.footer}>
          <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
            <Text style={styles.footerText}>
              Já tem uma conta?{" "}
              <Text style={styles.linkText}>Faça login</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },
  header: {
    alignItems: "center",
    marginTop: 40,
    marginBottom: 40,
  },
  welcomeText: {
    fontSize: 16,
    color: "#6B7280",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 8,
  },
  titleText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#211F62",
    textAlign: "center",
    lineHeight: 38,
  },
  subtitleText: {
    fontSize: 24,
    color: "#FF6B35",
  },
  descriptionText: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    marginTop: 16,
    lineHeight: 22,
  },
  formContainer: {
    flex: 1,
    justifyContent: "center",
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: "#111827",
  },
  button: {
    backgroundColor: "#211F62",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 20,
    shadowColor: "#211F62",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "bold",
  },
  footer: {
    alignItems: "center",
    paddingBottom: 40,
    marginTop: 30,
  },
  footerText: {
    fontSize: 16,
    color: "#6B7280",
  },
  linkText: {
    color: "#211F62",
    fontWeight: "bold",
  },
});

export default SignupScreen;
