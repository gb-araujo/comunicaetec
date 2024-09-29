import { useState, useEffect } from 'react'
import { sendEmailVerification, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js"
import { auth } from '../Firebase'
import './Verificacao.css'
import EnviarEmail from '../../assets/message.png'
import { Link } from 'react-router-dom';

function Verificacao() {
    const [User, setUser] = useState({})
    const [count, setCount] = useState(0)

    useEffect(() => {
        onAuthStateChanged(auth, async (user) => {
            if (user) {
                setUser(user)
                if (user.emailVerified) {
                    window.location.href = "/usuario"
                }
            } else {
                window.location.href = "/"
            }
        })
    }, [])

    useEffect(() => {
        if (count < 0) { return }
        const interval = setInterval(() => {
            setCount((prevCounter) => prevCounter - 1);
        }, 1000)

        return () => clearInterval(interval);
    }, [])

    async function enviarEmail() {
        if (count > 0) { return }
        setCount(60)
        await sendEmailVerification(User).then(() => {
            console.log("email enviado")
        })
    }

    return (
        <div className='ContainerVerificacao'>
            <h1>Verificação de E-mail</h1>
            <div className='BoxVerificacao'>
                <img src={EnviarEmail} alt="Carta de email" />
                <p>Clique no botão para enviar um email para: {User.email}</p>
                <button onClick={enviarEmail}>Enviar email</button>
                {count <= 60 && count > 0 && <p>Aguarde {count} segundos para enviar outro email.</p>}
                <Link to="/" className='retorno'>
                    <button type='submit'>Login</button>
                </Link>
            </div>
        </div>
    )
}

export default Verificacao;
