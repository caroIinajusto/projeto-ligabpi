import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: '#1e40af',
                tabBarInactiveTintColor: '#6b7280',
                tabBarStyle: {
                    backgroundColor: '#ffffff',
                    borderTopWidth: 1,
                    borderTopColor: '#e5e7eb',
                },
                headerStyle: {
                    backgroundColor: '#1e40af',
                },
                headerTintColor: '#ffffff',
                headerTitleStyle: {
                    fontWeight: 'bold',
                },
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Início',
                    tabBarIcon: ({ color, size }: { color: string; size: number }) => (
                        <Ionicons name="home-outline" size={size} color={color} />
                    ),
                    headerTitle: 'Liga BPI',
                }}
            />
            <Tabs.Screen
                name="jogos"
                options={{
                    title: 'Jogos',
                    tabBarIcon: ({ color, size }: { color: string; size: number }) => (
                        <Ionicons name="football-outline" size={size} color={color} />
                    ),
                    headerTitle: 'Jogos',
                }}
            />
            <Tabs.Screen
                name="classificacao"
                options={{
                    title: 'Classificação',
                    tabBarIcon: ({ color, size }: { color: string; size: number }) => (
                        <Ionicons name="trophy-outline" size={size} color={color} />
                    ),
                    headerTitle: 'Classificação',
                }}
            />
            <Tabs.Screen
                name="clubes"
                options={{
                    title: 'Clubes',
                    tabBarIcon: ({ color, size }: { color: string; size: number }) => (
                        <Ionicons name="people-outline" size={size} color={color} />
                    ),
                    headerTitle: 'Clubes',
                }}
            />
            <Tabs.Screen
                name="mais"
                options={{
                    title: 'Mais',
                    tabBarIcon: ({ color, size }: { color: string; size: number }) => (
                        <Ionicons name="ellipsis-horizontal-outline" size={size} color={color} />
                    ),
                    headerTitle: 'Mais',
                }}
            />
            <Tabs.Screen
                   name="noticia/[id]"
    options={{
        href: null, 
    }}
/>
 <Tabs.Screen
                   name="explore"
    options={{
        href: null, 
    }}
    
/>
<Tabs.Screen
                   name="noticias/[id]"
    options={{
        href: null, 
    }}
/>
<Tabs.Screen
                   name="clube/[clubeId]"
    options={{
        href: null, 
    }}
/>
<Tabs.Screen
                   name="jogadora/[jogadoraId]"
    options={{
        href: null, 
    }}
/>
<Tabs.Screen
                   name="previsoes"
    options={{
        href: null, 
    }}
/>
<Tabs.Screen
                   name="login"
    options={{
        href: null, 
    }}
/>
<Tabs.Screen
                   name="registar"
    options={{
        href: null, 
    }}
/>
<Tabs.Screen
                   name="profile"
    options={{
        href: null, 
    }}
/>
<Tabs.Screen
                   name="chat"
    options={{
        href: null, 
    }}
/>
<Tabs.Screen
                   name="previsoes/[jogoId]"
    options={{
        href: null, 
    }}
/>
        </Tabs>
        
    );
}
