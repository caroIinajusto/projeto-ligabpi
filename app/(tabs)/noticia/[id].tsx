import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, ScrollView, Image } from "react-native";
import { Stack } from "expo-router";
import { databases, config } from "@/lib/appwrite";
import { Models } from "react-native-appwrite";


interface Noticia {
  $id: string;
  titulo: string;
  conteudo: string;
  $createdAt: string;
  imagem?: string;
}

export default function NoticiaDetalhe() {
  const { id } = useLocalSearchParams();
  const [noticia, setNoticia] = useState<Noticia | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNoticia() {
      setLoading(true);
      try {
        const res = await databases.getDocument(
          config.databaseId,
          config.colecoes.noticias,
          id as string
        ) as unknown as Models.Document;
        
        
        if (res && res.$id && res.titulo && res.conteudo && res.$createdAt) {
          setNoticia({
            $id: res.$id,
            titulo: res.titulo,
            conteudo: res.conteudo,
            $createdAt: res.$createdAt,
            imagem: res.imagem
          });
        } else {
          setNoticia(null);
        }
      } catch (e) {
        setNoticia(null);
      } finally {
        setLoading(false);
      }
    }
    fetchNoticia();
  }, [id]);

  if (loading) {
    return <ActivityIndicator style={{ marginTop: 40 }} />;
  }

  if (!noticia) {
    return <Text style={{ textAlign: "center", marginTop: 40 }}>Notícia não encontrada.</Text>;
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Notícia' }} />
      <ScrollView style={{ padding: 20 }}>
        <Text style={{ fontSize: 22, fontWeight: "bold", marginBottom: 10 }}>{noticia.titulo}</Text>
        <Text style={{ color: "#888", marginBottom: 20 }}>
          {new Date(noticia.$createdAt).toLocaleDateString("pt-PT")}
        </Text>
        {noticia.imagem && (
          <Image source={{ uri: noticia.imagem }} style={{ width: "100%", height: 200, marginVertical: 20 }} />
        )}
        <Text style={{ fontSize: 16 }}>{noticia.conteudo}</Text>
      </ScrollView>
    </>
  );
}
