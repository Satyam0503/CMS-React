import { EditDocument, PersonAdd, } from "@mui/icons-material";
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Slide, Stack, Step, StepConnector, stepConnectorClasses, StepIconProps, StepLabel, Stepper, styled } from "@mui/material"
import React, { useRef, useState } from "react";
import { useIntl } from "react-intl";
import { InviteNewEmployee } from "./InviteNewEmployee";
import { UpdateEmployeeData } from "./UpdateEmployeeData";
import { InviteEmployeeResponse, InviteNewEmployeeModel } from "../models";
import { FormikProps } from "formik";
import { EditEmployeePayloadModel } from "../../users/models";

interface PropsTypes {
    open: boolean;
    handleReresh: () => void;
    handleClose: () => void;
}

const steps = [
    { label: "EMPLOYEE.STEPPER.CREATE_ACCOUNT", optional: false, icon: <PersonAdd /> },
    { label: "EMPLOYEE.STEPPER.EDIT_DATA", optional: false, icon: <EditDocument /> }
]

export const AddEmployeeStepper = (props: PropsTypes) => {
    const { open, handleReresh, handleClose } = props;
    const { formatMessage: i } = useIntl();
    const [activeStep, setActiveSteps] = useState(0);
    const [newEmployeeData, setNewEmployeeData] = useState<InviteEmployeeResponse>()
    const inviteFormRef = useRef<FormikProps<InviteNewEmployeeModel> | null>(null);
    const updateFormRef = useRef<FormikProps<EditEmployeePayloadModel> | null>(null);

    const handleInviteUser = (isInvited: boolean, employeeData: InviteEmployeeResponse) => {
        if (isInvited) {
            setActiveSteps((step) => step + 1);
            setNewEmployeeData(employeeData);
        }
    }
    const handleUserUpdate = (success: boolean) => {
        if (success) {
            setActiveSteps((step) => step + 1);
            handleClose();
            handleReresh();
        }
    }


    const handleClick = () => {
        if (activeStep === 0 && inviteFormRef.current) {
            inviteFormRef.current.submitForm();
        }
        else if (activeStep === 1 && updateFormRef.current) {
            updateFormRef.current.submitForm();
        }
        else {
            handleClose();
        }
    }

    return (
        <React.Fragment>

            <Dialog
                fullWidth={true}
                maxWidth="xl"
                open={open}
                onClose={() => {
                    if (activeStep === 1) {
                        return;
                    }
                    handleClose();
                }}
            >
                <DialogTitle className="fs-20">{i({ id: "EMPLOYEE.ADD_NEW_EMP" })}</DialogTitle>
                <Box component="div" sx={{ paddingBlockEnd: 1, px: 2, position: "sticky", top: 0, width: "100%", zIndex: 10 }}>
                    <Stepper activeStep={activeStep} connector={<ColorlibConnector />} >
                        {
                            steps.map((step) => {
                                return (
                                    <Step key={step.label} >
                                        <StepLabel slots={{
                                            stepIcon: (props) => <ColorlibStepIcon {...props} iconComponent={step.icon} />
                                        }}> {i({ id: step.label })} </StepLabel>
                                    </Step>
                                );
                            })
                        }
                    </Stepper>
                </Box>
                <DialogContent>
                    {
                        activeStep === 0 &&
                        <Slide direction="left" in={open && activeStep === 0} mountOnEnter unmountOnExit>
                            <div>
                                <InviteNewEmployee handleInviteUser={handleInviteUser} formRef={inviteFormRef} />
                            </div>
                        </Slide>
                    }
                    {
                        (activeStep === 1 && newEmployeeData) &&
                        <Slide direction="left" in={open && activeStep === 1} mountOnEnter unmountOnExit>
                            <div>
                                <UpdateEmployeeData employeeData={newEmployeeData} onUserUpdate={handleUserUpdate} formRef={updateFormRef} />
                            </div>
                        </Slide>
                    }
                    <Stack direction="row">
                    </Stack>
                </DialogContent>

                <DialogActions sx={{ px: 4, paddingBlockEnd: 3, justifyContent: "flex-end" }}>
                    {
                        activeStep === 0 &&
                        <Button variant="contained" onClick={handleClose}>{i({ id: "BUTTON.CLOSE" })}</Button>
                    }
                    <Button variant="contained" onClick={handleClick} >
                        {
                            i({ id: activeStep === 0 ? "BUTTON.INVITE" : (activeStep === 1) ? "BUTTON.UPDATE" : "BUTTON.CLOSE" })
                        }
                    </Button>
                </DialogActions>
            </Dialog>
        </React.Fragment >
    )
}




const ColorlibConnector = styled(StepConnector)(({ theme }) => ({
    [`&.${stepConnectorClasses.alternativeLabel}`]: {
        top: 22,
    },
    [`&.${stepConnectorClasses.active}`]: {
        [`& .${stepConnectorClasses.line}`]: {
            backgroundImage:
                'linear-gradient( 136deg, #dab7f7ff 0%, #9A56D3 50%, #7d1fc9ff 100%)',
        },
    },
    [`&.${stepConnectorClasses.completed}`]: {
        [`& .${stepConnectorClasses.line}`]: {
            backgroundImage:
                'linear-gradient( 136deg, #dab7f7ff 0%, #9A56D3 50%, #8023cdff 100%)',
        },
    },
    [`& .${stepConnectorClasses.line}`]: {
        height: 3,
        border: 0,
        backgroundColor: theme.vars?.palette.grey[400],
        borderRadius: 1,
        ...theme.applyStyles('dark', {
            backgroundColor: theme.palette.grey[600],
        }),
    },
}));

const ColorlibStepIconRoot = styled('div')<{
    ownerState: { completed?: boolean; active?: boolean };
}>(({ theme }) => ({
    backgroundColor: theme.vars?.palette.grey[400],
    zIndex: 1,
    color: theme.vars?.palette.common.white,
    width: 42,
    height: 42,
    display: 'flex',
    borderRadius: '50%',
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.applyStyles('dark', {
        backgroundColor: theme.palette.grey[600],
    }),
    variants: [
        {
            props: ({ ownerState }) => ownerState.active,
            style: {
                backgroundImage:
                    'linear-gradient( 136deg, #dab7f7ff 0%, #9A56D3 50%, #6a02bfff 100%)',
                boxShadow: '0 4px 10px 0 rgba(0,0,0,.25)',
            },
        },
        {
            props: ({ ownerState }) => ownerState.completed,
            style: {
                backgroundImage:
                    'linear-gradient( 136deg, #dab7f7ff 0%, #9A56D3 50%, #6a02bfff 100%)',
            },
        },
    ],
}));

function ColorlibStepIcon(props: StepIconProps & { iconComponent: React.ReactElement }) {

    const { active, completed, className, iconComponent } = props;

    return (
        <ColorlibStepIconRoot ownerState={{ completed, active }} className={className}>
            {iconComponent}
        </ColorlibStepIconRoot>
    );
}