import { EditDocument, PersonAdd } from "@mui/icons-material";
import { Box, Button, Dialog, DialogContent, DialogContentText, DialogTitle, Step, StepIconProps, StepLabel, Stepper, styled } from "@mui/material"
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
                    <Box component="div">
                        <Stepper activeStep={activeStep}>
                            {
                                steps.map((step, index) => {
                                    return (
                                        <Step key={step.label}>
                                            <StepLabel slots={{
                                                stepIcon: ColorlibStepIcon
                                            }}> {i({ id: step.label })} </StepLabel>
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


const ColorlibStepIconRoot = styled('div')<{ ownerState: { completed?: boolean; active?: boolean }; }>(({ theme }) => ({
    backgroundColor: '#ccc',
    zIndex: 1,
    color: '#fff',
    width: 50,
    height: 50,
    display: 'flex',
    borderRadius: '50%',
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.applyStyles('dark', {
        backgroundColor: theme.palette.grey[700],
    }),
    variants: [
        {
            props: ({ ownerState }) => ownerState.active,
            style: {
                backgroundImage:
                    'linear-gradient( 136deg, rgb(242,113,33) 0%, rgb(233,64,87) 50%, rgb(138,35,135) 100%)',
                boxShadow: '0 4px 10px 0 rgba(0,0,0,.25)',
            },
        },
        {
            props: ({ ownerState }) => ownerState.completed,
            style: {
                backgroundImage:
                    'linear-gradient( 136deg, rgb(242,113,33) 0%, rgb(233,64,87) 50%, rgb(138,35,135) 100%)',
            },
        },
    ],
}));

function ColorlibStepIcon(props: StepIconProps) {
    const { active, completed, className } = props;

    const icons: { [index: string]: React.ReactElement<unknown> } = {
        1: <PersonAdd />,
        2: <EditDocument />
    };

    return (
        <ColorlibStepIconRoot ownerState={{ completed, active }} className={className}>
            {icons[String(props.icon)]}
        </ColorlibStepIconRoot>
    );
}
