const { Client, Databases } = require("node-appwrite");
const classificacao = require("./classificacao.json");

const client = new Client()
    .setEndpoint("https://cloud.appwrite.io/v1")
    .setProject("681dfaa40016242bda0e")
    .setKey("standard_deb194524955391ffc8cb0de047b4449b053629ad7803f6a5ad1df4dd5ca9681eb6783ce1992c490205468d68ec2b4529870d345b0a7216c6ef08ceccbe3a9e4d78a07b94c549a2c797639c75bad6ec048afc2f76ce27d2605fe0e12dda3f62fdfa2b60988cddf283ce7162ba8f7f61f77542110e25ce944de5f87bb24ae6d1c"); // Cria uma API Key (Server) no Appwrite Cloud

const databases = new Databases(client);

async function importarClassificacao() {
    for (const clube of classificacao) {
        try {
            await databases.createDocument(
                "681f8e5f000b13a20ce3",
                "681f9b71002afefbeb60",
                "unique()",              // Gera ID automático
                clube                    // Dados do clube
            );
            console.log(`Importado: ${clube.clube}`);
        } catch (err) {
            console.error(`Erro no clube ${clube.clube}:`, err.message);
        }
    }
}

importarClassificacao();
