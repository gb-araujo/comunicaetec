import { useState, useEffect } from 'react'
import defaultProfileImage from '../../../assets/fotoPadrao.png'
import { Avatar, Badge, Box, Typography, IconButton, Button, Divider } from "@mui/material"
import { List, ListItem, ListItemText } from "@mui/material"
import { Dialog } from "@mui/material"
import EditIcon from '@mui/icons-material/Edit'
import AddIcon from '@mui/icons-material/Add'
import CursoForm from './CursoForm'
import { styled } from '@mui/material/styles'
import { auth, storage, Realtimedb } from '../../Firebase'
import { updateProfile } from 'firebase/auth'
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'
import { ref as dbRef, update as dbUpdate, remove, onValue } from 'firebase/database'
import EditName from './EditName'

const StyledBadge = styled(Badge)({
    '&.MuiBadge-root:hover': {
        cursor: "pointer"
    },
    '& .MuiBadge-badge': {
        height: 30,
        width: 30,
        borderRadius: "50%",
        padding: 0
    },
    '& .MuiBadge-badge:hover': {
        backgroundColor: "#1682FD",
        transition: "0.2s",
        boxShadow: "0 0 10px"
    },
    '& .forInputFile': {
        height: 30,
        width: 30,
        borderRadius: "50%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
    },
    '& .forInputFile:hover': {
        cursor: "pointer",
    }
})

export default function User({ User, ProfilePic }) {
    const [picOpen, setPicOpen] = useState(false)
    const [cursosCad, setCursosCad] = useState([])
    const [editNameOpen, setEditNameOpen] = useState(false)

    useEffect(() => {
        onValue(dbRef(Realtimedb, `users/${User.uid}/curso`), (snapshot) => {
            if (snapshot.exists()) {
                const cursos = snapshot.val()
                const arrayCursos = Object.keys(cursos).map((cursoID) => {
                    const infoCursos = cursos[cursoID]
                    return { cursoID, ...infoCursos }
                })
                setCursosCad(arrayCursos)
            } else {
                setCursosCad([])
            }
        })
    }, [])

    const handleFileChange = (e) => {
        const imageFile = e.target.files[0]
        handleImageUpload(imageFile)
    }
    const handleImageUpload = async (imageFile) => {
        if (imageFile && User) {
            const storageRef2 = storageRef(storage, `images/profile_image_${User.uid}.jpg`)
            await uploadBytes(storageRef2, imageFile)
            const downloadURL = await getDownloadURL(storageRef2)

            try {
                await updateProfile(auth.currentUser, {
                    photoURL: downloadURL
                })

                await dbUpdate(dbRef(Realtimedb, `users/${User.uid}`), {
                    imageUrl: downloadURL
                })
            } catch (error) {
                console.error('Erro ao atualizar o perfil do usuário:', error)
            }
        }
    }

    async function DeleteCourse(cursoID) {
        await remove(dbRef(Realtimedb, `users/${User.uid}/curso/${cursoID}`))
        await remove(dbRef(Realtimedb, `solicitacoes//${User.uid + "-" + cursoID}`))
    }

    function profileOpen() {
        setPicOpen(true)
    }
    function profileClose() {
        setPicOpen(false)
    }

    return (
        <>
            <h1>
                {User.displayName}
                <IconButton size='small' color='primary' onClick={()=>setEditNameOpen(true)}>
                    <EditIcon></EditIcon>
                </IconButton>
            </h1>
            <h3>{User.email}</h3>
            <StyledBadge
                badgeContent={<label className="forInputFile" htmlFor="fileInput"><EditIcon sx={{ width: 20, height: 20 }}></EditIcon></label>}
                color="primary"
                overlap="circular"
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Avatar onClick={profileOpen} className="profilePic" src={ProfilePic} alt="Perfil" sx={{ width: 100, height: 100 }} />
                <input accept="image/*" id="fileInput" type="file" onChange={handleFileChange} hidden />
            </StyledBadge>

            <Dialog sx={{ ['& .MuiPaper-root']: { borderRadius: "50%" } }} open={picOpen} onClose={profileClose}>
                <Avatar className="profilePic" src={ProfilePic} alt="Perfil" sx={{ width: 300, height: 300 }} />
            </Dialog>

            <CursoForm User={User} ProfilePic={ProfilePic} />
            <EditName User={User} Open={editNameOpen} SetOpen={setEditNameOpen} />

            <Box sx={{ width: "100%", display: "flex", boxSizing: "border-box" }}>
                <Box sx={{ flexGrow: 1, textAlign: "center" }}>
                    <Typography variant='h6' sx={{ marginLeft: 5 }}>
                        Cursos Cadastrados
                        <IconButton color='primary'>
                            <AddIcon></AddIcon>
                        </IconButton>
                    </Typography>
                    {cursosCad.length > 0 ?
                        cursosCad.map((curso) => (
                            <List key={curso.cursoID} sx={{ margin: "auto", width: 300 }} >
                                <ListItem sx={{ padding: 0 }}>
                                    <ListItemText primary={curso.name + " - " + curso.periodo} />
                                </ListItem>
                                <ListItem sx={{ padding: 0 }}>
                                    <ListItemText primary={(
                                        <p>{curso.schoolName}
                                            <Button size='small' color='error' onClick={() => { DeleteCourse(curso.cursoID) }}>
                                                sair
                                            </Button>
                                        </p>)} />
                                </ListItem>
                                <ListItem sx={{ padding: 0 }}>
                                    <ListItemText primary={"status: " + curso.status} />
                                </ListItem>
                                <Divider color="#000" />
                            </List>
                        ))
                        : (<p>nenhum curso cadastrado</p>)
                    }
                </Box>
            </Box>
        </>
    )
}