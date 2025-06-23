import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { databases, ID, DATABASE_ID, COLLECTIONS, Query } from '@/lib/appwrite';
import { useAuth } from '@/context/AuthContext';

interface ChatMessage {
  _id: string;
  text: string;
  createdAt: string;
  userId: string;
  userName: string;
}

export default function ChatScreen() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const flatListRef = useRef<FlatList<any>>(null);

  useEffect(() => {
    const fetchMessages = async () => {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.mensagens_chat,
        [Query.orderDesc('$createdAt'), Query.limit(50)]
      );
      setMessages(
        response.documents
          .map((doc: any) => ({
            _id: doc.$id,
            text: doc.texto,
            createdAt: doc.$createdAt,
            userId: doc.userId,
            userName: doc.userName,
          }))
          .sort((a, b) => (a.createdAt < b.createdAt ? -1 : 1))
      );
    };

    fetchMessages();

    const unsubscribe = databases.client.subscribe(
      `databases.${DATABASE_ID}.collections.${COLLECTIONS.mensagens_chat}.documents`,
      (response: any) => {
        if (response.events.includes('databases.*.collections.*.documents.*.create')) {
          const doc = response.payload;
          setMessages(prev =>
            [...prev, {
              _id: doc.$id,
              text: doc.texto,
              createdAt: doc.$createdAt,
              userId: doc.userId,
              userName: doc.userName,
            }].sort((a, b) => (a.createdAt < b.createdAt ? -1 : 1))
          );
        }
      }
    );
    return () => unsubscribe();
  }, []);

  const sendMessage = async () => {
    if (!input.trim() || !user) return;
    await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.mensagens_chat,
      ID.unique(),
      {
        texto: input.trim(),
        userId: user.id,
        userName: user.name,
      }
    );
    setInput('');
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const renderItem = ({ item }: { item: ChatMessage }) => (
    <View style={[
      styles.messageContainer,
      item.userId === user?.id ? styles.ownMessage : styles.otherMessage
    ]}>
      <Text style={styles.userName}>{item.userName}</Text>
      <Text style={styles.messageText}>{item.text}</Text>
      <Text style={styles.messageTime}>
        {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </Text>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#f8fafc' }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
    >
      <View style={{ flex: 1 }}>
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderItem}
          keyExtractor={item => item._id}
          contentContainerStyle={{ padding: 16, paddingBottom: 16 }}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />
        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Escreve uma mensagem..."
            onSubmitEditing={sendMessage}
            returnKeyType="send"
          />
          <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
            <Text style={styles.sendButtonText}>Enviar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  messageContainer: {
    marginBottom: 12,
    maxWidth: '80%',
    borderRadius: 12,
    padding: 10,
    alignSelf: 'flex-start',
    backgroundColor: '#e5e7eb',
  },
  ownMessage: {
    backgroundColor: '#211F62',
    alignSelf: 'flex-end',
  },
  otherMessage: {
    backgroundColor: '#EF3824',
    alignSelf: 'flex-start',
  },
  userName: {
    fontWeight: 'bold',
    color: '#211F62',
    marginBottom: 2,
    fontSize: 13,
  },
  messageText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  messageTime: {
    color: '#FFFFFF',
    fontSize: 10,
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderColor: '#e5e7eb',
    
  },
  input: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb'
  },
  sendButton: {
    backgroundColor: '#211F62',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 18,
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
