import { Typography } from "@mui/material"
import { FC } from "react"

interface PropsTypes {
    className:string,
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

export const StyleStatus:FC<PropsTypes> =({className,label})=>{
    return (
        <Typography sx={style} className={className} >
            {label}
        </Typography>
    )
}