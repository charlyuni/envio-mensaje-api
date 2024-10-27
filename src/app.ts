import {
  addKeyword,
  createBot,
  createFlow,
  createProvider,
} from "@bot-whatsapp/bot";
import {
  MessagesCollection,
  getContacts,
  getMongoAdapter,
} from "./db/dbConfig";
import { BaileysProvider } from "@bot-whatsapp/provider-baileys";
import cron from "node-cron";

const flowBienvenida = addKeyword("hola").addAnswer(
  "¡Hola! ¿En qué puedo ayudarte?"
);

const main = async () => {
  const provider = createProvider(BaileysProvider);
  provider.initHttpServer(3002);

  if (provider.http) {
    // Endpoint para programar mensajes
    provider.http.server.post("/schedule-message", async (req, res) => {
      const { number, message, date, urlMedia } = req.body;
      const messages = await MessagesCollection();
      await messages.insertOne({
        number,
        message,
        date: new Date(date),
        urlMedia: urlMedia || null,
        send: false,
      });
      res.end("Mensaje programado con éxito");
    });
    
    provider.http.server.get("/contacts", async (req, res) => {
      res.setHeader("Access-Control-Allow-Origin", "*"); // Permite cualquier origen
      res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS"); // Métodos permitidos
      res.setHeader("Access-Control-Allow-Headers", "Content-Type");

      if (req.method === "OPTIONS") {
        res.writeHead(204);
        res.end();
        return;
      }

      try {
        const contacts = await getContacts();
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(contacts)); // Serializa manualmente el JSON
      } catch (error) {
        console.error("Error al obtener los contactos:", error);
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Error al obtener los contactos" }));
      }
    });
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
