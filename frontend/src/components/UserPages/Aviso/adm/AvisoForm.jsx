import { useState } from "react"
import { DialogContent, Dialog, DialogTitle, DialogContentText, DialogActions } from "@mui/material"
import { TextField, Button, IconButton, Box } from "@mui/material"
import AddAPhotoIcon from '@mui/icons-material/AddAPhoto'
import CloseIcon from '@mui/icons-material/Close'
import { styled } from "@mui/material/styles"
import { storage, Realtimedb } from "../../../Firebase"
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'
import { ref as dbRef, push } from 'firebase/database'

const PostImage = styled('img')({
    maxWidth: "250px",
    maxHeight: "250px",
    borderRadius: "10px"
})

export default function AvisoForm({ Open, SetOpen, Adm }) {
    const [selectedImage, setSelectedImage] = useState(null)
    const [previewImage, setPreviewImage] = useState(null)
    const [content, setContent] = useState('')

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

    async function OnConfirm() {
        if (!content && !selectedImage) { return }

        let downloadURL = null
        const dataAtual = Date.now()
        
        if (selectedImage) {
            const StorageRef = storageRef(storage, `avisos/image_${dataAtual}.jpg`)

            await uploadBytes(StorageRef, selectedImage)
            downloadURL = await getDownloadURL(StorageRef)
        }

        const databaseRef = dbRef(Realtimedb, `avisos/${Adm}`)
        await push(databaseRef, {
            content: content,
            imgURL: downloadURL,
            createdAt: dataAtual
        })

        OnClose()
    }

    function OnImageClose() {
        setSelectedImage(null)
        setPreviewImage(null)
    }

    function OnClose() {
        setSelectedImage(null)
        setPreviewImage(null)
        setContent('')
        SetOpen(false)
    }

    return (
        <>
            <Dialog open={Open} onClose={OnClose} >
                <DialogTitle> Avisos </DialogTitle>
                <DialogContent sx={{ display: "flex", flexDirection: "column" }}>
                    <DialogContentText>Poste um Aviso</DialogContentText>
                    <TextField variant='standard' sx={{ width: { sm: "400px" }, mb: 1 }} onChange={(e) => { setContent(e.target.value) }}
                        multiline maxRows={10} placeholder='escreva aqui' />
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
                </DialogContent>
                <DialogActions>
                    <Button variant='outlined' color='info' onClick={OnConfirm}> confirmar </Button>
                    <Button color='error' onClick={OnClose}> cancelar </Button>
                </DialogActions>
                <input type="file" accept="image/*" onChange={handleImageChange} id="avisoFoto" hidden />
            </Dialog>
        </>
    )
}