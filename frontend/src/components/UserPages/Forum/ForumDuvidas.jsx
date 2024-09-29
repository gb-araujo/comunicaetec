import { useState, useEffect } from 'react'
import { Paper, Dialog, DialogTitle, DialogContentText, DialogActions, Avatar, Box, Typography, IconButton } from "@mui/material"
import { FormControl, InputLabel, Select, MenuItem, Fab, Button, TextField } from "@mui/material"
import { styled } from "@mui/material/styles"
import CloseIcon from '@mui/icons-material/Close'
import ModeCommentOutlinedIcon from '@mui/icons-material/ModeCommentOutlined'
import VerifiedIcon from '@mui/icons-material/Verified'
import { Realtimedb, Firestoredb } from "../../Firebase"
import { ref as dbRef, onValue, query as queryRdb, orderByChild, equalTo, remove } from 'firebase/database'
import { collection, query, getDocs, where, doc, getDoc } from "firebase/firestore"
import ForumForm from './ForumForm'
import Respostas from './Respostas'

const PostImage = styled('img')({
    borderRadius: "5px"
})

export default function ForumDuvidas({ ProfilePic, User, Adm }) {
    const [disable, setDisable] = useState(false)
    const [arrayCursos, setArrayCursos] = useState([])
    const [arrayEscola, setArrayEscola] = useState([])
    const [admCourse, setAdmCourse] = useState([])
    const [arrayCursoFilter, setArrayCursoFilter] = useState([])
    const [filterSchool, setFilterSchool] = useState('')
    const [filterTags, setFilterTags] = useState('todos')
    const [posts, setPosts] = useState([])
    const [imageOpen, setImageOpen] = useState(false)
    const [imageSRC, setImageSRC] = useState("")
    const [replyOpen, setReplyOpen] = useState(false)
    const [postInfo, setPostInfo] = useState("")

    useEffect(() => {
        OnSearch()
        if (Adm) {
            setDisable(true)
            GetAdm()
            setFilterSchool(Adm)
        } else {
            GetUser()
        }
    }, [filterSchool, filterTags])

    function GetUser() {
        const userRef = dbRef(Realtimedb, `users/${User.uid}/curso`)
        onValue(userRef, (snapshot) => {
            if (snapshot.exists()) {
                const cursosData = snapshot.val()
                const ArrayCursos = Object.keys(cursosData).map((cursoID) => {
                    const infoCurso = cursosData[cursoID]
                    return { cursoID, ...infoCurso }
                })
                const filterArray = ArrayCursos.filter((curso) => curso.status === "aprovado")
                const reduceArray = filterArray.reduce((acc, curso) => {
                    if (!acc[curso.idEscola]) {
                        acc[curso.idEscola] = { idEscola: curso.idEscola, nomeEscola: curso.schoolName }
                    }
                    return acc
                }, {})
                setArrayCursos(filterArray)
                setArrayEscola(Object.values(reduceArray))
            } else {
                setArrayEscola([])
                setArrayCursos([])
            }
        }, { onlyOnce: true })
    }
    async function GetAdm() {
        const admSchoolRef = doc(Firestoredb, `escolas`, Adm)
        const docSnap = await getDoc(admSchoolRef)
        if (docSnap.exists()) {
            setArrayEscola([{ idEscola: Adm, nomeEscola: docSnap.data().nome }])
        }

        const admRef = query(collection(Firestoredb, `cursos`), where("escolaID", "==", Adm))
        const courses = await getDocs(admRef)
        const coursesArray = []
        courses.forEach((doc) => {
            const objCourse = {
                cursoID: doc.id,
                name: doc.data().nome,
                periodo: doc.data().periodo,
                tag: `${doc.data().nome}-${doc.data().periodo}`
            }
            coursesArray.push(objCourse)
        })

        setAdmCourse(coursesArray)
        setArrayCursoFilter(coursesArray)
    }

    async function OnSchoolChange(e) {
        setFilterSchool(e.target.value)

        const allCoursesRef = query(collection(Firestoredb, `cursos`), where("escolaID", "==", e.target.value))
        const courses = await getDocs(allCoursesRef)

        const coursesArray = []
        courses.forEach((doc) => {
            const objCourse = {
                cursoID: doc.id,
                name: doc.data().nome,
                periodo: doc.data().periodo,
                tag: `${doc.data().nome}-${doc.data().periodo}`
            }
            coursesArray.push(objCourse)
        })

        setArrayCursoFilter(coursesArray)
    }

    function OnTagsChange(e) {
        setFilterTags(e.target.value)
    }

    function OnSearch() {
        if (!filterSchool || !filterTags) { return }

        const postsRef = queryRdb(dbRef(Realtimedb, `posts`), orderByChild("schoolID"), equalTo(filterSchool))
        onValue(postsRef, (snapshot) => {
            if (snapshot.exists()) {
                const postData = snapshot.val()
                const ArrayPosts = Object.keys(postData).map((postID) => {
                    const infoPost = postData[postID]
                    const formatDate = new Date(infoPost.createdAt).toLocaleDateString('pt-BR')
                    if (infoPost.replyFor) { return }
                    return { postID, ...infoPost, formatDate }
                })

                const filtredArrayPosts = ArrayPosts.filter((post) => {
                    if (filterTags === "todos") { return post }
                    if (filterTags === "meu") { return post.userID == User.uid }
                    if (filterTags === post.tag) { return post }
                })

                setPosts(filtredArrayPosts.reverse())
            } else {
                setPosts([])
            }
        })
    }

    function OnImageClick(e) {
        setImageSRC(e.target.src)
        setImageOpen(true)
    }
    function OnImageClose() {
        setImageSRC("")
        setImageOpen(false)
    }

    function removePost(postID) {
        const postRef = dbRef(Realtimedb, `posts/${postID}`)
        remove(postRef)
    }

    function openReply(postID) {
        setPostInfo(postID)
        setReplyOpen(true)
    }

    return (
        <>  
            {!ProfilePic && <Typography>coloque uma foto de perfil para postar</Typography>}
            <Box sx={{ width: "100%", borderBottom: "1px solid", padding: 1, mb: 2 }}>
                <Box sx={{ pl: 1 }}>
                    <Typography sx={{ display: "flex", justifyContent: "space-between" }}>
                        filtros
                    </Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-around", flexDirection: { xs: "column", sm: "row" }, gap: 1 }}>
                    <FormControl sx={{ width: { xs: "100%", sm: "45%" } }}>
                        <InputLabel>escola</InputLabel>
                        <Select onChange={OnSchoolChange} value={filterSchool} disabled={disable}>
                            {arrayEscola.map((escola) => (
                                <MenuItem key={escola.idEscola} value={escola.idEscola}>{escola.nomeEscola}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <FormControl sx={{ width: { xs: "100%", sm: "45%" } }}>
                        <InputLabel>tags</InputLabel>
                        <Select onChange={OnTagsChange} value={filterTags} >
                            <MenuItem value="todos">todos os cursos</MenuItem>
                            <MenuItem value="meu">meus posts</MenuItem>
                            {arrayCursoFilter.map((curso) => (
                                <MenuItem key={curso.cursoID} value={curso.tag}>{curso.name}-{curso.periodo}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Box>
            </Box>

            {posts.length > 0 ? posts.map((post) => (
                <Paper key={post.postID} sx={{ margin: 1, padding: 2, width: { xs: "250px", sm: "400px" } }} elevation={5}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                        <Box sx={{ display: "flex", gap: 1 }}>
                            <Avatar src={post.userImage} />
                            <Typography sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                {post.userName}
                                {post.adm && <VerifiedIcon color='primary' fontSize='small' />}
                            </Typography>
                        </Box>
                        {(post.userID === User.uid || Adm) &&
                            <IconButton onClick={() => removePost(post.postID)}>
                                <CloseIcon />
                            </IconButton>}
                    </Box>
                    <Box sx={{ mb: 1 }}>
                        <Typography>{post.content}</Typography>
                    </Box>
                    <Box sx={{ display: "flex", justifyContent: "center", mb: 1 }}>
                        <PostImage sx={{ width: "250px" }} src={post.imgURL} onClick={OnImageClick} />
                    </Box>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "end" }}>
                        <IconButton onClick={() => openReply(post.postID)}>
                            <ModeCommentOutlinedIcon color='primary' fontSize='small' />
                        </IconButton>
                        <Typography>{post.tag}</Typography>
                        <Typography sx={{ mt: 1 }}> {post.formatDate} </Typography>
                    </Box>
                </Paper>
            ))
                : <p>não encontramos posts</p>
            }
            {postInfo && <Respostas ReplyOpen={replyOpen} SetReplyOpen={setReplyOpen} PostInfo={postInfo} User={User} Adm={Adm} ProfilePic={ProfilePic} />}

            {
                (admCourse.length > 0 || !Adm) && <ForumForm ProfilePic={ProfilePic}
                    User={User}
                    Adm={Adm}
                    arrayCursos={arrayCursos}
                    arrayEscola={arrayEscola}
                    admCourse={admCourse}
                    Disable={disable} />
            }
            <Dialog open={imageOpen} onClose={OnImageClose}>
                <PostImage src={imageSRC} sx={{ width: { xs: "300px", sm: "400px" } }} />
            </Dialog>
        </>
    )
}