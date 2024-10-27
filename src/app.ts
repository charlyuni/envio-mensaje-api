import { addKeyword, createBot, createFlow, createProvider } from "@bot-whatsapp/bot";
import { MessagesCollection, getMongoAdapter } from "./db/dbConfig";
import { BaileysProvider, handleCtx } from "@bot-whatsapp/provider-baileys";
import cron from "node-cron";


const flowBienvenida = addKeyword("hola").addAnswer(
  "¡Hola! ¿En qué puedo ayudarte?"
);

const main = async () => {
  const provider = createProvider(BaileysProvider);
  provider.initHttpServer(3002);

  // Endpoint para recibir y guardar el mensaje programado
  if (provider.http) {
    provider.http.server.post(
      "/schedule-message",
      handleCtx(async (bot, req, res) => {
        const { number, message, date, urlMedia } = req.body;

        // Guardar el mensaje en la base de datos
        const messages = await MessagesCollection();
        await messages.insertOne({
          number,
          message,
          date: new Date(date),
          urlMedia: urlMedia || null,
          send: false,
        });

        res.end("Mensaje programado con éxito");
      })
    );
  }

  const adapterDB = await getMongoAdapter();

  await createBot({
    flow: createFlow([flowBienvenida]),
    database: adapterDB,
    provider,
  });

  // Cron job para enviar mensajes programados
  cron.schedule("* * * * *", async () => {
    const now = new Date();
    const options = { timeZone: "Europe/Madrid" };
    const nowInSpain = new Date(now.toLocaleString("en-US", options));
    console.log("nowInSpain", nowInSpain);
    // Convertir `now` a UTC si las fechas en la base de datos están en UTC
    const messages = await MessagesCollection();

    const messagesToSend = await messages
      .find({ send: false, date: { $lte: nowInSpain } })
      .toArray();

    for (const msg of messagesToSend) {
      try {
        await provider.sendMessage(msg.number, msg.message, {
          media: msg.urlMedia,
        });
        await messages.updateOne({ _id: msg._id }, { $set: { send: true } });
      } catch (error) {
        console.error("Error al enviar el mensaje:", error);
      }
    }
  });
};

main();
