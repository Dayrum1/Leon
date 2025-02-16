import express from "express";
import cors from "cors";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, getDoc, updateDoc, arrayUnion, Timestamp, collection, addDoc } from "firebase/firestore";
import dotenv from "dotenv";
import wiki from "wikijs"; // 🔥 Importamos la librería de Wikipedia

dotenv.config();

// 🔥 Configuración de Firebase
const firebaseConfig = {
  apiKey: process.env.API_KEY,
  authDomain: process.env.AUTH_DOMAIN,
  projectId: process.env.PROJECT_ID,
  storageBucket: process.env.STORAGE_BUCKET,
  messagingSenderId: process.env.MESSAGING_SENDER_ID,
  appId: process.env.APP_ID,
  measurementId: process.env.MEASUREMENT_ID
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

// 📌 Ruta para obtener información de Wikipedia y almacenarla en Firestore
appServer.get("/learn-from-wiki", async (req, res) => {
  console.log("✅ GET /learn-from-wiki llamado");

  const tema = req.query.tema;
  if (!tema) {
    return res.status(400).json({ status: "error", message: "Debes proporcionar un tema para aprender." });
  }

  try {
    // 🔍 Buscar información en Wikipedia
    const wikiPage = await wiki().page(tema);
    const summary = await wikiPage.summary(); // Obtener el resumen del artículo

    if (!summary) {
      return res.status(404).json({ status: "error", message: "No se encontró información en Wikipedia." });
    }

    // 🔥 Guardar el conocimiento en Firestore
    await addDoc(collection(db, "conocimientos"), {
      tema,
      contenido: summary,
      fuente: "Wikipedia",
      fecha_aprendizaje: Timestamp.now()
    });

    console.log(`📚 León ha aprendido sobre ${tema} desde Wikipedia.`);
    res.json({ status: "success", message: `León ha aprendido sobre ${tema} desde Wikipedia!`, contenido: summary });

  } catch (error) {
    console.error("❌ Error al obtener datos de Wikipedia:", error);
    res.status(500).json({ status: "error", message: "Error al obtener información de Wikipedia", error });
  }
});

// 🚀 Iniciar servidor en el puerto correcto (Render detectará el puerto automáticamente)
appServer.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Servidor ejecutándose en el puerto ${PORT}`);
});