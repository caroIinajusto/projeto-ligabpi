import {
    Client,
    Account,
    ID,
    Databases,
    Avatars,
    Query,
    Storage,
    Permission,
    Role,
    OAuthProvider
} from "react-native-appwrite";

// Configuração
export const config = {
    endpoint: "https://cloud.appwrite.io/v1",
    projectId: "681dfaa40016242bda0e",
    databaseId: "681f8e5f000b13a20ce3",
    colecoes: {
        utilizadores: "682f39770037c99e07b6",
        jogadoras: "681f912100023d982460",
        clubes: "682f346c002b9b0d493a",
        jogos: "681f9b7a0025af16b9e7",
        classificacao: "681f9b71002afefbeb60",
        noticias: "681f9d270036a32628ab",
        marcadoras: "682f38cb002ef378bc78",
        previsoes: "681f90810008fe553b79",
        mensagens_chat: "684d71b600134a8abfeb", 
        mediaBucketId: "681f8e5f000b13a20ce4"
    }
};

export { ID, Query } from "react-native-appwrite";
export const COLLECTIONS = config.colecoes;
export const DATABASE_ID = config.databaseId;

const client = new Client()
    .setEndpoint(config.endpoint)
    .setProject(config.projectId)
    .setPlatform("com.ligabpi.app");


export const account = new Account(client);

export const databases = new Databases(client);
export const avatars = new Avatars(client);
export const storage = new Storage(client);
export { client };



export async function register(name: string, email: string, password: string) {
    try {
        const userAccount = await account.create(
            ID.unique(),
            email,
            password,
            name
        );

        if (!userAccount) throw new Error("Falha ao criar conta");

        const userDoc = await databases.createDocument(
            config.databaseId,
            config.colecoes.utilizadores,
            userAccount.$id,
            {
                nome: name,
                email,
                avatar: avatars.getInitials(name),
                clube_favorito: ""
            }
        );

        return userDoc;
    } catch (error) {
        console.error("Erro no registo:", error);
        throw new Error(error instanceof Error ? error.message : "Erro ao registar utilizador");
    }
}

export async function loginWithEmail(email: string, password: string) {
    try {
        const session = await account.createEmailPasswordSession(email, password);
        return session;
    } catch (error) {
        console.error("Erro no login:", error);
        throw new Error(error instanceof Error ? error.message : "Credenciais inválidas");
    }
}

export async function getCurrentUser() {
    try {
        const currentAccount = await account.get();
        if (!currentAccount) return null;

        let userDoc: any = null;
        try {
            userDoc = await databases.getDocument(
                config.databaseId,
                config.colecoes.utilizadores,
                currentAccount.$id
            );
        } catch (e) {
            userDoc = await databases.createDocument(
                config.databaseId,
                config.colecoes.utilizadores,
                currentAccount.$id,
                {
                    nome: currentAccount.name,
                    email: currentAccount.email,
                    avatar: avatars.getInitials(currentAccount.name),
                    clube_favorito: ""
                }
            );
        }

        return {
            id: currentAccount.$id,
            name: userDoc.nome || currentAccount.name,
            email: currentAccount.email,
            avatar: userDoc.avatar,
            clube_favorito: userDoc.clube_favorito || "",
            bio: userDoc.bio || "",
            previsoes: userDoc.previsoes || 0,
            acertos: userDoc.acertos || 0,
            ranking: userDoc.ranking || "-"
        };
    } catch (error) {
        // Check if it's a scope/permission error (user not authenticated)
        if (error instanceof Error && error.message.includes('missing scope')) {
            console.log("Utilizador não autenticado");
            return null;
        }
        console.error("Erro ao buscar utilizador:", error);
        return null;
    }
}

export async function logout() {
  try {
    await account.deleteSession('current'); 
    return true;
  } catch (error) {
    // If user is already logged out (guest role), consider it successful
    if (error instanceof Error && error.message.includes('missing scope')) {
      console.log("Utilizador já não estava autenticado");
      return true;
    }
    console.error("Erro no logout:", error);
    return false;
  }
}


export async function updateUserProfile(userId: string, data: any) {
    try {
        return await databases.updateDocument(
            config.databaseId,
            config.colecoes.utilizadores,
            userId,
            data
        );
    } catch (error) {
        console.error("Erro ao atualizar perfil:", error);
        throw error;
    }
}



export async function getNoticias(limit = 5) {
    return databases.listDocuments(
        config.databaseId,
        config.colecoes.noticias,
        [Query.orderDesc("$createdAt"), Query.limit(limit)]
    );
}

export async function getClassificacao() {
    return databases.listDocuments(
        config.databaseId,
        config.colecoes.classificacao,
        [Query.orderDesc("pontos")]
    );
}

export async function getJogos(filters = []) {
    return databases.listDocuments(
        config.databaseId,
        config.colecoes.jogos,
        filters
    );
}

export async function getClubes(params: { query?: string; filter?: string } = {}) {
    const queries = [Query.orderAsc("nome")];
    if (params.query) {
        queries.push(Query.search("nome", params.query));
    }
    if (params.filter && params.filter !== "all") {
        queries.push(Query.equal("categoria", params.filter));
    }
    return databases.listDocuments(
        config.databaseId,
        config.colecoes.clubes,
        queries
    );
}

export async function getJogadoras(clubeId?: string) {
    const queries = [Query.orderAsc("nome")];
    if (clubeId) {
        queries.push(Query.equal("clube_id", clubeId));
    }
    return databases.listDocuments(
        config.databaseId,
        config.colecoes.jogadoras,
        queries
    );
}

export async function getMarcadoras(limit = 10) {
    return databases.listDocuments(
        config.databaseId,
        config.colecoes.marcadoras,
        [Query.orderDesc("golos"), Query.limit(limit)]
    );
}

export async function getPrevisoes(userId?: string) {
    const queries = [Query.orderDesc("$createdAt")];
    if (userId) {
        queries.push(Query.equal("user_id", userId));
    }
    return databases.listDocuments(
        config.databaseId,
        config.colecoes.previsoes,
        queries
    );
}

export async function criarPrevisao(userId: string, jogoId: string, previsao: any) {
    return databases.createDocument(
        config.databaseId,
        config.colecoes.previsoes,
        ID.unique(),
        {
            user_id: userId,
            jogo_id: jogoId,
            ...previsao,
            data_criacao: new Date().toISOString()
        },
        [
            Permission.read(Role.user(userId)),
            Permission.update(Role.user(userId)),
            Permission.delete(Role.user(userId))
        ]
    );
}


export function getImageUrl(fileId: string) {
    if (!fileId) return undefined;
    return storage.getFilePreview(
        config.colecoes.mediaBucketId,
        fileId
    ).href;
}
