import { useState } from 'react'
import { Button } from "@mui/material"
import { DialogContent, Dialog, DialogTitle, DialogContentText, DialogActions } from "@mui/material"
import { FormControl, TextField } from "@mui/material"
import { Realtimedb } from '../../Firebase'
import { updateProfile } from "firebase/auth"
import { ref as dbRef, update, equalTo, query, orderByChild, onValue } from 'firebase/database'

export default function EditName({ Open, SetOpen, User }) {
    const [newName, setNewName] = useState('')
    const [erro, setErro] = useState('')

    async function ChangeName() {

        if (!newName) { return setErro('O campo está vazio') }

        const solQueryName = query(dbRef(Realtimedb, `solicitacoes/`), orderByChild("userID"), equalTo(User.uid))
        onValue(solQueryName, async (snapshot) => {
            if (snapshot.exists()) {
                const solicitacoes = snapshot.val()

                const arraySols = Object.keys(solicitacoes).map((solID) => {
                    if (solicitacoes[solID].userName !== newName) {
                        return update(dbRef(Realtimedb, `solicitacoes/${solID}`), { userName: newName })
                    }
                })
                await Promise.all(arraySols)
            }
        }, { onlyOnce: true })

        const postQueryName = query(dbRef(Realtimedb, `posts/`), orderByChild("userID"), equalTo(User.uid))
        onValue(postQueryName, async (snapshot) => {
            if (snapshot.exists()) {
                const posts = snapshot.val()

                const arraySols = Object.keys(posts).map((postID) => {
                    if (posts[postID].userName !== newName) {
                        return update(dbRef(Realtimedb, `posts/${postID}`), { userName: newName })
                    }
                })
                await Promise.all(arraySols)
            }
        }, { onlyOnce: true })


        Promise.all([
            updateProfile(User, {
                displayName: newName
            }),
            update(dbRef(Realtimedb, `users/${User.uid}`), {
                displayName: newName,
            })
        ])

        SetOpen(false)
    }

    function OnClose() {
        setNewName('')
        SetOpen(false)
    }

    return (
        <>
            <Dialog open={Open} onClose={OnClose} >
                <DialogTitle> Edição </DialogTitle>
                <DialogContent>
                    <DialogContentText>Mude seu nome aqui</DialogContentText>
                    <FormControl>
                        <TextField variant='outlined'
                            error={erro ? true : false}
                            sx={{ width: "400px", marginY: 1 }}
                            label="Nome"
                            value={newName}
                            helperText={erro}
                            onChange={(event) => {
                                setErro('')
                                setNewName(event.target.value)
                            }} />
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button variant='outlined' color='info' onClick={ChangeName}> confirmar </Button>
                    <Button color='error' onClick={OnClose}> cancelar </Button>
                </DialogActions>
            </Dialog>
        </>
    )
}