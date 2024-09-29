import { useEffect, useState } from "react"
import { Box, Button, Dialog, Paper, Typography } from "@mui/material"
import { Select, MenuItem, InputLabel, FormControl } from "@mui/material"
import { styled } from "@mui/material/styles"
import { Realtimedb } from "../../../Firebase"
import { ref as dbRef, onValue, query, orderByChild } from 'firebase/database'

const PostImage = styled('img')({ borderRadius: "5px"})

export default function AvisoUser({ User }) {
    const [cursos, setCursos] = useState([])
    const [select, setSelect] = useState('')
    const [avisos, setAvisos] = useState([])
    const [imageOpen, setImageOpen] = useState(false)
    const [imageSRC, setImageSRC] = useState("")

    useEffect(() => {
        const userRef = dbRef(Realtimedb, `users/${User.uid}/curso`)
        onValue(userRef, (snapshot) => {
            if (snapshot.exists()) {
                const cursosData = snapshot.val()
                const arrayCursos = Object.keys(cursosData).map((cursoID) => {
                    const infoCurso = cursosData[cursoID]
                    return { cursoID, ...infoCurso }
                })
                const filterArray = arrayCursos.filter((curso) => curso.status === "aprovado")
                const reduceArray = filterArray.reduce((acc, curso) => {
                    if (!acc[curso.idEscola]) {
                        acc[curso.idEscola] = { idEscola: curso.idEscola, nomeEscola: curso.schoolName }
                    }
                    return acc
                }, {})
                setCursos(Object.values(reduceArray))
            } else {
                setCursos([])
            }
        }, {
            onlyOnce: true
        })
    }, [])

    function OnSelectChange(e) {
        setSelect(e.target.value)

        const avisosRef = query(dbRef(Realtimedb, `avisos/${e.target.value}`), orderByChild('createdAt'))
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
            {cursos.length > 0 ?
                <Box sx={{display: "flex", justifyContent: "center"}}>
                    <FormControl>
                        <InputLabel> escolas que você participa </InputLabel>
                        <Select value={select} sx={{ width: "300px" }} onChange={OnSelectChange}>
                            {cursos.map((curso) => (
                                <MenuItem key={curso.idEscola} value={curso.idEscola}>{curso.nomeEscola}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Box>
                : <Typography>Você não tem nenhum curso cadastrado ou aprovado</Typography>}

            {avisos.length > 0 ?
                avisos.map((aviso) => (
                    <Paper key={aviso.avisoID} sx={{ margin: 1, padding: 2, width: { xs: "250px", sm: "400px" } }} elevation={5}>
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