import { useState, useEffect } from "react"
import { Realtimedb } from "../../Firebase"
import { ref as dbRef, update as dbUpdate, onValue, get, child, equalTo, query, orderByChild } from "firebase/database"
import { List, ListItem, ListItemText, Paper, Divider, Button, Avatar } from "@mui/material"
import TabsComponenet from "./Tabs"

export default function Solicitacoes({ Adm, User }) {
    const [solicitacoes, setSolicitacoes] = useState([])
    const [value, setValue] = useState(0)

    const content = [
        "pendente",
        "aprovado",
        "recusado"
    ]

    useEffect(() => {
        const ref = query(dbRef(Realtimedb, `solicitacoes/`), orderByChild("schoolID"), equalTo(Adm))
        onValue(ref, async (snapshot1) => {
            if (snapshot1.exists()) {
                const Solicitacoes = snapshot1.val()
                const arraySols = Object.keys(Solicitacoes).map((solID) => {
                    const infoSol = Solicitacoes[solID]
                    return { solID, ...infoSol }
                })
                setSolicitacoes(arraySols)
            } else {
                setSolicitacoes([])
            }
        })
    }, [])

    async function OnAccept(solicitacao) {
        let Exists = true
        await get(child(dbRef(Realtimedb), `users/${solicitacao.userID}/curso/${solicitacao.courseID}`))
            .then((snapshot) => {
                if (snapshot.exists()) {
                } else {
                    Exists = false
                }
            }).catch((error) => { console.error(error) })
        if (!Exists) { return }

        await dbUpdate(dbRef(Realtimedb, `users/${solicitacao.userID}/curso/${solicitacao.courseID}`), {
            status: "aprovado"
        }).then(async () => {
            await dbUpdate(dbRef(Realtimedb, `solicitacoes/${solicitacao.userID}-${solicitacao.courseID}`), {
                status: "aprovado"
            })
        })
    }

    async function OnReject(solicitacao) {
        let Exists = true
        await get(child(dbRef(Realtimedb), `users/${solicitacao.userID}/curso/${solicitacao.courseID}`))
            .then((snapshot) => {
                if (snapshot.exists()) {
                } else {
                    Exists = false
                }
            }).catch((error) => { console.error(error) })
        if (!Exists) { return }

        await dbUpdate(dbRef(Realtimedb, `users/${solicitacao.userID}/curso/${solicitacao.courseID}`), {
            status: "recusado"
        }).then(async () => {
            await dbUpdate(dbRef(Realtimedb, `solicitacoes/${solicitacao.userID}-${solicitacao.courseID}`), {
                status: "recusado"
            })
        })
    }

    return (
        <>
            <TabsComponenet Value={value} SetValue={setValue} />
            {solicitacoes.length > 0 &&
                solicitacoes.map((sol) => (sol.status === content[value] &&
                    <Paper key={sol.solID} elevation={5} sx={{ m: 2, width: 330 }}>
                        <List sx={{ pb: 0 }}>
                            <ListItem>
                                <Avatar sx={{ mr: 1 }} src={sol.userPhotoURL} ></Avatar>
                                <ListItemText primary={sol.userName} />
                            </ListItem>
                            <ListItem>
                                <ListItemText primary={sol.courseName + " - " + sol.periodo} />
                            </ListItem>
                            <ListItem>
                                <ListItemText primary={"status: " + sol.status} />
                            </ListItem>
                            {sol.status == "pendente" &&
                                <>
                                    <Divider />
                                    <ListItem sx={{ display: "flex", justifyContent: "space-around", p: 0 }}>
                                        <Button size="medium" color="info" onClick={() => { OnAccept(sol) }}>aprovar</Button>
                                        <Button size="medium" color="error" onClick={() => { OnReject(sol) }}>recusar</Button>
                                    </ListItem>
                                </>
                            }
                        </List>
                    </Paper>))
            }
        </>
    )
}