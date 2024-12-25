import { Edit } from "@mui/icons-material";
import { Box, Button, Grid, Stack, TextField, Typography } from "@mui/material"
import { useState } from "react";
import { CustomisedModal } from "../components/CustomizedModal";
import { addUpdateUserSummary } from "./userservices";
import { toast } from "react-toastify";
import { useUserDetails } from "./UserDataProvider";
const style = {
    width: 800,
    boxShadow: 24,
    borderRadius: 2,
};

const userId="66c5ea2f-6cfd-445d-b215-09dd3667c8c5";
const token= JSON.parse(localStorage.getItem("kt-auth-react-v") || "{}");

export const AddUpdateUserSummary = () => {
    const userData= useUserDetails();
    const [open, setOpen] = useState(false);
    const [summary,setSummary]= useState("");

    function handleClose() {
        setOpen(false);
        setSummary("");
    }
    function handleSummaryUpdate(){
        addUpdateUserSummary(userId,{summary},token)
        .then(res=>{
            const {success,message,methodResult}= res.data;
            if(success){
                toast.success("Summary Updated");
                handleClose();
                userData?.setRefresh(!userData.isRefresh);
                // userData?.setUserDetails(methodResult)
            }
        })
        .catch(error=>{
            toast.error("Failed To Update Summary");
        })
        .finally(()=>{
            handleClose();
        })
    }
    function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> ){
        setSummary(e.target.value);
    }
    return (
        <>
            <Stack
                onClick={() => setOpen(true)}
                className="btn btn-sm bg-white border btn-active-light-primary p-1"
            >
                <Edit />
            </Stack>
            <CustomisedModal open={open} handleClose={handleClose}>
                <Box sx={style}>
                    <Stack>
                        <Typography variant="h6">Summary</Typography>
                        <TextField
                            id="outlined-basic"
                            placeholder="Type.."
                            variant="outlined"
                            value={summary}
                            onChange={handleChange}
                            fullWidth
                            sx={{ marginBlock: "10px" }}
                        />
                    </Stack>
                    <Grid container className="d-flex justify-content-end gap-2">
                        <Button variant="contained" onClick={handleClose}>Cancel</Button>
                        <Button variant="contained" onClick={handleSummaryUpdate} disabled={summary.length===0}>Save</Button>
                    </Grid>
                </Box>
            </CustomisedModal>
        </>
    )
}