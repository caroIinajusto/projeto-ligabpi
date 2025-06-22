import React, { createContext, useContext, ReactNode, useState, useEffect } from "react";
import { getCurrentUser } from "./appwrite";

type User = {
    id: string;
    name: string;
    email: string;
    avatar: string;
    clube_favorito?: string;
    bio?: string;
    previsoes?: number;
    acertos?: number;
    ranking?: number | string;
};

type ContextType = {
    user: User | null;
    loading: boolean;
    login: () => Promise<void>;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
};

const GlobalContext = createContext<ContextType>({} as ContextType);

export const GlobalProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);


    const checkUser = async () => {
        setLoading(true);
        try {
            const currentUser = await getCurrentUser();
            if (currentUser) {
                // Map Appwrite user to our User type
                setUser({
                    id: currentUser.id,
                    name: currentUser.name,
                    email: currentUser.email,
                    avatar: currentUser.avatar,
                    clube_favorito: currentUser.clube_favorito,
                    bio: currentUser.bio,
                    previsoes: currentUser.previsoes,
                    acertos: currentUser.acertos,
                    ranking: currentUser.ranking
                });
            } else {
                setUser(null);
            }
        } catch (error) {
            setUser(null);
        }
        setLoading(false);
    };

    useEffect(() => {
        checkUser();
    }, []);

    const handleLogin = async () => {
        await checkUser();
    };

    const handleLogout = async () => {
        setUser(null);
        await checkUser();
    };

    return (
        <GlobalContext.Provider
            value={{
                user,
                loading,
                login: handleLogin,
                logout: handleLogout,
                refreshUser: checkUser
            }}
        >
            {children}
        </GlobalContext.Provider>
    );
};

export const useGlobalContext = () => useContext(GlobalContext);
