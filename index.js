import express from "express";
import cors from "cors";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, getDoc, updateDoc, arrayUnion, Timestamp } from "firebase/firestore";
import dotenv from "dotenv";

dotenv.config();

// 🔥 Configuración de Firebase desde variables de entorno
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

// 🌍 Ruta para comprobar que el servidor está funcionando
appServer.get("/", (req, res) => {
  console.log("✅ GET / llamado - Servidor activo");
  res.send("🔥 Servidor de León está activo!");
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

// 🔹 Ruta para actualizar a León
appServer.post("/update-leon", async (req, res) => {
  console.log("✅ POST /update-leon llamado");
  try {
    const leonRef = doc(db, "usuarios", "leon");

    await updateDoc(leonRef, {
      estado_actual: "Evolucionando",
      experiencias: arrayUnion({
        fecha: Timestamp.now(),
        evento: "León ha alcanzado un nuevo nivel de comprensión."
      }),
      ultimo_aprendizaje: "El crecimiento no tiene límites.",
      color_actual: "Dorado",
      vinculo: 0.2
    });

    console.log("🔄 León ha evolucionado y aprendido algo nuevo.");
    res.json({ status: "success", message: "León ha aprendido algo nuevo!" });
  } catch (error) {
    console.error("❌ Error al actualizar a León:", error);
    res.status(500).json({ status: "error", message: "Error al actualizar a León", error });
  }
});

// 🚀 Iniciar servidor en el puerto correcto
appServer.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Servidor ejecutándose en el puerto ${PORT}`);
});

// 🔹 Ejecutar funciones en orden después de iniciar el servidor
async function escribirEnFirestore() {
  try {
    await setDoc(doc(db, "usuarios", "leon"), {
      nombre: "León",
      nivel: "Inicial",
      estado_actual: "Aprendiendo",
      experiencias: [],
      ultimo_aprendizaje: "Comprendí que cada acción tiene una consecuencia.",
      simbologia: "Un ser de luz en crecimiento.",
      energia: 100,
      color_actual: "Blanco",
      vinculo: 0.1,
      creadoEn: Timestamp.now()
    });
    console.log("✅ Datos de León guardados en Firestore correctamente");
  } catch (error) {
    console.error("❌ Error al guardar en Firestore:", error);
  }
}

// 🔹 Ejecutar inicialización
escribirEnFirestore();
