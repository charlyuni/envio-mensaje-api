import MongoAdapter from "@bot-whatsapp/database/lib/mongo/index.cjs";
import mongoose from "mongoose";

const MONGO_DB_URI = 'mongodb+srv://alejandrorosello127:alejandrorosello127@cluster0.n8tsy.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const MONGO_DB_NAME = "definitivo";

let adapter: any = null;

export async function getMongoAdapter() {
  if (!adapter) {
    adapter = new MongoAdapter({
      dbUri: MONGO_DB_URI,
      dbName: MONGO_DB_NAME,
    });
    await adapter.init();
  }
  return adapter;
}

export async function MessagesCollection() {
  const adapter = await getMongoAdapter();
  return adapter.db.collection("messages");
}

export async function getContacts() {
  const adapter = await getMongoAdapter();
  return adapter.db.collection("contacts").find().toArray();
}