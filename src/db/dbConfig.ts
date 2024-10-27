// src/db/dbConfig.ts
import MongoAdapter from "@bot-whatsapp/database/lib/mongo/index.cjs";

const MONGO_DB_URI = 'mongodb+srv://alejandrorosello127:alejandrorosello127@cluster0.n8tsy.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const MONGO_DB_NAME = "definitivo";

let adapter: MongoAdapter | null = null;

export const getMongoAdapter = async () => {
  if (!adapter) {
    adapter = new MongoAdapter({
      dbUri: MONGO_DB_URI,
      dbName: MONGO_DB_NAME,
    });
    await adapter.init(); // Espera la inicialización
  }
  return adapter;
};

// Función para obtener la colección de mensajes
export const MessagesCollection = async () => {
  const adapter = await getMongoAdapter();
  return adapter.db.collection("messages");
};
