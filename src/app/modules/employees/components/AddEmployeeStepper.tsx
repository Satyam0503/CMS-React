import { Box, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Step, StepLabel, Stepper } from "@mui/material"
import React, { useState } from "react";
import { useIntl } from "react-intl";

// interface AddEmployeeStepperProps {
//     open: boolean,
//     handleClose: () => void;
// }

export const AddEmployeeStepper = () => {
    const { formatMessage: i } = useIntl();
    const [open, setOpen] = useState(false);
    const [activeStep, setActiveSteps] = useState(0);

    const handleDialogClose = () => {
        setOpen(false);
    }

    const steps = [{ label: "EMPLOYEE.STEPPER.CREATE_ACCOUNT", optional: false, }, { label: "EMPLOYEE.STEPPER.EDIT_DATA", optional: false }]
    return (
        <React.Fragment>
            <Button variant="contained" onClick={() => setOpen(true)}>{i({ id: "EMPLOYEE.ADD_NEW_EMP" })}</Button>
            <Dialog
                fullWidth={true}
                maxWidth="lg"
                open={open}
                onClose={handleDialogClose}
            >
                <DialogTitle className="fs-20">{i({ id: "EMPLOYEE.ADD_NEW_EMP" })}</DialogTitle>
                <DialogContent>
                    <Box component="div">
                        <Stepper activeStep={activeStep}>
                            {
                                steps.map((step, index) => {
                                    return (
                                        <Step>
                                            <StepLabel> {i({ id: step.label })} </StepLabel>
                                        </Step>
                                    );
                                })
                            }
                        </Stepper>
                    </Box>
                </DialogContent>
                {/* <DialogActions>
                    <Button onClick={handleDialogClose}>{i({ id: "BUTTON.CLOSE" })}</Button>
                </DialogActions> */}
            </Dialog>
        </React.Fragment >
    )
}