import express from "express";
import cors from "cors";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import dotenv from "dotenv";

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

// 🌍 Ruta principal
appServer.get("/", (req, res) => {
  console.log("✅ GET / llamado - Servidor activo");
  res.send("🔥 Servidor de León está activo!");
});

// 📌 Nueva ruta para probar si Render la detecta
appServer.get("/test", (req, res) => {
  console.log("✅ GET /test llamado");
  res.json({ status: "success", message: "Ruta de prueba funcionando!" });
});

// 📌 Ruta para obtener el estado de León
appServer.get("/status", async (req, res) => {
  console.log("✅ GET /status llamado");
  try {
    const docRef = doc(db, "usuarios", "leon");
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      console.log("✅ Datos obtenidos de Firestore:", docSnap.data());
      res.json({ status: "success", data: docSnap.data() });
    } else {
      console.log("⚠️ León no encontrado en Firestore");
      res.status(404).json({ status: "error", message: "León no encontrado" });
    }
  } catch (error) {
    console.error("❌ Error en /status:", error);
    res.status(500).json({ status: "error", message: "Error al obtener los datos", error });
  }
});

// 🚀 FORZAR DETECCIÓN DEL PUERTO EN RENDER
const PORT = process.env.PORT || 3000;
appServer.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Servidor ejecutándose en el puerto ${PORT}`);
});