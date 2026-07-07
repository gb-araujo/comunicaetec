import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { enviarEmailVerificacao } from '../../services/authService'
import './Verificacao.css'
import EnviarEmail from '../../assets/message.png'

function Verificacao() {
    const { user, loading } = useAuth()
    const [count, setCount] = useState(0)
    const navigate = useNavigate()

    useEffect(() => {
        if (loading) return
        if (!user) {
            navigate('/')
        } else if (user.emailVerified) {
            navigate('/usuario')
        }
    }, [user, loading, navigate])

    useEffect(() => {
        if (count <= 0) return undefined

        const interval = setInterval(() => {
            setCount((prevCounter) => prevCounter - 1)
        }, 1000)

        return () => clearInterval(interval)
    }, [count])

    async function enviarEmail() {
        if (count > 0 || !user) return
        setCount(60)
        await enviarEmailVerificacao(user)
    }

    return (
        <div className='ContainerVerificacao'>
            <h1>Verificação de E-mail</h1>
            <div className='BoxVerificacao'>
                <img src={EnviarEmail} alt="Carta de email" />
                <p>Clique no botão para enviar um email para: {user?.email}</p>
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
