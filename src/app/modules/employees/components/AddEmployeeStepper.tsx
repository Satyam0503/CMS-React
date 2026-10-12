import {
  CalendarMonth,
  CurrencyRupee,
  EditDocument,
  PersonAdd,
  } from "@mui/icons-material";
import {
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Slide,
  Step,
  StepConnector,
  stepConnectorClasses,
  StepIconProps,
  StepLabel,
  Stepper,
  styled,
  Typography,
} from "@mui/material";
import React, { useRef, useState } from "react";
import dayjs, { Dayjs } from "dayjs";
import { useIntl } from "react-intl";
import { InviteNewEmployee } from "./InviteNewEmployee";
import { UpdateEmployeeData } from "./UpdateEmployeeData";
import {
  CreateEmployeeSalary,
  InviteEmployeeResponse,
  InviteNewEmployeeModel,
} from "../models";
import { FormikProps } from "formik";
import { EditEmployeePayloadModel } from "../../users/models";
import { LeaveAllocateForm } from "./LeaveAllocateForm";
import { UpdateEmployeeSalaryData } from "./UpdateEmployeeSalaryData";

import { AppButton } from "../../../shared/components/ui";
enum AddEmployeeSteps {
  CREATE_ACCOUNT,
  UPDATE_DATA,
  UPDATE_SALARY,
  ALLOCATE_LEAVE,
}

interface PropsTypes {
  open: boolean;
  handleReresh: () => void;
  handleClose: () => void;
}

const steps = [
  {
    id: AddEmployeeSteps.CREATE_ACCOUNT,
    label: "EMPLOYEE.STEPPER.CREATE_ACCOUNT",
    optional: false,
    icon: <PersonAdd />,
  },
  {
    id: AddEmployeeSteps.UPDATE_DATA,
    label: "EMPLOYEE.STEPPER.EDIT_DATA",
    optional: false,
    icon: <EditDocument />,
  },
  {
    id: AddEmployeeSteps.UPDATE_SALARY,
    label: "EMPLOYEE.STEPPER.UPDATE_SALARY",
    optional: true,
    icon: <CurrencyRupee />,
  },
  {
    id: AddEmployeeSteps.ALLOCATE_LEAVE,
    label: "EMPLOYEE.STEPPER.ALLOCATE_LEAVE",
    optional: true,
    icon: <CalendarMonth />,
  },
];

export const AddEmployeeStepper = (props: PropsTypes) => {
  const { open, handleReresh, handleClose } = props;
  const { formatMessage: i } = useIntl();
  const [activeStep, setActiveSteps] = useState(0);
  const [newEmployeeData, setNewEmployeeData] =
    useState<InviteEmployeeResponse>();
  const [salaryEffectiveFrom, setSalaryEffectiveFrom] = useState<string>();
  const salaryUpdateRef = useRef<FormikProps<CreateEmployeeSalary> | null>(
    null,
  );
  const inviteFormRef = useRef<FormikProps<InviteNewEmployeeModel> | null>(
    null,
  );
  const updateFormRef = useRef<FormikProps<EditEmployeePayloadModel> | null>(
    null,
  );
  const leaveAllocateFormRef = useRef<FormikProps<{
    selectedPolicies: string[];
  }> | null>(null);
  const [buttonLoading, setButtonLoading] = useState(false);

  const incrementStep = () => {
    setActiveSteps((step) => step + 1);
  };

  const handleInviteUser = (
    isInvited: boolean,
    employeeData: InviteEmployeeResponse,
  ) => {
    if (isInvited) {
      incrementStep();
      setNewEmployeeData(employeeData);
    }
  };

  const handleEmployeeDataSaved = (success: boolean, dateOfJoining?: Dayjs | null) => {
    if (!success) return;
    setSalaryEffectiveFrom(dateOfJoining && dayjs(dateOfJoining).isValid()
      ? dayjs(dateOfJoining).format("YYYY-MM-DD")
      : undefined);
    incrementStep();
  };

  const handleSkip = () => {
    setActiveSteps((step) => step + 1);
  };

  const handleSalarySetupComplete = (saved: boolean) => {
    if (saved) {
      incrementStep();
      return;
    }
    setButtonLoading(false);
  };

  const handleButtonLoading = (loading: boolean) => {
    setButtonLoading(loading);
  };

  const handleClick = () => {
    if (
      activeStep === AddEmployeeSteps.CREATE_ACCOUNT &&
      inviteFormRef.current
    ) {
      inviteFormRef.current.submitForm();
      if (inviteFormRef.current.isValid && inviteFormRef.current.dirty) {
        setButtonLoading(true);
      }
    } else if (
      activeStep === AddEmployeeSteps.UPDATE_DATA &&
      updateFormRef.current
    ) {
      updateFormRef.current.submitForm();
      if (updateFormRef.current.isValid && updateFormRef.current.dirty) {
        setButtonLoading(true);
      }
    } else if (
      activeStep === AddEmployeeSteps.UPDATE_SALARY &&
      salaryUpdateRef.current
    ) {
      salaryUpdateRef.current.submitForm();
      if (salaryUpdateRef.current.isValid && salaryUpdateRef.current.dirty) {
        setButtonLoading(true);
      }
    } else if (
      activeStep === AddEmployeeSteps.ALLOCATE_LEAVE &&
      leaveAllocateFormRef.current
    ) {
      leaveAllocateFormRef.current.submitForm();
      if (
        leaveAllocateFormRef.current.isValid &&
        leaveAllocateFormRef.current.dirty
      ) {
        setButtonLoading(true);
      }
    } else {
      handleClose();
      handleReresh();
    }
  };

  return (
    <React.Fragment>
      <Dialog
        fullWidth={true}
        maxWidth={activeStep === AddEmployeeSteps.UPDATE_SALARY ? "lg" : "md"}
        open={open}
        PaperProps={{
          sx: {
            width: activeStep === AddEmployeeSteps.UPDATE_SALARY
              ? "min(1240px, calc(100vw - 32px)) !important"
              : undefined,
            maxWidth: activeStep === AddEmployeeSteps.UPDATE_SALARY
              ? "1240px !important"
              : undefined,
            borderRadius: { xs: 2.5, sm: 3.5 },
            overflow: "hidden",
            border: "1px solid",
            borderColor: "divider",
            backgroundColor: "background.paper",
            boxShadow: "0 28px 80px rgba(15, 23, 42, 0.34)",
            transition: "all 0.25s ease-in-out",
          },
        }}
        slotProps={{
          backdrop: {
            sx: { backgroundColor: "rgba(15, 23, 42, 0.56)", backdropFilter: "blur(3px)" },
          },
        }}
        onClose={() => {
          if (activeStep > 0) {
            return;
          }
          handleClose();
        }}
      >
        <DialogTitle
          sx={{
            px: { xs: 2.5, sm: 4 },
            pt: { xs: 2.5, sm: 3 },
            pb: 1,
            fontSize: { xs: 20, sm: 22 },
            fontWeight: 800,
            color: "text.primary",
            letterSpacing: "-0.02em",
          }}
        >
          {i({ id: "EMPLOYEE.ADD_NEW_EMP" })}
        </DialogTitle>
        {activeStep !== steps.length && (
          <Box
            component="div"
            sx={{
              px: { xs: 2.5, sm: 4 },
              py: 2,
              position: "sticky",
              top: 0,
              width: "100%",
              zIndex: 10,
              background: "linear-gradient(180deg, rgba(156, 91, 210, 0.08), rgba(156, 91, 210, 0.01))",
              borderBottom: "1px solid",
              borderColor: "divider",
              "& .MuiStepLabel-label": {
                mt: 0.75,
                color: "text.secondary",
                fontSize: { xs: 0, sm: 12 },
                fontWeight: 700,
                lineHeight: 1.2,
                "&.Mui-active, &.Mui-completed": { color: "text.primary" },
              },
            }}
          >
            <Stepper activeStep={activeStep} connector={<ColorlibConnector />}>
              {steps.map((step) => {
                return (
                  <Step key={step.label}>
                    <StepLabel
                      slots={{
                        stepIcon: (props) => (
                          <ColorlibStepIcon
                            {...props}
                            iconComponent={step.icon}
                          />
                        ),
                      }}
                    >
                      {" "}
                      {i({ id: step.label })}{" "}
                    </StepLabel>
                  </Step>
                );
              })}
            </Stepper>
          </Box>
        )}
        <DialogContent
          sx={{
            px: { xs: 2, sm: 3.5 },
            py: { xs: 2, sm: 2.5 },
            backgroundColor: "background.default",
            maxHeight: "calc(88vh - 140px)",
            overflowY: "auto",
            scrollbarWidth: "thin",
            "&::-webkit-scrollbar": { width: "6px" },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: "divider",
              borderRadius: "4px",
            },
          }}
        >
          {activeStep === AddEmployeeSteps.CREATE_ACCOUNT && (
            <Slide direction="left" in={open} mountOnEnter unmountOnExit>
              <div>
                <InviteNewEmployee
                  handleInviteUser={handleInviteUser}
                  formRef={inviteFormRef}
                  handleButtonLoading={handleButtonLoading}
                />
              </div>
            </Slide>
          )}
          {activeStep === AddEmployeeSteps.UPDATE_DATA && newEmployeeData && (
            <Slide direction="left" in={open} mountOnEnter unmountOnExit>
              <div>
                <UpdateEmployeeData
                  employeeData={newEmployeeData}
                  onUserUpdate={handleEmployeeDataSaved}
                  formRef={updateFormRef}
                  handleButtonLoading={handleButtonLoading}
                />
              </div>
            </Slide>
          )}
          {activeStep === AddEmployeeSteps.UPDATE_SALARY && newEmployeeData && (
            <Slide direction="left" in={open} mountOnEnter unmountOnExit>
              <div>
                <UpdateEmployeeSalaryData
                  userId={newEmployeeData.userId}
                  employeeId={newEmployeeData.employeeId}
                  defaultEffectiveFrom={salaryEffectiveFrom}
                  handleButtonLoading={handleButtonLoading}
                  onUserUpdate={handleSalarySetupComplete}
                  formRef={salaryUpdateRef}
                />
              </div>
            </Slide>
          )}
          {activeStep === AddEmployeeSteps.ALLOCATE_LEAVE &&
            newEmployeeData && (
              <Slide direction="left" in={open} mountOnEnter unmountOnExit>
                <div>
                  <LeaveAllocateForm
                    formRef={leaveAllocateFormRef}
                    employeeId={newEmployeeData.userId}
                    handleLeaveAllocation={incrementStep}
                    handleButtonLoading={handleButtonLoading}
                  />
                </div>
              </Slide>
            )}
          {activeStep === steps.length && (
            <Slide direction="left" in={open} mountOnEnter unmountOnExit>
              <Box
                component="div"
                className="d-flex p-4 justify-content-between align-items-center flex-column gap-2"
              >
                <Typography sx={{ fontSize: 58 }}>🎊</Typography>
                <Typography className="fs-24 fw-bold">
                  {i({ id: "COMMON.CONGRATULATION" })}
                </Typography>
                <Typography className="fs-16" sx={{ mb: 3 }}>
                  {i({ id: "EMPLOYEE.FINAL.NOTE" })}{" "}
                </Typography>
              </Box>
            </Slide>
          )}
        </DialogContent>

        <DialogActions
          sx={{
            px: { xs: 2.5, sm: 4 },
            py: 2,
            gap: 1,
            justifyContent: "flex-end",
            borderTop: "1px solid",
            borderColor: "divider",
            backgroundColor: "background.paper",
            "& .MuiButton-root": { minWidth: 88, minHeight: 40, fontWeight: 700, borderRadius: 2 },
          }}
        >
          {activeStep === AddEmployeeSteps.CREATE_ACCOUNT && (
            <AppButton variant="outlined" onClick={handleClose}>
              {i({ id: "BUTTON.CLOSE" })}
            </AppButton>
          )}
          {activeStep === AddEmployeeSteps.ALLOCATE_LEAVE && (
            <AppButton variant="outlined" onClick={handleSkip}>
              {i({ id: "BUTTON.SKIP" })}
            </AppButton>
          )}

          <AppButton
            variant="contained"
            onClick={handleClick}
            loading={buttonLoading}
          >
            {i({
              id:
                activeStep === AddEmployeeSteps.CREATE_ACCOUNT
                  ? "BUTTON.INVITE"
                  : activeStep === AddEmployeeSteps.UPDATE_DATA
                    ? "BUTTON.UPDATE"
                    : activeStep === AddEmployeeSteps.UPDATE_SALARY
                      ? "BUTTON.ASSIGN"
                      : activeStep === AddEmployeeSteps.ALLOCATE_LEAVE
                        ? "BUTTON.ASSIGN"
                        : "BUTTON.CLOSE",
            })}
          </AppButton>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
};

const ColorlibConnector = styled(StepConnector)(({ theme }) => ({
  [`&.${stepConnectorClasses.alternativeLabel}`]: {
    top: 22,
  },
  [`&.${stepConnectorClasses.active}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      backgroundImage:
        "linear-gradient(136deg, #B7E7DF 0%, #2F7D78 50%, #1D4946 100%)",
    },
  },
  [`&.${stepConnectorClasses.completed}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      backgroundImage:
        "linear-gradient(136deg, #B7E7DF 0%, #2F7D78 50%, #235955 100%)",
    },
  },
  [`& .${stepConnectorClasses.line}`]: {
    height: 3,
    border: 0,
    backgroundColor: theme.vars?.palette.grey[400],
    borderRadius: 1,
    ...theme.applyStyles("dark", {
      backgroundColor: theme.palette.grey[600],
    }),
  },
}));

const ColorlibStepIconRoot = styled("div")<{
  ownerState: { completed?: boolean; active?: boolean };
}>(({ theme }) => ({
  backgroundColor: theme.vars?.palette.grey[400],
  zIndex: 1,
  color: theme.vars?.palette.common.white,
  width: 42,
  height: 42,
  display: "flex",
  borderRadius: "50%",
  justifyContent: "center",
  alignItems: "center",
  ...theme.applyStyles("dark", {
    backgroundColor: theme.palette.grey[600],
  }),
  variants: [
    {
      props: ({ ownerState }) => ownerState.active,
      style: {
        backgroundImage:
          "linear-gradient( 136deg, #d4bce6ff 0%, #bc89e6ff 50%, #b56bf2ff 100%)",
        boxShadow: "0 4px 10px 0 rgba(0,0,0,.25)",
      },
    },
    {
      props: ({ ownerState }) => ownerState.completed,
      style: {
        backgroundImage:
          "linear-gradient(136deg, #B7E7DF 0%, #2F7D78 50%, #173C39 100%)",
      },
    },
  ],
}));

function ColorlibStepIcon(
  props: StepIconProps & { iconComponent: React.ReactElement },
) {
  const { active, completed, className, iconComponent } = props;
  return (
    <ColorlibStepIconRoot
      ownerState={{ completed, active }}
      className={className}
    >
      {iconComponent}
    </ColorlibStepIconRoot>
  );
}
