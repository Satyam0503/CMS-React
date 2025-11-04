import { EditDocument, PersonAdd } from "@mui/icons-material";
import { Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid, InputLabel, Slide, Stack, Step, StepLabel, Stepper } from "@mui/material"
import React, { useState } from "react";
import { useIntl } from "react-intl";
import { TextInput } from "../../../shared/components/form-component/TextInput";
import { Formik } from "formik";
import { employeeSchema } from "../../../../utils/Schema/employeeSchema";
import { InviteNewEmployeeModel } from "../models";

export const AddEmployeeStepper = () => {
    const { formatMessage: i } = useIntl();
    const [open, setOpen] = useState(false);
    const [activeStep, setActiveSteps] = useState(0);

    const handleDialogClose = () => {
        setOpen(false);
    }

    const steps = [{ label: "EMPLOYEE.STEPPER.CREATE_ACCOUNT", optional: false, icon: <PersonAdd /> }, { label: "EMPLOYEE.STEPPER.EDIT_DATA", optional: false, icon: <EditDocument /> }]
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
                    <Box component="div" className="mb-2">
                        <Stepper activeStep={activeStep}  >
                            {
                                steps.map((step, index) => {
                                    return (
                                        <Step key={step.label} disabled >
                                            <StepLabel> {i({ id: step.label })} </StepLabel>
                                        </Step>
                                    );
                                })
                            }
                        </Stepper>
                    </Box>
                    {/* <Slide direction="right" in mountOnEnter unmountOnExit> */}
                    <InviteNewEmployee />
                    {/* </Slide> */}
                    <Stack direction="row">
                        <Button>

                        </Button>
                    </Stack>
                </DialogContent>

                <DialogActions>
                    <Button onClick={handleDialogClose}>{i({ id: "BUTTON.CLOSE" })}</Button>
                    <Button>{i({ id: "BUTTON.NEXT" })}</Button>
                </DialogActions>
            </Dialog>
        </React.Fragment >
    )
}


const initialEmployeeDetails: InviteNewEmployeeModel = {
    employeeId: "",
    email: "",
    firstName: "",
    lastName: "",
    roleId: ""
}
const InviteNewEmployee = () => {
    const { formatMessage: i } = useIntl();

    const InviteNewEmployee = (values: InviteNewEmployeeModel, setSubmitting: (isSubmitting: boolean) => void) => {
        console.log((values));
    }
    return (
        <Box component="div" className="p-2 mt">
            <Alert color="warning" severity="warning" icon={<PersonAdd />}>
                {i({ id: "EMPLOYEE.INVITE_EMP.INVITE_NOTE" })}
            </Alert>
            <Formik
                initialValues={initialEmployeeDetails}
                validationSchema={employeeSchema}
                onSubmit={(values, { setSubmitting }) => {
                    InviteNewEmployee(values, setSubmitting);
                }}
            >
                {
                    (formik) => {
                        return <form onSubmit={formik.handleSubmit}>
                            <TextInput
                                labelVarient="seperate"
                                label={i({ id: "FORM.EMPID" })}
                                type="text"
                                name="employeeId"
                            />
                        </form>
                    }
                }
            </Formik>
            <Grid container>
                <Grid size="grow">

                </Grid>
            </Grid>
        </Box>
    )
}

// const EditEmployeeData = () => {
//     return (
//         <Box>
//             Hello
//         </Box>
//     )
// }