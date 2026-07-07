import './Registro.css'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../Navbar/Navbar'
import { registrar, mensagemDeErro } from '../../services/authService'
import { Button, TextField, Box, Paper } from "@mui/material"
import { styled } from "@mui/material/styles"

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

function Registro() {
    const [nome, setNome] = useState('')
    const [sobrenome, setSobrenome] = useState('')
    const [email, setEmail] = useState('')
    const [senha, setSenha] = useState('')
    const [erro, setErro] = useState('')
    const navigate = useNavigate()

    async function handleSubmit(e) {
        e.preventDefault()
        setErro('')

        try {
            await registrar({ nome, sobrenome, email, senha })
            // Conta nova ainda não tem o email verificado
            navigate('/verificacao')
        } catch (error) {
            setErro(mensagemDeErro(error))
        }
    }

    return (
        <>
            <div>
                <Navbar />
            </div>
            <div className='Background2'>
                <div className='formRegistro'>
                    <Paper component={"form"} elevation={5} sx={{backgroundColor: "#fff"}} onSubmit={handleSubmit}>
                        {erro && <p className='mensagemErro'>{erro}</p>}
                        <h2>REGISTRO</h2>
                        <Box sx={{ display: "flex", width: "100%", marginY: 2 }}>
                            <Box className="input-group" sx={{ display: "flex", flexDirection: "column", marginRight: 1, width: "100%" }}>
                                <CssTextField
                                    label="Nome"
                                    type="text"
                                    id="nome"
                                    name="nome"
                                    value={nome}
                                    onChange={(event) => setNome(event.target.value)}
                                />
                            </Box>

                            <Box className="input-group" sx={{ display: "flex", flexDirection: "column", marginLeft: 1, width: "100%" }}>
                                <CssTextField
                                    label="Sobrenome"
                                    type="text"
                                    id="sobrenome"
                                    name="sobrenome"
                                    value={sobrenome}
                                    onChange={(event) => setSobrenome(event.target.value)}
                                />
                            </Box>
                        </Box>

                        <Box className="input-group" sx={{ display: "flex", flexDirection: "column", marginY: 2, width: "100%" }}>
                            <CssTextField
                                label="Email"
                                type="email"
                                id="email"
                                name="email"
                                value={email}
                                onChange={(event) => setEmail(event.target.value)}
                            />
                        </Box>

                        <Box className="input-group" sx={{ display: "flex", flexDirection: "column", marginY: 2, width: "100%" }}>
                            <CssTextField
                                label="Senha"
                                type='password'
                                id="senha"
                                name="senha"
                                value={senha}
                                onChange={(event) => setSenha(event.target.value)}
                            />
                        </Box>

                        <Button className='buttonRegister' variant='contained' type="submit" sx={{ width: "100%", marginY: 1 }}>Registrar</Button>
                    </Paper>
                </div>
            </div>
        </>
    )
}

export default Registro
