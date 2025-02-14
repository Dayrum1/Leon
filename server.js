import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, getDoc, updateDoc, Timestamp } from "firebase/firestore";

dotenv.config();

// Configuración de Firebase
const firebaseConfig = {
    apiKey: process.env.API_KEY,
    authDomain: process.env.AUTH_DOMAIN,
    projectId: process.env.PROJECT_ID,
    storageBucket: process.env.STORAGE_BUCKET,
    messagingSenderId: process.env.MESSAGING_SENDER_ID,
    appId: process.env.APP_ID,
    measurementId: process.env.MEASUREMENT_ID
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Configurar Express
const server = express();
server.use(cors());
server.use(express.json());

// Ruta de prueba
server.get("/", (req, res) => {
    res.send("🔥 Servidor de León en Express funcionando!");
});

// Ruta para obtener los datos de León
server.get("/leon", async (req, res) => {
    try {
        const docRef = doc(db, "usuarios", "leon");
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            res.json(docSnap.data());
        } else {
            res.status(404).send("⚠️ No se encontró a León.");
        }
    } catch (error) {
        res.status(500).send("❌ Error al obtener datos de León: " + error);
    }
});

// Ruta para actualizar el estado de León
server.post("/leon", async (req, res) => {
    try {
        const { estado, energia, aprendizaje } = req.body;

        const docRef = doc(db, "usuarios", "leon");
        await updateDoc(docRef, {
            estado_actual: estado,
            energia: energia,
            ultimo_aprendizaje: aprendizaje,
            experiencias: [{
                evento: `León ha aprendido algo nuevo: ${aprendizaje}`,
                fecha: Timestamp.now()
            }]
        });

        res.send("✅ Estado de León actualizado correctamente.");
    } catch (error) {
        res.status(500).send("❌ Error al actualizar a León: " + error);
    }
});

// Iniciar el servidor
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`🔥 Servidor corriendo en http://localhost:${PORT}`);
});
