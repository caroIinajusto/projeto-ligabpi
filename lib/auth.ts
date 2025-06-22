import { account, databases, config, ID } from "./appwrite";


export async function register(nome: string, email: string, password: string) {
    
    const userAccount = await account.create(ID.unique(), email, password, nome);

    
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


export async function login(email: string, password: string) {
    const session = await account.createSession(email, password);
    return session;
}


export async function logout() {
    await account.deleteSession('current');
    return true;
}


export async function getCurrentUser() {
    const user = await account.get();
    return user;
}
