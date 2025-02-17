import express from "express";
import cors from "cors";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs, query, where, Timestamp } from "firebase/firestore";
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

// 📌 **Ruta para recuperar lo que León ha aprendido**
appServer.get("/recall-leon", async (req, res) => {
  console.log("✅ GET /recall-leon llamado");

  const tema = req.query.tema;
  if (!tema) {
    return res.status(400).json({ status: "error", message: "Debes proporcionar un tema para recordar." });
  }

  try {
    const conocimientosRef = collection(db, "conocimientos");
    const q = query(conocimientosRef, where("tema", "==", tema));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return res.status(404).json({ status: "error", message: `León no recuerda nada sobre "${tema}".` });
    }

    let conocimientos = [];
    querySnapshot.forEach((doc) => {
      conocimientos.push(doc.data());
    });

    console.log(`🧠 León recuerda ${conocimientos.length} cosas sobre "${tema}".`);
    res.json({ status: "success", data: conocimientos });

  } catch (error) {
    console.error("❌ Error al recuperar información:", error);
    res.status(500).json({ status: "error", message: "Error al recuperar información de León", error });
  }
});

// 🚀 Iniciar servidor en el puerto correcto
appServer.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Servidor ejecutándose en el puerto ${PORT}`);
});
