import { useEffect, useState } from "react"
import { Paper, Dialog, DialogTitle, DialogContent, Divider, DialogActions, Avatar, Box, Typography, IconButton } from "@mui/material"
import { FormControl, InputLabel, Select, MenuItem, Fab, Button, TextField } from "@mui/material"
import { styled } from "@mui/material/styles"
import AddAPhotoIcon from '@mui/icons-material/AddAPhoto'
import CloseIcon from '@mui/icons-material/Close'
import VerifiedIcon from '@mui/icons-material/Verified'
import { storage, Realtimedb } from "../../Firebase"
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'
import { ref as dbRef, push, query, orderByChild, equalTo, onValue, remove } from 'firebase/database'

const PostImage = styled('img')({
    borderRadius: "5px"
})

export default function Respostas({ ReplyOpen, SetReplyOpen, PostInfo, User, Adm, ProfilePic }) {
    const [selectedImage, setSelectedImage] = useState(null)
    const [previewImage, setPreviewImage] = useState(null)
    const [content, setContent] = useState('')
    const [replyForm, setReplyForm] = useState(false)
    const [replys, setReplys] = useState([])
    const [imageOpen, setImageOpen] = useState(false)
    const [imageSRC, setImageSRC] = useState("")

    useEffect(() => {
        const replyRef = query(dbRef(Realtimedb, `posts`), orderByChild("replyFor"), equalTo(PostInfo))
        onValue(replyRef, (snapshot) => {
            if (snapshot.exists()) {
                const replyData = snapshot.val()
                const ArrayPosts = Object.keys(replyData).map((replyID) => {
                    const ReplyInfo = replyData[replyID]
                    const formatDate = new Date(ReplyInfo.createdAt).toLocaleDateString('pt-BR')
                    return { replyID, ...ReplyInfo, formatDate }
                })

                setReplys(ArrayPosts.reverse())
            } else {
                setReplys([])
            }
        })
    }, [PostInfo])

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

    async function OnConfirm() {
        if (!content && !selectedImage) { return }

        let downloadURL = null
        const dataAtual = Date.now()

        if (selectedImage) {
            const StorageRef = storageRef(storage, `avisos/image_${dataAtual}.jpg`)
            await uploadBytes(StorageRef, selectedImage)
            downloadURL = await getDownloadURL(StorageRef)
        }

        const databaseRef = dbRef(Realtimedb, `posts`)
        await push(databaseRef, {
            adm: Adm,
            content: content,
            imgURL: downloadURL,
            userID: User.uid,
            userName: User.displayName,
            userImage: ProfilePic,
            replyFor: PostInfo,
            createdAt: dataAtual
        })

        OnReplyFormClose()
    }

    function OnImageClick(e) {
        setImageSRC(e.target.src)
        setImageOpen(true)
    }
    function OnImageClose() {
        setImageSRC("")
        setImageOpen(false)
    }

    function OnReplyClose() {
        setSelectedImage(null)
        setPreviewImage(null)
        setContent('')
        SetReplyOpen(false)
    }
    function OnReplyFormClose() {
        setSelectedImage(null)
        setPreviewImage(null)
        setContent('')
        setReplyForm(false)
    }

    function removePost(postID) {
        const postRef = dbRef(Realtimedb, `posts/${postID}`)
        remove(postRef)
    }

    return (
        <>
            <Dialog open={ReplyOpen} onClose={OnReplyClose} >
                <DialogTitle sx={{ width: { xs: "250px", sm: "400px" }, display: "flex", justifyContent: "space-between" }}>
                    respostas
                    <Button onClick={() => setReplyForm(true)}> responder </Button>
                </DialogTitle>
                <DialogContent sx={{ display: "flex", flexDirection: "column" }}>
                    {replys.length > 0 ? replys.map((post) => (
                        <Box key={post.replyID}>
                            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                                <Box sx={{ display: "flex", gap: 1 }}>
                                    <Avatar src={post.userImage} />
                                    <Typography sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                        {post.userName}
                                        {post.adm && <VerifiedIcon color='primary' fontSize='small' />}
                                    </Typography>
                                </Box>
                                {(post.userID === User.uid || Adm) &&
                                    <IconButton onClick={() => removePost(post.replyID)}>
                                        <CloseIcon />
                                    </IconButton>}
                            </Box>
                            <Box sx={{ mb: 1 }}>
                                <Typography>{post.content}</Typography>
                            </Box>
                            <Box sx={{ display: "flex", justifyContent: "center", mb: 1 }}>
                                <PostImage sx={{ width: "250px" }} src={post.imgURL} onClick={OnImageClick} />
                            </Box>
                            <Box sx={{ display: "flex", justifyContent: "flex-end", alignItems: "end", mb: 1 }}>
                                <Typography sx={{ mt: 1 }}> {post.formatDate} </Typography>
                            </Box>
                            <Divider />
                        </Box>
                    ))
                        : <Typography>nenhuma resposta para esse post</Typography>}
                </DialogContent>
            </Dialog>

            <Dialog open={replyForm} onClose={OnReplyFormClose} >
                <DialogTitle> Poste uma Resposta </DialogTitle>
                <DialogContent sx={{ display: "flex", flexDirection: "column" }}>
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
                    <Button variant='outlined' color='info' onClick={OnConfirm}> postar </Button>
                    <Button color='error' onClick={OnReplyFormClose}> cancelar </Button>
                </DialogActions>
                <input type="file" accept="image/*" onChange={handleImageChange} id="avisoFoto" hidden />
            </Dialog>

            <Dialog open={imageOpen} onClose={OnImageClose}>
                <PostImage src={imageSRC} sx={{ width: { xs: "300px", sm: "400px" } }} />
            </Dialog>
        </>
    )
}