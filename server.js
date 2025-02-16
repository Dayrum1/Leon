import express from "express";
import cors from "cors";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, Timestamp } from "firebase/firestore";
import dotenv from "dotenv";
import wiki from "wikijs"; // 🔥 Librería de Wikipedia

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

// 📌 **Ruta mejorada para obtener información de Wikipedia**
appServer.get("/learn-from-wiki", async (req, res) => {
  console.log("✅ GET /learn-from-wiki llamado");

  const tema = req.query.tema;
  if (!tema) {
    return res.status(400).json({ status: "error", message: "Debes proporcionar un tema para aprender." });
  }

  try {
    // 🔍 Buscar coincidencias en Wikipedia
    const searchResults = await wiki().search(tema);

    if (searchResults.results.length === 0) {
      return res.status(404).json({ status: "error", message: `No se encontró un artículo sobre "${tema}" en Wikipedia.` });
    }

    let bestMatch = searchResults.results[0]; // 🏆 Primera coincidencia

    // 🔄 Si hay varias coincidencias, intentar encontrar una más precisa
    const filteredMatch = searchResults.results.find((title) =>
      title.toLowerCase().includes(tema.toLowerCase())
    );
    if (filteredMatch) bestMatch = filteredMatch;

    console.log(`🔍 Mejor coincidencia encontrada: ${bestMatch}`);

    // Obtener la página y su resumen
    const wikiPage = await wiki().page(bestMatch);
    const summary = await wikiPage.summary();

    // 🔄 **Evitar respuestas genéricas de desambiguación**
    if (summary.toLowerCase().includes("may refer to:")) {
      return res.status(400).json({
        status: "error",
        message: `La búsqueda de "${tema}" resultó en una página de desambiguación. Prueba un término más específico.`,
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
