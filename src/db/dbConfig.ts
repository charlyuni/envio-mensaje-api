import MongoAdapter from "@bot-whatsapp/database/lib/mongo/index.cjs";

const MONGO_DB_URI = "mongodb+srv://alejandrorosello127:alejandrorosello127@cluster0.n8tsy.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const MONGO_DB_NAME = "definitivo";

const getMongoAdapter = () => {
  return new MongoAdapter({
    dbUri: MONGO_DB_URI,
    dbName: MONGO_DB_NAME,
  });
};

export default getMongoAdapter;
