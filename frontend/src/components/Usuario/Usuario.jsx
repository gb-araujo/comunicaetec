import { useState, useEffect } from 'react'
import { onAuthStateChanged, signOut } from "firebase/auth"
import { ref as dbRef, onValue, onChildChanged } from 'firebase/database'
import { auth, Realtimedb } from '../Firebase'
import Sidebar from '../Sidebar/Sidebar'
import { AppBar, Toolbar, Box, Button, IconButton } from "@mui/material"
import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight'
import User from "../UserPages/User/UserPage"
import Calendario from "../UserPages/Calendario/Calendario"
import ForumDuvidas from "../UserPages/Forum/ForumDuvidas"
import Aviso from "../UserPages/Aviso/Aviso"
import "./Usuario.css"
import Solicitacoes from '../UserPages/Solicitacoes/Solicitacoes'

function Usuario() {
    const [profileImageURL, setProfileImageURL] = useState(null)
    const [user, setUser] = useState('')
    const [main, setMain] = useState('usuario')
    const [openMenu, setOpenMenu] = useState(false)
    const [rotate, setRotate] = useState('noRotate')
    const [adm, setAdm] = useState('')

    useEffect(() => {
        onAuthStateChanged(auth, async (user) => {
            if (user) {
                if (!user.emailVerified) {
                    return window.location.href = '/verificacao'
                }

                setUser(user)
                getUser(user)

            } else {
                return window.location.href = '/registro'
            }
        })
    }, [])

    function getUser(user) {
        onValue(dbRef(Realtimedb, `users/${user.uid}`), (snapshot) => {
            if (snapshot.exists()) {
                const User = snapshot.val()
                setProfileImageURL(User.imageUrl)

                if (User.adm) {
                    setAdm(User.adm)
                } else {
                    setAdm("")
                }
            }
        })
    }

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
    function changeMainToUsuario() {
        setMain('usuario')
        setOpenMenu(false)
        setRotate("noRotate")
    }
    function changeMainToCalendario() {
        setMain('calendario')
        setOpenMenu(false)
        setRotate("noRotate")
    }
    function changeMainToForum() {
        setMain('forum')
        setOpenMenu(false)
        setRotate("noRotate")
    }
    function changeMainToAvisos() {
        setMain('avisos')
        setOpenMenu(false)
        setRotate("noRotate")
    }
    function changeMainToSolicitacoes() {
        setMain('solicitacoes')
        setOpenMenu(false)
        setRotate("noRotate")
    }

    const handleSignOut = async () => {
        try {
            await signOut(auth)
            window.location.href = "/"
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
                    Usuario={changeMainToUsuario}
                    Calendario={changeMainToCalendario}
                    Forum={changeMainToForum}
                    Avisos={changeMainToAvisos}
                    Solicitacoes={changeMainToSolicitacoes}
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
