import { EditDocument, PersonAdd } from "@mui/icons-material";
import { Box, Button, Dialog, DialogContent, DialogTitle, Slide, Stack, Step, StepLabel, Stepper } from "@mui/material"
import React, { useState } from "react";
import { useIntl } from "react-intl";
import { InviteNewEmployee } from "./InviteNewEmployee";
import { UpdateEmployeeData } from "./UpdateEmployeeData";
import { InviteEmployeeResponse } from "../models";




export const AddEmployeeStepper = () => {
    const { formatMessage: i } = useIntl();
    const [open, setOpen] = useState(false);
    const [activeStep, setActiveSteps] = useState(0);
    const [newEmployeeData, setNewEmployeeData] = useState<InviteEmployeeResponse>()

    const handleDialogClose = () => {
        setOpen(false);
    }

    const handleInviteUser = (isInvited: boolean, employeeData: InviteEmployeeResponse) => {
        if (isInvited) {
            setActiveSteps((step) => step + 1);
            setNewEmployeeData(employeeData);
        }
    }
    const handleUserUpdate = (success: boolean) => {
        if (success) {
            setActiveSteps((step) => step + 1);
        }
    }

    console.log(activeStep);


    const steps = [{ label: "EMPLOYEE.STEPPER.CREATE_ACCOUNT", optional: false, icon: <PersonAdd /> }, { label: "EMPLOYEE.STEPPER.EDIT_DATA", optional: false, icon: <EditDocument /> }]
    return (
        <React.Fragment>
            <Button variant="contained" onClick={() => setOpen(true)}>{i({ id: "EMPLOYEE.ADD_NEW_EMP" })}</Button>
            <Dialog
                fullWidth={true}
                maxWidth="xl"
                open={open}
                onClose={handleDialogClose}
            >
                <DialogTitle className="fs-20">{i({ id: "EMPLOYEE.ADD_NEW_EMP" })}</DialogTitle>
                <DialogContent>
                    <Box component="div" className="mb-2">
                        <Stepper activeStep={activeStep}  >
                            {
                                steps.map((step) => {
                                    return (
                                        <Step key={step.label} >
                                            <StepLabel slotProps={{
                                                stepIcon: {
                                                    fontSize: "large",
                                                }
                                            }} > {i({ id: step.label })} </StepLabel>
                                        </Step>
                                    );
                                })
                            }
                        </Stepper>
                    </Box>
                    {
                        activeStep === 0 &&
                        <Slide direction="left" in={open && activeStep === 0} mountOnEnter unmountOnExit>
                            <div>
                                <InviteNewEmployee handleInviteUser={handleInviteUser} />
                            </div>
                        </Slide>
                    }
                    {
                        (activeStep === 1 && newEmployeeData) &&
                        <Slide direction="left" in={open && activeStep === 1} mountOnEnter unmountOnExit>
                            <div>
                                <UpdateEmployeeData employeeData={newEmployeeData} onUserUpdate={handleUserUpdate} />
                            </div>
                        </Slide>
                    }
                    <Stack direction="row">
                    </Stack>
                </DialogContent>

                {/* <DialogActions sx={{ px: 4, py: 3, justifyContent: "space-between" }}>
                    
                    <Button onClick={handleDialogClose}>{i({ id: "BUTTON.CLOSE" })}</Button>
                    <Button>{i({ id: "BUTTON.NEXT" })}</Button>
                </DialogActions> */}
            </Dialog>
        </React.Fragment >
    )
}




// const EditEmployeeData = () => {
//     return (
//         <Box>
//             Hello
//         </Box>
//     )
// }