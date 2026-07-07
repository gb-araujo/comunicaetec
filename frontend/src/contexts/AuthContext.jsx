import { createContext, useEffect, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { ref, onValue } from 'firebase/database'
import { auth, Realtimedb } from '../services/firebase'

// Uma única inscrição em onAuthStateChanged para o app inteiro.
// Antes, cada página criava a própria inscrição e redirecionava com
// window.location.href, recarregando o SPA a cada navegação.
export const AuthContext = createContext({
    user: null,
    profile: null,
    loading: true,
})

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [profile, setProfile] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
            setUser(firebaseUser)
            setLoading(false)
        })

        return unsubscribeAuth
    }, [])

    useEffect(() => {
        if (!user) {
            setProfile(null)
            return undefined
        }

        // Perfil em users/{uid} (imagem, flag de administrador, curso...)
        const unsubscribeProfile = onValue(
            ref(Realtimedb, `users/${user.uid}`),
            (snapshot) => setProfile(snapshot.exists() ? snapshot.val() : null)
        )

        return unsubscribeProfile
    }, [user])

    return (
        <AuthContext.Provider value={{ user, profile, loading }}>
            {children}
        </AuthContext.Provider>
    )
}
