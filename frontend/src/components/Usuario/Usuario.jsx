import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { logout } from '../../services/authService'
import Sidebar from '../Sidebar/Sidebar'
import { AppBar, Toolbar, Box, Button, IconButton } from "@mui/material"
import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight'
import User from "../UserPages/User/UserPage"
import ForumDuvidas from "../UserPages/Forum/ForumDuvidas"
import Aviso from "../UserPages/Aviso/Aviso"
import "./Usuario.css"
import Solicitacoes from '../UserPages/Solicitacoes/Solicitacoes'

function Usuario() {
    // Sessão e perfil vêm do AuthContext; a proteção da rota
    // (login/verificação) é feita pelo RequireAuth no App.
    const { user, profile } = useAuth()
    const [main, setMain] = useState('usuario')
    const [openMenu, setOpenMenu] = useState(false)
    const [rotate, setRotate] = useState('noRotate')
    const navigate = useNavigate()

    const profileImageURL = profile?.imageUrl ?? null
    const adm = profile?.adm ?? ''

    function toggleMenu(isOpen) {
        setOpenMenu(isOpen)
    }
    function menuButton() {
        if (openMenu) {
            setOpenMenu(false)
            setRotate("noRotate")
        } else {
            setOpenMenu(true)
            setRotate("rotate")
        }
    }
    function changeMain(page) {
        setMain(page)
        setOpenMenu(false)
        setRotate("noRotate")
    }

    const handleSignOut = async () => {
        try {
            await logout()
            navigate('/')
        } catch (error) {
            console.error('Erro ao sair:', error)
        }
    }

    return (
        <Box className='main'>
            <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, backgroundColor: "white", boxShadow: "none" }} className='NavUsu'>
                <Toolbar sx={{ justifyContent: { xs: "space-between", md: "flex-end" }, alignItems: "end", marginBottom: 1 }}>
                    <IconButton className={rotate} color='primary' sx={{ display: { md: 'none' }, transition: "0.4s" }} onClick={menuButton}>
                        <KeyboardDoubleArrowRightIcon />
                    </IconButton>
                    <Button variant='outlined' onClick={handleSignOut}>Sair</Button>
                </Toolbar>
            </AppBar>
            <Box sx={{ width: "100%", display: "flex" }}>
                {user && <Sidebar
                    Adm={adm}
                    ProfilePic={profileImageURL}
                    OpenMenu={openMenu}
                    SetOpenMenu={toggleMenu}
                    User={user}
                    Usuario={() => changeMain('usuario')}
                    Calendario={() => changeMain('calendario')}
                    Forum={() => changeMain('forum')}
                    Avisos={() => changeMain('avisos')}
                    Solicitacoes={() => changeMain('solicitacoes')}
                />}
                <Box className='Usuario' sx={{ width: "100%", height: "100%", padding: 8, ml: { xs: 0, md: 41 } }}>
                    {user && main == 'usuario' ? (<User User={user} ProfilePic={profileImageURL} />) : ""}
                    {user && main == 'forum' ? (<ForumDuvidas ProfilePic={profileImageURL} User={user} Adm={adm} />) : ""}
                    {user && main == 'calendario' ? (<p>em manutenção</p>) : ""}
                    {user && main == 'avisos' ? (<Aviso Adm={adm} User={user} />) : ""}
                    {user && main == 'solicitacoes' ? (<Solicitacoes Adm={adm} User={user} />) : ""}
                </Box>
            </Box>
        </Box>
    )
}

export default Usuario
