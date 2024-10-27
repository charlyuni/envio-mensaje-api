"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessagesCollection = exports.getMongoAdapter = void 0;
// src/db/dbConfig.ts
const index_cjs_1 = __importDefault(require("@bot-whatsapp/database/lib/mongo/index.cjs"));
const MONGO_DB_URI = 'mongodb+srv://alejandrorosello127:alejandrorosello127@cluster0.n8tsy.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const MONGO_DB_NAME = "definitivo";
let adapter = null;
const getMongoAdapter = () => __awaiter(void 0, void 0, void 0, function* () {
    if (!adapter) {
        adapter = new index_cjs_1.default({
            dbUri: MONGO_DB_URI,
            dbName: MONGO_DB_NAME,
        });
        yield adapter.init(); // Espera la inicialización
    }
    return adapter;
});
exports.getMongoAdapter = getMongoAdapter;
// Función para obtener la colección de mensajes
const MessagesCollection = () => __awaiter(void 0, void 0, void 0, function* () {
    const adapter = yield (0, exports.getMongoAdapter)();
    return adapter.db.collection("messages");
});
exports.MessagesCollection = MessagesCollection;
