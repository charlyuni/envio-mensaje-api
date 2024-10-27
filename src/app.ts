import {
  addKeyword,
  createBot,
  createFlow,
  createProvider,
} from "@bot-whatsapp/bot";
import getMongoAdapter from "./db/dbConfig";
import { BaileysProvider, handleCtx } from "@bot-whatsapp/provider-baileys";

const flowBienvenida = addKeyword("hola").addAnswer(
  "¡Hola! ¿En qué puedo ayudarte?"
);

const main = async () => {
  const provider = createProvider(BaileysProvider);

  provider.initHttpServer(3002);

  if (provider.http) {
    provider.http.server.post(
      "/send-message",
      handleCtx(async (bot, req, res) => {
        const { number, message, mediaURL } = req.body;
        await bot.sendMessage(number, message, { media: mediaURL });
        res.end("Mensaje enviado");
      })
    );
  }

  const adapterDB = getMongoAdapter();

  await createBot({
    flow: createFlow([flowBienvenida]),
    database: adapterDB,
    provider,
  });
};

main();
