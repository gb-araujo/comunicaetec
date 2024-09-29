import React, { useState, useEffect } from 'react'
import defaultProfileImage from '../../assets/fotoPadrao.png'
import './Sidebar.css'
import { Link } from 'react-router-dom'
import { Avatar, Drawer, ListItem, List, ListItemButton } from "@mui/material"
import { styled } from '@mui/material/styles'
import calendario from '../../assets/calendario.png'
import forum from '../../assets/forum.png'
import avisos from '../../assets/avisos.png'
import chat from '../../assets/chat.png'
import solicitacao from '../../assets/solicitacao.png'

const StyledDrawer = styled(Drawer)({
    '&.MuiDrawer-root': {
        width: 330,
        position: "fixed"
    },
    '& .MuiDrawer-paper': {
        paddingTop: 70,
        position: 'static',
        height: "100%",
    }
})

function Sidebar({ User, Forum, Usuario, Calendario, Avisos, Solicitacoes, OpenMenu, SetOpenMenu, Adm, ProfilePic }) {
    const [profileImageURL, setProfileImageURL] = useState(null)

    useEffect(() => {
        if (User.photoURL) {
            setProfileImageURL(User.photoURL)
        } else {
            setProfileImageURL(defaultProfileImage)
        }
    }, [])

    return (
        <>
            <StyledDrawer variant='permanent' sx={{ display: { xs: 'none', md: 'block' } }} className="Sidebar" >
                <Link to="/usuario" onClick={Usuario} >
                    <div className="Profile">
                        {User && (
                            <div className='perfilButton'>
                                <Avatar src={ProfilePic} alt="Foto de perfil" />
                                <ul>
                                    <li>{User.displayName}</li>
                                    <li>{User.email}</li>
                                </ul>
                            </div>
                        )}
                    </div>
                </Link>
                <div className='Listas'>
                    <List>
                        <ListItem><ListItemButton onClick={Calendario}><img src={calendario} alt="" /> Calendário</ListItemButton></ListItem>
                        <ListItem><ListItemButton onClick={Forum}><img src={forum} alt="" /> Fórum</ListItemButton></ListItem>
                        <ListItem><ListItemButton onClick={Avisos}><img src={avisos} alt="" /> Avisos</ListItemButton></ListItem>
                        {Adm && <ListItem><ListItemButton onClick={Solicitacoes}><img src={solicitacao} alt="" /> Solicitações</ListItemButton></ListItem>}
                    </List>
                </div>
            </StyledDrawer>
            <StyledDrawer variant='temporary' sx={{ display: { xs: 'block', md: 'none' } }}
                className="Sidebar"
                open={OpenMenu}
                onClose={()=>{SetOpenMenu(false)}}
            >
                <Link to="/usuario" onClick={Usuario} >
                    <div className="Profile">
                        {User && (
                            <div className='perfilButton'>
                                <Avatar src={profileImageURL} alt="Foto de perfil" />
                                <ul>
                                    <li>{User.displayName}</li>
                                    <li>{User.email}</li>
                                </ul>
                            </div>
                        )}
                    </div>
                </Link>
                <div className='Listas'>
                    <List>
                        <ListItem><ListItemButton onClick={Calendario}><img src={calendario} alt="" /> Calendário</ListItemButton></ListItem>
                        <ListItem><ListItemButton onClick={Forum}><img src={forum} alt="" /> Fórum</ListItemButton></ListItem>
                        <ListItem><ListItemButton onClick={Avisos}><img src={avisos} alt="" /> Avisos</ListItemButton></ListItem>
                        {Adm && <ListItem><ListItemButton onClick={Solicitacoes}><img src={solicitacao} alt="" /> Solicitações</ListItemButton></ListItem>}
                    </List>
                </div>
            </StyledDrawer>
        </>
    )
}

export default Sidebar;
