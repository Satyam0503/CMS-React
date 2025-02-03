import { Grid } from "@mui/material";
import { FC } from "react";

interface Props {
    pdfUrl:string;
}

export const PdfPreview:FC<Props> =({pdfUrl})=>{
    console.log(pdfUrl);
    return (
        <Grid container>

        </Grid>
    )
}