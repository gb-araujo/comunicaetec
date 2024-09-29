import { useState, useEffect } from 'react'
import { DialogContent, Dialog, DialogTitle, DialogActions, Avatar, Box, Typography } from "@mui/material"
import { FormControl, InputLabel, Select, MenuItem, Fab, Button, TextField, IconButton } from "@mui/material"
import { styled } from "@mui/material/styles"
import AddIcon from '@mui/icons-material/Add'
import AddAPhotoIcon from '@mui/icons-material/AddAPhoto'
import CloseIcon from '@mui/icons-material/Close'
import { Realtimedb, Firestoredb, storage } from "../../Firebase"
import { ref as dbRef, onValue, push } from 'firebase/database'
import { collection, query, getDocs, where, doc, getDoc } from "firebase/firestore"
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'

const PostImage = styled('img')({
    maxWidth: "250px",
    maxHeight: "250px",
    borderRadius: "10px"
})

export default function ForumForm({ ProfilePic, User, Adm, arrayCursos, arrayEscola, admCourse, Disable }) {
    const [open, setOpen] = useState(false)
    const [previewImage, setPreviewImage] = useState(null)
    const [filterArray, setFilterArray] = useState([])
    const [content, setContent] = useState('')
    const [selectedImage, setSelectedImage] = useState(null)
    const [selectCurso, setSelectCurso] = useState('todos')
    const [selectEscola, setSelectEscola] = useState('')

    useEffect(() => {
        if (Adm) {
            setFilterArray(admCourse)
            setSelectEscola(Adm)
        }
    }, [])

    const handleImageChange = (event) => {
        if (event.target.files && event.target.files[0]) {
            const reader = new FileReader()
            reader.onload = (e) => {
                setSelectedImage(event.target.files[0])
                setPreviewImage(e.target.result)
            }
            reader.readAsDataURL(event.target.files[0])
        }
    }
    function OnImageClose() {
        setSelectedImage(null)
        setPreviewImage(null)
    }

    function OnSchoolChange(e) {
        setSelectEscola(e.target.value)
        if (Adm) { return }

        const array = arrayCursos.filter((curso) => curso.idEscola === e.target.value)
        setFilterArray(array)
    }

    function OnCourseChange(e) {
        setSelectCurso(e.target.value)
    }

    async function OnPost() {
        if (!content && !selectedImage) { return }
        if (!selectEscola || !selectCurso) { return }

        let downloadURL = null
        const dataAtual = Date.now()
        let tag = ""
        const schoolName = (await getDoc(doc(Firestoredb, `escolas`, selectEscola))).data()

        if (selectedImage) {
            const StorageRef = storageRef(storage, `post_image/image_${dataAtual}.jpg`)

            await uploadBytes(StorageRef, selectedImage)
            downloadURL = await getDownloadURL(StorageRef)
        }

        if (selectCurso != "todos") {
            const course = (await getDoc(doc(Firestoredb, `cursos`, selectCurso))).data()
            tag = course.nome + "-" + course.periodo
        } else {
            tag = selectCurso
        }

        const post = {
            content: content,
            imgURL: downloadURL,
            schoolID: selectEscola,
            schoolName: schoolName.nome,
            tag: tag,
            userID: User.uid,
            userName: User.displayName,
            userImage: ProfilePic,
            adm: Adm,
            createdAt: dataAtual
        }

        const PostsRef = dbRef(Realtimedb, `posts`)
        await push(PostsRef, post)

        OnDialogClose()
    }

    function OnDialogClose() {
        setSelectedImage(null)
        setPreviewImage(null)
        setContent('')
        setSelectEscola('')
        setSelectCurso('todos')
        setFilterArray([])
        setOpen(false)
    }

    return (
        <>
            {arrayEscola.length > 0 || Adm ?
                <>
                    <Fab sx={{ position: "fixed", bottom: "40px", right: "40px" }}
                        size="large"
                        color="primary"
                        aria-label="add"
                        onClick={() => setOpen(true)}>
                        <AddIcon />
                    </Fab>
                    <Dialog open={open} onClose={OnDialogClose}>
                        <DialogTitle> post </DialogTitle>
                        <DialogContent>
                            <FormControl>
                                <Avatar src={ProfilePic} />
                                <TextField variant='standard' sx={{ width: { xs: "250px", sm: "400px" }, mb: 1 }} multiline maxRows={10} placeholder='escreva aqui' onChange={(e) => { setContent(e.target.value) }} />
                                {previewImage && (
                                    <Box>
                                        <IconButton sx={{ position: "absolute", left: "20px" }} onClick={OnImageClose}>
                                            <CloseIcon color="error" />
                                        </IconButton>
                                        <PostImage src={previewImage} alt="Imagem do Post" />
                                    </Box>
                                )}
                                <Box component="label">
                                    <IconButton>
                                        <label htmlFor="avisoFoto">
                                            <AddAPhotoIcon color="primary" />
                                        </label>
                                    </IconButton>
                                </Box>
                            </FormControl>
                            <Typography>Tags</Typography>
                            <Box sx={{ display: "flex", justifyContent: "space-around", flexDirection: { xs: "column", sm: "row" }, gap: 1 }}>
                                <FormControl sx={{ width: { xs: "100%", sm: "45%" } }} >
                                    <InputLabel>escolas</InputLabel>
                                    <Select value={selectEscola} onChange={OnSchoolChange} disabled={Disable}>
                                        {arrayEscola.map((escola) => (
                                            <MenuItem key={escola.idEscola} value={escola.idEscola}>{escola.nomeEscola}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                                <FormControl sx={{ width: { xs: "100%", sm: "45%" } }} >
                                    <InputLabel>cursos</InputLabel>
                                    <Select value={selectCurso} onChange={OnCourseChange}>
                                        <MenuItem value="todos">todos os cursos</MenuItem>
                                        {filterArray.map((curso) => (
                                            <MenuItem key={curso.cursoID} value={curso.cursoID}>{curso.name} - {curso.periodo}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Box>
                        </DialogContent>
                        <DialogActions>
                            <Button variant='outlined' color='info' onClick={OnPost}> postar </Button>
                            <Button color='error' onClick={OnDialogClose}> cancelar </Button>
                        </DialogActions>
                        <input type="file" accept="image/*" onChange={handleImageChange} id="avisoFoto" hidden />
                    </Dialog>
                </>
                : <p>Você não tem nenhum curso cadastrado ou aprovado</p>
            }
        </>
    )
}