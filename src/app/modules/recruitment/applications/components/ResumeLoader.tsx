import { Box, CircularProgress } from "@mui/material"

export const ResumeLoader =()=>{
    return (
      <Box sx={{height:"300px", display:"flex",justifyContent:"center",alignItems:"center"}}>
        <CircularProgress />
      </Box>
    )
}