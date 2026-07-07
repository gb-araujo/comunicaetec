import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getStorage } from 'firebase/storage'
import { getDatabase } from 'firebase/database'
import { getFirestore } from 'firebase/firestore'

// Configuração via variáveis de ambiente (Vite): copie .env.example para
// .env e preencha com os valores do console do Firebase.
// As chaves de web app do Firebase não são secretas (vão para o navegador),
// mas mantê-las fora do código facilita trocar de projeto por ambiente.
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
}

if (!firebaseConfig.apiKey) {
    throw new Error(
        'Configuração do Firebase ausente. Copie frontend/.env.example para frontend/.env e preencha as variáveis VITE_FIREBASE_*.'
    )
}

export const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const storage = getStorage(app)
export const Realtimedb = getDatabase(app)
export const Firestoredb = getFirestore(app)
