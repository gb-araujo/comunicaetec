import { useState } from 'react'
import { signInWithEmailAndPassword, updateProfile } from 'firebase/auth'
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth'
import { ref, update } from "firebase/database"
import { auth, Realtimedb } from '../Firebase'
import Navbar from '../Navbar/Navbar'
import LogoGoogle from '../../assets/google.png'
import Logo from '../../assets/logo.png'
import { TextField, Paper, Box, Button } from '@mui/material'
import { styled } from "@mui/material/styles"
import './Login.css'

const CssTextField = styled(TextField)({
    '& label': {
        color: '#000',

    },
    '& label.Mui-focused': {
        color: '#000',
    },
    '& .MuiOutlinedInput-root': {
        border: '0',
        '& fieldset': {
            borderColor: '#656ED3',
            borderRadius: '10px',
        },
        '&:hover fieldset': {
            borderColor: '#000',
            borderRadius: '10px',
            transition: '.1s'
        },
        '&.Mui-focused fieldset': {
            borderColor: '#58057E',
            borderRadius: '10px'
        },
    }
})

function Login() {
    const [email, setEmail] = useState('')
    const [senha, setSenha] = useState('')
    const [erro, setErro] = useState('')

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, senha)
            console.log(userCredential.user)
            if (!userCredential.user.emailVerified) {
                window.location.href = '/verificacao'
            } else {
                window.location.href = '/usuario'
            }
        } catch (error) {
            const err = JSON.stringify(error)
            console.log(JSON.parse(err).code)
            if (JSON.parse(err).code === "auth/invalid-credential" || JSON.parse(err).code === "auth/invalid-email") {
                setErro("informações incorretas")
            }
        }
    }

    const handleLoginGoogle = async () => {
        try {
            const provider = new GoogleAuthProvider()
            await signInWithPopup(auth, provider).then(async (userCredential) => {
                const user = userCredential.user

                await update(ref(Realtimedb, `users/${user.uid}`), {
                    displayName: user.displayName,
                    email: user.email,
                })

                window.location.href = "/usuario"
            })
        } catch (error) {
            console.log(error)
        }
    }

    return (
        <>
            <Navbar />
            <div className='Background'>
                <Paper sx={{ height: "80%" }} component="form" elevation={5} className="formLogin" onSubmit={handleSubmit} >
                    <img src={Logo} className='logo' alt="Logo" />
                    <Box className="input-groupLogin" sx={{ display: "flex", flexDirection: "column", marginY: 2, width: "100%" }}>
                        <CssTextField
                            error={erro ? true : false}
                            placeholder="a@example.com"
                            type="email"
                            id="email"
                            name="email"
                            label="Email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)} />
                    </Box>

                    <Box className="input-groupLogin" sx={{ display: "flex", flexDirection: "column", marginY: 2, width: "100%" }}>
                        <CssTextField
                            error={erro ? true : false}
                            placeholder="Digite sua senha"
                            type='password'
                            id="senha"
                            name="senha"
                            label="Senha"
                            value={senha}
                            onChange={(event) => setSenha(event.target.value)} />
                    </Box>
                    {erro && (<p style={{ color: "red" }}>{erro}</p>)}
                    <Button variant='contained' type="submit" className='LoginButton' sx={{
                        width: "100%",
                        m: 1
                    }}>Login</Button>

                    <Button variant='outlined' className='LoginGoogle' type='button' onClick={handleLoginGoogle} sx={{
                        backgroundColor: "white",
                        color: "black",
                        width: "100%",
                        m: 1
                    }}>
                        <img src={LogoGoogle} alt="Google Logo" />Login com Google
                    </Button>
                </Paper>
            </div>
        </>
    )
}

export default Login
