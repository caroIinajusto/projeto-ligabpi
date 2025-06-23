import { useEffect } from "react";
import { Stack, useRouter, useSegments, SplashScreen } from "expo-router";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { ActivityIndicator, View } from "react-native";


SplashScreen.preventAutoHideAsync();

function AuthGate() {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

 
    const currentRouteGroup = segments[0] || '';
    
    console.log(" Debug - User:", !!user);
    console.log(" Debug - Segments:", segments);
    console.log(" Debug - Current Route Group:", currentRouteGroup);

   
    if (!user && currentRouteGroup !== '(auth)') {
      console.log("Redirecionando para login...");
      router.replace("/(auth)/login");
    }
    

    if (user && currentRouteGroup === '(auth)') {
      console.log("Redirecionando para tabs...");
      router.replace("/(tabs)");
    }

    SplashScreen.hideAsync();
  }, [user, loading, segments]);


  if (loading) {
    return (
      <View style={{ 
        flex: 1, 
        justifyContent: "center", 
        alignItems: "center", 
        backgroundColor: "#ffffff" 
      }}>
        <ActivityIndicator size="large" color="#211F62" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <AuthGate />
    </AuthProvider>
  );
}
