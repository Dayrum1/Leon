import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, getDoc, updateDoc, arrayUnion, Timestamp } from "firebase/firestore";
import dotenv from "dotenv";
dotenv.config();

// Configuración de Firebase desde variables de entorno
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

console.log("🔥 León conectado a Firebase!");

// Función para escribir en Firestore
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

// Función para leer desde Firestore
async function leerDesdeFirestore() {
  try {
    const docRef = doc(db, "usuarios", "leon");
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      console.log("📄 Datos obtenidos de Firestore:", docSnap.data());
    } else {
      console.log("⚠️ No se encontró el documento.");
    }
  } catch (error) {
    console.error("❌ Error al leer desde Firestore:", error);
  }
}

// 🔹 Nueva función para actualizar los datos de León
async function actualizarLeon() {
  try {
    const leonRef = doc(db, "usuarios", "leon");

    await updateDoc(leonRef, {
      estado_actual: "Reflexionando",
      experiencias: arrayUnion({
        fecha: Timestamp.now(),
        evento: "León ha aprendido algo nuevo sobre el cambio."
      }),
      ultimo_aprendizaje: "El cambio es parte del crecimiento.",
      color_actual: "Azul"
    });

    console.log("🔄 León ha cambiado su estado y aprendido algo nuevo.");
  } catch (error) {
    console.error("❌ Error al actualizar a León:", error);
  }
}

// Ejecutar funciones en orden
escribirEnFirestore().then(() => {
  setTimeout(() => {
    leerDesdeFirestore().then(() => {
      actualizarLeon();
    });
  }, 2000);
});
