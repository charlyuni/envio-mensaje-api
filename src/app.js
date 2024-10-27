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
const bot_1 = require("@bot-whatsapp/bot");
const dbConfig_1 = require("./db/dbConfig");
const provider_baileys_1 = require("@bot-whatsapp/provider-baileys");
const node_cron_1 = __importDefault(require("node-cron"));
const flowBienvenida = (0, bot_1.addKeyword)("hola").addAnswer("¡Hola! ¿En qué puedo ayudarte?");
const main = () => __awaiter(void 0, void 0, void 0, function* () {
    const provider = (0, bot_1.createProvider)(provider_baileys_1.BaileysProvider);
    provider.initHttpServer(3002);
    // Endpoint para recibir y guardar el mensaje programado
    if (provider.http) {
        provider.http.server.post("/schedule-message", (0, provider_baileys_1.handleCtx)((bot, req, res) => __awaiter(void 0, void 0, void 0, function* () {
            const { number, message, date, urlMedia } = req.body;
            // Guardar el mensaje en la base de datos
            const messages = yield (0, dbConfig_1.MessagesCollection)();
            yield messages.insertOne({
                number,
                message,
                date: new Date(date),
                urlMedia: urlMedia || null,
                send: false,
            });
            res.end("Mensaje programado con éxito");
        })));
    }
    const adapterDB = yield (0, dbConfig_1.getMongoAdapter)();
    yield (0, bot_1.createBot)({
        flow: (0, bot_1.createFlow)([flowBienvenida]),
        database: adapterDB,
        provider,
    });
    // Cron job para enviar mensajes programados
    node_cron_1.default.schedule("* * * * *", () => __awaiter(void 0, void 0, void 0, function* () {
        const now = new Date();
        const options = { timeZone: "Europe/Madrid" };
        const nowInSpain = new Date(now.toLocaleString("en-US", options));
        console.log("nowInSpain", nowInSpain);
        // Convertir `now` a UTC si las fechas en la base de datos están en UTC
        const messages = yield (0, dbConfig_1.MessagesCollection)();
        const messagesToSend = yield messages
            .find({ send: false, date: { $lte: nowInSpain } })
            .toArray();
        for (const msg of messagesToSend) {
            try {
                yield provider.sendMessage(msg.number, msg.message, {
                    media: msg.urlMedia,
                });
                yield messages.updateOne({ _id: msg._id }, { $set: { send: true } });
            }
            catch (error) {
                console.error("Error al enviar el mensaje:", error);
            }
        }
    }));
});
main();
