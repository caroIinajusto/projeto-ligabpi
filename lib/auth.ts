import { account, databases, config, ID } from "./appwrite";

// REGISTO DE UTILIZADOR
export async function register(nome: string, email: string, password: string) {
    // Cria conta no sistema de autenticação do Appwrite
    const userAccount = await account.create(ID.unique(), email, password, nome);

    // Cria documento na coleção 'utilizadores' com o mesmo ID do utilizador
    await databases.createDocument(
        config.databaseId,
        config.colecoes.utilizadores,
        userAccount.$id,
        {
            nome,
            email
        }
    );

    return userAccount;
}

// LOGIN POR EMAIL/SENHA
export async function login(email: string, password: string) {
    const session = await account.createSession(email, password);
    return session;
}

// LOGOUT
export async function logout() {
    await account.deleteSession('current');
    return true;
}

// UTILIZADOR ATUAL
export async function getCurrentUser() {
    const user = await account.get();
    return user;
}
