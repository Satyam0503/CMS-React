import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material"
import { useIntl } from "react-intl";

interface PropsTypes {
    open:boolean;
    title:string;
    content:string;
    handleClose: ()=>void;
    handleConfirmation:(res:string)=>void;
}
export const ConfirmationModal= (props:PropsTypes)=>{
    const intl= useIntl();
    const { open,handleClose,handleConfirmation ,title,content}=props;
    return (
        <Dialog open={open} onClose={handleClose} maxWidth={"sm"} aria-modal sx={{ "& .MuiDialog-paper": { minWidth: 300 } }}>
            <DialogTitle>{title}</DialogTitle>
            <DialogContent>{content}</DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>{intl.formatMessage({ id: "BUTTON.CLOSE" })}</Button>
                <Button onClick={()=>handleConfirmation("ok")}>Delete</Button>
            </DialogActions>
        </Dialog>
    )
}