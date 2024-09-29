import { Box } from "@mui/material"
import { Tabs, Tab } from "@mui/material"

export default function TabsComponenet({Value, SetValue}){

    return (
        <Box sx={{width: {md: "100%"}}}>
            <Tabs sx={{["& .MuiTabs-flexContainer"]: {justifyContent: "space-around"}}} value={Value} onChange={(event, newValue)=> { SetValue(newValue) }}>
                <Tab label="pendente" value={0} />
                <Tab label="aprovado" value={1} />
                <Tab label="recusado" value={2} />
            </Tabs>
        </Box>
    )
}