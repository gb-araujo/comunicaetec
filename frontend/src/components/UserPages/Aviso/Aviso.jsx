import { Box } from "@mui/material"
import AvisoAdm from "./adm/AvisoAdm"
import AvisoUser from "./user/AvisoUser"

export default function Aviso({ Adm, User }) {

    return (
        <>
            {Adm ? <Box sx={{display: "flex", flexDirection: "column"}}>
                <AvisoAdm Adm={Adm} />
            </Box>

                : <Box>
                    <AvisoUser User={User} />
                </Box>}
        </>
    )
}