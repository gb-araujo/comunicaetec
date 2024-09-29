import { useState } from 'react'
import { Button, Box } from "@mui/material"
import { DialogContent, Dialog, DialogTitle, DialogContentText, DialogActions } from "@mui/material"
import { FormControl, InputLabel, Select, MenuItem } from "@mui/material"
import { Realtimedb, Firestoredb } from '../../Firebase'
import { collection, query, getDocs, where } from "firebase/firestore"
import { ref as dbRef, set, get, child } from 'firebase/database'


export default function CursoForm({ User, ProfilePic }) {
    const [dialogOpen, setDialogOpen] = useState(false)
    const [schoolsArray, setSchoolsArray] = useState([])
    const [schoolInput, setSchoolInput] = useState('')
    const [courses, setCourses] = useState([])
    const [courseInput, setCourseInput] = useState('')
    const [erro, setErro] = useState('')

    function OnSchoolChange(event) {
        setSchoolInput(event.target.value)
    }
    async function fetchSchools() {
        const schoolsQuery = query(collection(Firestoredb, "escolas"))
        const schools = await getDocs(schoolsQuery)
        const schoolsArray = []
        schools.forEach((doc) => {
            const objSchool = {
                id: doc.id,
                name: doc.data().nome
            }
            schoolsArray.push(objSchool)
        })
        setSchoolsArray(schoolsArray)
    }

    function OnCourseChange(event) {
        setCourseInput(event.target.value)
    }
    async function OnSchoolBlur() {
        const courseQuery = query(collection(Firestoredb, "cursos"), where("escolaID", "==", schoolInput))
        const Courses = await getDocs(courseQuery)
        const coursesArray = []
        Courses.forEach((doc) => {
            const objCourse = {
                id: doc.id,
                name: doc.data().nome,
                periodo: doc.data().periodo
            }
            coursesArray.push(objCourse)
        })
        setCourses(coursesArray)
    }

    async function CadCourses() {
        if (!ProfilePic) { return setErro("coloque uma foto de perfil para se cadastrar") }
        if (!schoolInput) { return setErro("selecione uma escola") }
        if (!courseInput) { return setErro("selecione um curso") }

        let Exists = false
        await get(child(dbRef(Realtimedb), `users/${User.uid}/curso/${courseInput}`))
            .then((snapshot) => {
                const curso = snapshot.val()
                if (curso.status == "pendente" || curso.status == "aprovado") {
                    Exists = true
                }
            })
            .catch((error) => { console.log(error) })

        if (Exists) { return setErro("ja xiste essa solicitação no seu perfil") }

        const Curso = courses.find((curso) => { return curso.id == courseInput })
        const Escola = schoolsArray.find((escola) => { return escola.id == schoolInput })

        await set(dbRef(Realtimedb, `users/${User.uid}/curso/${courseInput}`), {
            idEscola: Escola.id,
            schoolName: Escola.name,
            name: Curso.name,
            periodo: Curso.periodo,
            status: "pendente"
        })

        await set(dbRef(Realtimedb, `solicitacoes/${User.uid + "-" + courseInput}`), {
            userID: User.uid,
            userPhotoURL: User.photoURL,
            userName: User.displayName,
            userEmail: User.email,
            schoolID: Escola.id,
            schoolName: Escola.name,
            courseID: courseInput,
            courseName: Curso.name,
            periodo: Curso.periodo,
            status: "pendente"
        })

        setSchoolInput('')
        setCourseInput('')
        setDialogOpen(false)
    }

    function OnDialogOpen() {
        fetchSchools()
        setDialogOpen(true)
    }
    function OnDialogClose() {
        setSchoolInput('')
        setCourseInput('')
        setDialogOpen(false)
    }

    return (
        <>
            <Button onClick={OnDialogOpen} variant='text' color='info' sx={{ margin: 3 }}>se cadastre em algum curso</Button>

            <Dialog
                open={dialogOpen}
                fullWidth={true}
            >
                <DialogTitle>Escolas e Cursos</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Se cadastre em algum dos cursos disponiveis
                    </DialogContentText>
                    <Box sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        m: 'auto',
                    }}>
                        <FormControl sx={{ mt: 2, minWidth: 250 }}>
                            <InputLabel> escola </InputLabel>
                            <Select value={schoolInput} onChange={OnSchoolChange} onBlur={OnSchoolBlur}>
                                {schoolsArray.length > 0 &&
                                    schoolsArray.map((escola) => (
                                        <MenuItem key={escola.id} value={escola.id}>{escola.name}</MenuItem>
                                    ))}
                            </Select>
                        </FormControl>
                        <FormControl sx={{ mt: 2, minWidth: 250 }}>
                            <InputLabel> cursos </InputLabel>
                            <Select value={courseInput} onChange={OnCourseChange}>
                                {courses.length > 0 &&
                                    courses.map((curso) => (
                                        <MenuItem key={curso.id} value={curso.id}>{curso.name + " - " + curso.periodo}</MenuItem>
                                    ))}
                            </Select>
                        </FormControl>
                    </Box>
                    {erro && (<DialogContentText color="error" sx={{ margin: 1 }}>{erro}</DialogContentText>)}
                </DialogContent>
                <DialogActions>
                    <Button variant='outlined' color='info' onClick={CadCourses}> cadastrar </Button>
                    <Button color='error' onClick={OnDialogClose}> cancelar </Button>
                </DialogActions>
            </Dialog>
        </>
    )
}