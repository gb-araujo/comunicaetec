import { useEffect, useState } from "react"
import { Box, Button, Dialog, Paper, Typography, IconButton } from "@mui/material"
import CloseIcon from '@mui/icons-material/Close'
import { styled } from "@mui/material/styles"
import { Realtimedb } from "../../../Firebase"
import { ref as dbRef, onValue, remove } from 'firebase/database'
import AvisoForm from "./AvisoForm"

const PostImage = styled('img')({})

export default function AvisoAdm({ Adm }) {
    const [open, setOpen] = useState(false)
    const [avisos, setAvisos] = useState([])
    const [imageOpen, setImageOpen] = useState(false)
    const [imageSRC, setImageSRC] = useState("")

    useEffect(() => {
        const avisosRef = dbRef(Realtimedb, `avisos/${Adm}`)
        onValue(avisosRef, (snapshot) => {
            if (snapshot.exists()) {
                const avisosData = snapshot.val()
                const arrayavisos = Object.keys(avisosData).map((avisoID) => {
                    const infoAvisos = avisosData[avisoID]
                    const formatDate = new Date(avisosData[avisoID].createdAt).toLocaleDateString('pt-BR')
                    return { avisoID, ...infoAvisos, formatDate }
                })
                setAvisos(arrayavisos.reverse())
            } else {
                setAvisos([])
            }
        })
    }, [])

    function DeleteAviso(avisoID) {
        const deleteRef = dbRef(Realtimedb, `avisos/${Adm}/${avisoID}`)
        remove(deleteRef)
    }

    function OnImageClick(e) {
        setImageSRC(e.target.src)
        setImageOpen(true)
    }
    function OnImageClose() {
        setImageOpen(false)
    }

    return (
        <>
            <Button variant="outlined" onClick={() => setOpen(true)}>Adicionar Aviso</Button>
            <AvisoForm Open={open} SetOpen={setOpen} Adm={Adm} />
            {avisos.length > 0 ?
                avisos.map((aviso) => (
                    <Paper key={aviso.avisoID} sx={{ margin: 1, padding: 2, width: { xs: "250px", sm: "400px" } }} elevation={5}>
                        <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                            <IconButton onClick={() => { DeleteAviso(aviso.avisoID) }}>
                                <CloseIcon />
                            </IconButton>
                        </Box>
                        <Typography sx={{ mb: 1 }}> {aviso.content} </Typography>
                        <Box sx={{ display: "flex", justifyContent: "center" }}>
                            <PostImage sx={{ width: "250px" }} src={aviso.imgURL} onClick={OnImageClick} />
                        </Box>
                        <Typography sx={{ mt: 1 }}> {aviso.formatDate} </Typography>
                    </Paper>
                ))
                : (<p>nenhum post dessa escola</p>)}

            <Dialog open={imageOpen} onClose={OnImageClose}>
                <PostImage src={imageSRC} sx={{ width: { xs: "300px", sm: "400px" } }} />
            </Dialog>
        </>
    )
}