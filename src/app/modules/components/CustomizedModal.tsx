import {  Dialog,  DialogContent } from "@mui/material";

type PropsTypes= {
    open:boolean;
    handleClose:()=>void;
    children:React.ReactNode;
    title?:string;
}

export const CustomisedModal = (props:PropsTypes)=>{
    const {open,handleClose,children,title}= props;
    return (
        <Dialog open={open} onClose={handleClose} aria-modal>
            <DialogContent>
              {children}
            </DialogContent>
        </Dialog>
    )
}