import { Typography } from "@mui/material"
import { FC } from "react"
import { getStatusColor } from "../../../utils/common"

interface PropsTypes {
    status:number,
    label:string,
}

const style ={
    paddingInline:"6px",
    paddingBlock:"4px",
    borderRadius:"4px",
    textAlign:"center",
    display:"inline-block",
    fontSize:"14px"
}


export const StyleStatus:FC<PropsTypes> =({status,label})=>{
    const clName= getStatusColor(status);
    return (
        <Typography sx={style} className={clName} >
            {label}
        </Typography>
    )
}