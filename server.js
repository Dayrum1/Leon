import express from "express";
import cors from "cors";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, Timestamp } from "firebase/firestore";
import dotenv from "dotenv";
import wiki from "wikijs";
import translate from "@vitalets/google-translate-api"; // 🔥 Importamos un traductor

dotenv.config();

// 🔥 Configuración de Firebase
const firebaseConfig = {
  apiKey: process.env.API_KEY,
  authDomain: process.env.AUTH_DOMAIN,
  projectId: process.env.PROJECT_ID,
  storageBucket: process.env.STORAGE_BUCKET,
  messagingSenderId: process.env.MESSAGING_SENDER_ID,
  appId: process.env.APP_ID,
  measurementId: process.env.MEASUREMENT_ID,
};

// 🔥 Inicializar Firebase y Firestore
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);
console.log("🔥 León conectado a Firebase!");

// 🚀 Configuración del servidor Express
const appServer = express();
appServer.use(cors());
appServer.use(express.json());

const PORT = process.env.PORT || 10000;

// 🌍 Ruta para comprobar que el servidor está activo
appServer.get("/", (req, res) => {
  res.send("🔥 Servidor de León está activo!");
});

// 📌 **Ruta para aprender desde Wikipedia con soporte en español e inglés**
appServer.get("/learn-from-wiki", async (req, res) => {
  console.log("✅ GET /learn-from-wiki llamado");

  let tema = req.query.tema;
  if (!tema) {
    return res.status(400).json({ status: "error", message: "Debes proporcionar un tema para aprender." });
  }

  try {
    let searchResults;
    let bestMatch;
    let summary;

    // 🔍 Buscar primero en Wikipedia en español
    searchResults = await wiki({ apiUrl: "https://es.wikipedia.org/w/api.php" }).search(tema);

    if (searchResults.results.length === 0) {
      console.log(`⚠️ No se encontró "${tema}" en español. Probando en inglés...`);

      // 🔄 Traducir el tema al inglés
      const translated = await translate(tema, { to: "en" });
      const temaEnIngles = translated.text;
      console.log(`🔄 Tema traducido: ${tema} → ${temaEnIngles}`);

      // 🔍 Buscar en Wikipedia en inglés
      searchResults = await wiki({ apiUrl: "https://en.wikipedia.org/w/api.php" }).search(temaEnIngles);
    }

    if (searchResults.results.length === 0) {
      return res.status(404).json({ status: "error", message: `No se encontró un artículo sobre "${tema}" en Wikipedia.` });
    }

    // 🏆 Buscar una coincidencia exacta o la más relevante
    bestMatch = searchResults.results.find((title) =>
      title.toLowerCase() === tema.toLowerCase() || title.toLowerCase().includes(tema.toLowerCase())
    ) || searchResults.results[0]; // Si no hay exacta, tomamos la primera

    console.log(`🔍 Mejor coincidencia encontrada: ${bestMatch}`);

    // 🔍 Obtener la página y su resumen
    const wikiPage = await wiki({ apiUrl: "https://es.wikipedia.org/w/api.php" }).page(bestMatch);
    summary = await wikiPage.summary();

    // 🔄 **Evitar respuestas irrelevantes o de desambiguación**
    const keywordsToAvoid = ["film", "movie", "typeface", "novel", "band", "may refer to", "disambiguation"];
    if (keywordsToAvoid.some((word) => bestMatch.toLowerCase().includes(word) || summary.toLowerCase().includes(word))) {
      return res.status(400).json({
        status: "error",
        message: `El término "${tema}" tiene muchas definiciones. Prueba con algo más específico.`,
      });
    }

    // 🔥 Guardar el conocimiento en Firestore
    await addDoc(collection(db, "conocimientos"), {
      tema: bestMatch,
      contenido: summary,
      fuente: "Wikipedia",
      fecha_aprendizaje: Timestamp.now(),
    });

    console.log(`📚 León ha aprendido sobre ${bestMatch} desde Wikipedia.`);
    res.json({ status: "success", message: `León ha aprendido sobre ${bestMatch} desde Wikipedia!`, contenido: summary });

  } catch (error) {
    console.error("❌ Error al obtener datos de Wikipedia:", error);
    res.status(500).json({ status: "error", message: "Error al obtener información de Wikipedia", error });
  }
});

// 🚀 Iniciar servidor en el puerto correcto
appServer.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Servidor ejecutándose en el puerto ${PORT}`);
});
