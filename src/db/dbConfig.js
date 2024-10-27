"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_cjs_1 = __importDefault(require("@bot-whatsapp/database/lib/mongo/index.cjs"));
const MONGO_DB_URI = "mongodb+srv://alejandrorosello127:alejandrorosello127@cluster0.n8tsy.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const MONGO_DB_NAME = "definitivo";
const getMongoAdapter = () => {
    return new index_cjs_1.default({
        dbUri: MONGO_DB_URI,
        dbName: MONGO_DB_NAME,
    });
};
exports.default = getMongoAdapter;
