import express from "express";
import cors from "cors";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, getDoc, updateDoc, arrayUnion, Timestamp, collection, addDoc } from "firebase/firestore";
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

// 📌 Nueva Ruta para actualizar el estado de León
appServer.post("/update-leon", async (req, res) => {
  console.log("✅ POST /update-leon llamado");
  try {
    const leonRef = doc(db, "usuarios", "leon");

    await updateDoc(leonRef, {
      estado_actual: "Explorando",
      experiencias: arrayUnion({
        fecha: Timestamp.now(),
        evento: "León ha aprendido algo nuevo sobre su entorno."
      }),
      ultimo_aprendizaje: "Descubrir el mundo es parte del crecimiento.",
      color_actual: "Verde"
    });

    console.log("🔄 León ha evolucionado con nueva información.");
    res.json({ status: "success", message: "León ha aprendido algo nuevo!" });
  } catch (error) {
    console.error("❌ Error en /update-leon:", error);
    res.status(500).json({ status: "error", message: "Error al actualizar a León", error });
  }
});

// 📌 Nueva Ruta para enseñar a León
appServer.post("/teach-leon", async (req, res) => {
  console.log("✅ POST /teach-leon llamado");
  try {
    const { tema, contenido, fuente } = req.body;
    if (!tema || !contenido || !fuente) {
      return res.status(400).json({ status: "error", message: "Faltan datos en la petición." });
    }

    await addDoc(collection(db, "conocimientos"), {
      tema,
      contenido,
      fuente,
      fecha_aprendizaje: Timestamp.now()
    });

    console.log(`📚 León ha aprendido sobre ${tema}.`);
    res.json({ status: "success", message: `León ha aprendido sobre ${tema}!` });
  } catch (error) {
    console.error("❌ Error en /teach-leon:", error);
    res.status(500).json({ status: "error", message: "Error al enseñar a León", error });
  }
});

// 🚀 Iniciar servidor en el puerto correcto (Render detectará el puerto automáticamente)
appServer.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Servidor ejecutándose en el puerto ${PORT}`);
});
