import { CalendarMonth, EditDocument, PersonAdd, } from "@mui/icons-material";
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Slide, Step, StepConnector, stepConnectorClasses, StepIconProps, StepLabel, Stepper, styled, Typography } from "@mui/material"
import React, { useRef, useState } from "react";
import { useIntl } from "react-intl";
import { InviteNewEmployee } from "./InviteNewEmployee";
import { UpdateEmployeeData } from "./UpdateEmployeeData";
import { InviteEmployeeResponse, InviteNewEmployeeModel } from "../models";
import { FormikProps } from "formik";
import { EditEmployeePayloadModel } from "../../users/models";
import { LeaveAllocateForm } from "./LeaveAllocateForm";

enum AddEmployeeSteps {
    CREATE_ACCOUNT,
    UPDATE_DATA,
    ALLOCATE_LEAVE,
}

interface PropsTypes {
    open: boolean;
    handleReresh: () => void;
    handleClose: () => void;
}

const steps = [
    { id: AddEmployeeSteps.CREATE_ACCOUNT, label: "EMPLOYEE.STEPPER.CREATE_ACCOUNT", optional: false, icon: <PersonAdd /> },
    { id: AddEmployeeSteps.UPDATE_DATA, label: "EMPLOYEE.STEPPER.EDIT_DATA", optional: false, icon: <EditDocument /> },
    { id: AddEmployeeSteps.ALLOCATE_LEAVE, label: "EMPLOYEE.STEPPER.ALLOCATE_LEAVE", optional: true, icon: <CalendarMonth /> },
]

export const AddEmployeeStepper = (props: PropsTypes) => {
    const { open, handleReresh, handleClose } = props;
    const { formatMessage: i } = useIntl();
    const [activeStep, setActiveSteps] = useState(0);
    const [newEmployeeData, setNewEmployeeData] = useState<InviteEmployeeResponse>()
    const inviteFormRef = useRef<FormikProps<InviteNewEmployeeModel> | null>(null);
    const updateFormRef = useRef<FormikProps<EditEmployeePayloadModel> | null>(null);
    const leaveAllocateFormRef = useRef<FormikProps<{ selectedPolicies: string[] }> | null>(null);
    const [buttonLoading, setButtonLoading] = useState(false);

    const incrementStep = () => {
        setActiveSteps(step => step + 1);
    }

    const handleInviteUser = (isInvited: boolean, employeeData: InviteEmployeeResponse) => {
        if (isInvited) {
            incrementStep();
            setNewEmployeeData(employeeData);
        }
    }

    const handleSkip = () => {
        setActiveSteps(step => step + 1);
    }

    const handleButtonLoading = (loading: boolean) => {
        setButtonLoading(loading);
    };


    const handleClick = () => {
        if (activeStep === AddEmployeeSteps.CREATE_ACCOUNT && inviteFormRef.current) {
            inviteFormRef.current.submitForm();
            if (inviteFormRef.current.isValid && inviteFormRef.current.dirty) {
                setButtonLoading(true);
            }
        }
        else if (activeStep === AddEmployeeSteps.UPDATE_DATA && updateFormRef.current) {
            updateFormRef.current.submitForm();
            if (updateFormRef.current.isValid && updateFormRef.current.dirty) {
                setButtonLoading(true);
            }
        }
        else if (activeStep === AddEmployeeSteps.ALLOCATE_LEAVE && leaveAllocateFormRef.current) {
            leaveAllocateFormRef.current.submitForm();
            if (leaveAllocateFormRef.current.isValid && leaveAllocateFormRef.current.dirty) {
                setButtonLoading(true);
            }
        }
        else {
            handleClose();
            handleReresh();
        }
    }

    return (
        <React.Fragment>
            <Dialog
                fullWidth={true}
                maxWidth="xl"
                open={open}
                onClose={() => {
                    if (activeStep > 0) {
                        return;
                    }
                    handleClose();
                }}
            >
                <DialogTitle className="fs-20">{i({ id: "EMPLOYEE.ADD_NEW_EMP" })}</DialogTitle>
                {
                    activeStep !== steps.length &&

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
                }
                <DialogContent>
                    {
                        activeStep === AddEmployeeSteps.CREATE_ACCOUNT &&
                        <Slide direction="left" in={open} mountOnEnter unmountOnExit>
                            <div>
                                <InviteNewEmployee handleInviteUser={handleInviteUser} formRef={inviteFormRef} handleButtonLoading={handleButtonLoading} />
                            </div>
                        </Slide>
                    }
                    {
                        (activeStep === AddEmployeeSteps.UPDATE_DATA && newEmployeeData) &&
                        <Slide direction="left" in={open} mountOnEnter unmountOnExit>
                            <div>
                                <UpdateEmployeeData employeeData={newEmployeeData} onUserUpdate={incrementStep} formRef={updateFormRef} handleButtonLoading={handleButtonLoading} />
                            </div>
                        </Slide>
                    }
                    {
                        (activeStep === AddEmployeeSteps.ALLOCATE_LEAVE && newEmployeeData) &&
                        <Slide direction="left" in={open} mountOnEnter unmountOnExit>
                            <div>
                                <LeaveAllocateForm formRef={leaveAllocateFormRef} employeeId={newEmployeeData.userId} handleLeaveAllocation={incrementStep} handleButtonLoading={handleButtonLoading} />
                            </div>
                        </Slide>

                    }
                    {activeStep === steps.length && (
                        <Slide direction="left" in={open} mountOnEnter unmountOnExit>
                            <Box component="div" className="d-flex p-4 justify-content-between align-items-center flex-column gap-2">
                                <Typography sx={{ fontSize: 58 }}>
                                    🎊
                                </Typography>
                                <Typography className="fs-24 fw-bold">{i({ id: "COMMON.CONGRATULATION" })}</Typography>
                                <Typography className="fs-16" sx={{ mb: 3 }}>{i({ id: "EMPLOYEE.FINAL.NOTE" })} </Typography>
                            </Box>
                        </Slide>
                    )}
                </DialogContent>

                <DialogActions sx={{ px: 4, paddingBlockEnd: 3, justifyContent: "flex-end" }}>
                    {
                        activeStep === AddEmployeeSteps.CREATE_ACCOUNT &&
                        <Button variant="outlined" onClick={handleClose}>{i({ id: "BUTTON.CLOSE" })}</Button>
                    }
                    {
                        activeStep === AddEmployeeSteps.ALLOCATE_LEAVE &&
                        <Button variant="outlined" onClick={handleSkip}>{i({ id: "BUTTON.SKIP" })}</Button>
                    }

                    <Button variant="contained" onClick={handleClick} loading={buttonLoading}>
                        {
                            i({ id: activeStep === AddEmployeeSteps.CREATE_ACCOUNT ? "BUTTON.INVITE" : (activeStep === AddEmployeeSteps.UPDATE_DATA) ? "BUTTON.UPDATE" : (activeStep === AddEmployeeSteps.ALLOCATE_LEAVE) ? "BUTTON.ASSIGN" : "BUTTON.CLOSE" })
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
                    'linear-gradient( 136deg, #d4bce6ff 0%, #bc89e6ff 50%, #b56bf2ff 100%)',
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