import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getStorage } from 'firebase/storage'
import { getDatabase } from 'firebase/database'
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
    apiKey: "apikey",
    authDomain: "",
    projectId: "",
    storageBucket: "",
    messagingSenderId: "",
    appId: "",
    measurementId: ""
}

export default firebaseConfig

export const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const storage = getStorage(app)
export const Realtimedb = getDatabase(app)
export const Firestoredb = getFirestore(app)