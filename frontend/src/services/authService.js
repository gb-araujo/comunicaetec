import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPopup,
    signOut,
    updateProfile,
    sendEmailVerification,
    GoogleAuthProvider,
} from 'firebase/auth'
import { ref, set, update } from 'firebase/database'
import { auth, Realtimedb } from './firebase'

// Centraliza as chamadas de autenticação para os componentes não
// dependerem diretamente do SDK do Firebase.

export async function loginComEmail(email, senha) {
    const { user } = await signInWithEmailAndPassword(auth, email, senha)
    return user
}

export async function loginComGoogle() {
    const provider = new GoogleAuthProvider()
    const { user } = await signInWithPopup(auth, provider)

    await update(ref(Realtimedb, `users/${user.uid}`), {
        displayName: user.displayName,
        email: user.email,
    })

    return user
}

export async function registrar({ nome, sobrenome, email, senha }) {
    const { user } = await createUserWithEmailAndPassword(auth, email, senha)

    await updateProfile(user, {
        displayName: `${nome.trim()} ${sobrenome.trim()}`,
    })

    await set(ref(Realtimedb, `users/${user.uid}`), {
        displayName: user.displayName,
        email: user.email,
    })

    return user
}

export function enviarEmailVerificacao(user) {
    return sendEmailVerification(user)
}

export function logout() {
    return signOut(auth)
}

// Mensagens amigáveis para os códigos de erro mais comuns do Firebase Auth.
export function mensagemDeErro(error) {
    switch (error?.code) {
        case 'auth/invalid-credential':
        case 'auth/invalid-email':
        case 'auth/wrong-password':
        case 'auth/user-not-found':
            return 'Email ou senha incorretos.'
        case 'auth/email-already-in-use':
            return 'Este email já está cadastrado.'
        case 'auth/weak-password':
            return 'A senha deve ter pelo menos 6 caracteres.'
        case 'auth/too-many-requests':
            return 'Muitas tentativas. Aguarde um momento e tente novamente.'
        case 'auth/popup-closed-by-user':
            return 'Login cancelado.'
        default:
            return 'Ocorreu um erro. Tente novamente.'
    }
}
