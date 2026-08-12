import { Box, Card, Grid, Stack, TextField, Typography } from "@mui/material";
import { FormattedMessage, useIntl } from "react-intl";
import {
  dateFormatter,
  EmploymentTypeMapper,
  hasModuleFeaturePermission,
} from "../../../../../utils/common";
import { UpdateUserInfo } from "./UpdateUserInfo";
import { useState } from "react";
import { CustomIconButton } from "../../../../shared/components/C_IconButton";
import { Edit } from "@mui/icons-material";
import { useUserDetails } from "../../UserDataProvider";
import { Link, useParams } from "react-router-dom";
import { ModulesName, Permission } from "../../../../../utils/enums";
import { useAppSelector } from "../../../../Redux/hooks";
import { useAppLang } from "../../../../../_themes/i18n/Metronici18n";
import { assignMissingEmployeeId, getNextEmployeeId } from "../../userservices";
import { CustomisedModal } from "../../../../shared/components/C_Modal";
import { ConfirmationModal } from "../../../../shared/components/ConfirmModal";
import { AppButton } from "../../../../shared/components/ui";
import { toast } from "react-toastify";

export const PersonalDetails = () => {
  const { formatMessage: i } = useIntl();
  const [isModalOpen, setModalOpen] = useState(false);
  const { userDetails, setRefresh } = useUserDetails();
  const employeeId = useParams().employeeid;
  const userPermissions = useAppSelector((state) => state.user.userData?.modulePermission) || [];
  const hasEmployeeEditPermission = !employeeId ||
    hasModuleFeaturePermission(
      ModulesName.Employees,
      Permission.Edit,
      userPermissions
    );
  const { currentLanguage } = useAppLang();
  const defaultLanguage = useAppSelector((state) => state.user.userData?.defaultLanguage!);
  const [assignmentOpen, setAssignmentOpen] = useState(false);
  const [manualEntry, setManualEntry] = useState(false);
  const [manualEmployeeId, setManualEmployeeId] = useState("");
  const [previewEmployeeId, setPreviewEmployeeId] = useState("");
  const [submittingEmployeeId, setSubmittingEmployeeId] = useState(false);
  const [assignmentConfirmationOpen, setAssignmentConfirmationOpen] = useState(false);
  const canAssignEmployeeId = Boolean(employeeId && hasEmployeeEditPermission && !userDetails?.employeeId);

  const openEmployeeIdAssignment = async () => {
    try {
      const { data } = await getNextEmployeeId();
      setPreviewEmployeeId(data.message ?? "");
      setManualEntry(!data.message);
      setAssignmentOpen(true);
    } catch {
      toast.error("Unable to load Employee ID settings. Please try again.");
    }
  };

  const requestEmployeeIdAssignment = () => {
    if (!employeeId || (manualEntry && !manualEmployeeId.trim())) {
      toast.error("Enter an Employee ID to continue.");
      return;
    }
    setAssignmentConfirmationOpen(true);
  };

  const assignEmployeeId = async () => {
    if (!employeeId) return;
    try {
      setSubmittingEmployeeId(true);
      const { data } = await assignMissingEmployeeId(employeeId, manualEntry ? manualEmployeeId : undefined);
      if (!data.success) {
        toast.error(data.message || "Unable to assign Employee ID.");
        return;
      }
      toast.success(data.message || "Employee ID assigned successfully.");
      setAssignmentConfirmationOpen(false);
      setAssignmentOpen(false);
      setManualEmployeeId("");
      setRefresh();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Unable to assign Employee ID.");
    } finally {
      setSubmittingEmployeeId(false);
    }
  };

  return (
    <Card sx={{ p: { xs: 2, md: 2.5 }, borderRadius: 3, border: 1, borderColor: "divider", boxShadow: "0 8px 24px rgba(0,0,0,.05)" }}>
      <Stack className="flex-row justify-content-between" sx={{ mb: 2.5 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>{i({ id: "PROFILE.PI.TITLE" })}</Typography>
        {hasEmployeeEditPermission && (
          <CustomIconButton
            tooltip={i({ id: "BUTTON.EDIT" })}
            icon={<Edit />}
            handleClick={() => setModalOpen(true)}
          />
        )}

        {isModalOpen && userDetails && (
          <UpdateUserInfo
            open={isModalOpen}
            setOpen={setModalOpen}
            userData={userDetails}
          />
        )}
      </Stack>
      <Grid container spacing={1.5} sx={{ "& > .MuiGrid-root": { p: 1.5, borderRadius: 2, bgcolor: "action.hover", minHeight: 66 }, "& .MuiTypography-body2": { color: "text.secondary", fontSize: 12, mb: .4 }, "& .MuiTypography-body1": { fontWeight: 600, overflowWrap: "anywhere" } }}>
        <Grid size={12}>
          <Typography variant="body2">{i({ id: "USER.ADDRESS" })}</Typography>
          <Typography variant="body1">
            {userDetails?.address || <FormattedMessage id="NOT_AVAILABLE" />}
          </Typography>
        </Grid>

        <Grid
          size={{
            xs: 12,
            sm: 6
          }}>
          <Typography variant="body2">{i({ id: "FORM.EMAIL" })}</Typography>
          <Typography variant="body1">{userDetails?.email}</Typography>
        </Grid>
        <Grid
          size={{
            xs: 12,
            sm: 6
          }}>
          <Typography variant="body2">{i({ id: "FORM.PHONE" })}</Typography>
          <Typography variant="body1">
            {userDetails?.phoneNumber || (
              <FormattedMessage id="NOT_AVAILABLE" />
            )}
          </Typography>
        </Grid>

        <Grid
          size={{
            xs: 12,
            sm: 6
          }}>
          <Typography variant="body2">{i({ id: "FORM.DOB" })}</Typography>
          <Typography variant="body1">
            {dateFormatter(userDetails?.dateOfBirth, "DD MMMM YYYY") ||
              i({ id: "NOT_AVAILABLE" })}
          </Typography>
        </Grid>
        <Grid
          size={{
            xs: 12,
            sm: 6
          }}>
          <Typography variant="body2">{i({ id: "USER.GENDER" })}</Typography>
          <Typography variant="body1">{userDetails?.gender ?? <FormattedMessage id="NOT_AVAILABLE" />}</Typography>
        </Grid>

        <Grid
          size={{
            xs: 12,
            sm: 6
          }}>
          <Typography variant="body2">{i({ id: "FORM.DOJ" })}</Typography>
          <Typography variant="body1">
            {dateFormatter(userDetails?.dateOfJoining, "DD MMMM YYYY") || (
              <FormattedMessage id="NOT_AVAILABLE" />
            )}
          </Typography>
        </Grid>

        <Grid
          size={{
            xs: 12,
            sm: 6
          }}>
          <Typography variant="body2">{i({ id: "USER.EMP_ID" })}</Typography>
          <Typography variant="body1">
            {userDetails?.employeeId || <FormattedMessage id="NOT_AVAILABLE" />}
          </Typography>
          {canAssignEmployeeId && <AppButton size="small" variant="outlined" sx={{ mt: 1 }} onClick={openEmployeeIdAssignment}>Assign Employee ID</AppButton>}
        </Grid>
        <Grid
          size={{
            xs: 12,
            sm: 6
          }}>
          <Typography variant="body2">
            {i({ id: "FORM.DEPARTMENT" })}
          </Typography>
          <Typography variant="body1">
            {!userDetails?.departmentTitle ||
              userDetails.departmentTitle == null ? (
              <FormattedMessage id="NOT_AVAILABLE" />
            ) : (
              userDetails.departmentTitle[currentLanguage] ||
              userDetails.departmentTitle[defaultLanguage]
            )}
          </Typography>
        </Grid>

        <Grid
          size={{
            xs: 12,
            sm: 6
          }}>
          <Typography variant="body2">
            {i({ id: "USER.REPORTING_MANAGER" })}
          </Typography>
          <Typography variant="body1">
            {userDetails?.reportingManager ?
              <Link to={`/employees/${userDetails.reportingManager}`}> {userDetails.reportingManagerName} </Link>
              : <FormattedMessage id="NOT_AVAILABLE" />
            }
          </Typography>
        </Grid>
        <Grid
          size={{
            xs: 12,
            sm: 6
          }}>
          <Typography variant="body2">
            {i({ id: "USER.PERSONAL_EMAIL" })}
          </Typography>
          <Typography variant="body1">
            {userDetails?.personalEmail || (
              <FormattedMessage id="NOT_AVAILABLE" />
            )}
          </Typography>
        </Grid>
        <Grid
          size={{
            xs: 12,
            sm: 6
          }}>
          <Typography variant="body2">
            {i({ id: "USER.EMERGENCY_CONTACT" })}
          </Typography>
          <Typography variant="body1">
            {userDetails?.emergencyContact || (
              <FormattedMessage id="NOT_AVAILABLE" />
            )}
          </Typography>
        </Grid>

        <Grid
          size={{
            xs: 12,
            sm: 6
          }}>
          <Typography variant="body2">
            {i({ id: "USER.BLOOD_GROUP" })}
          </Typography>
          <Typography variant="body1">
            {userDetails?.bloodGroup || <FormattedMessage id="NOT_AVAILABLE" />}
          </Typography>
        </Grid>
        <Grid
          size={{
            xs: 12,
            sm: 6
          }}>
          <Typography variant="body2">
            {i({ id: "FORM.EMPLOYEMENT_TYPE" })}
          </Typography>
          <Typography variant="body1">
            {userDetails.employmentType ? i({ id: EmploymentTypeMapper[userDetails.employmentType] }) : <FormattedMessage id="NOT_AVAILABLE" />}
          </Typography>
        </Grid>
        {
          hasEmployeeEditPermission &&
          <>
            <Grid
              size={{
                xs: 12,
                sm: 6
              }}>
              <Typography variant="body2">
                {i({ id: "USER.PAN_NUMBER" })}
              </Typography>
              <Typography variant="body1">
                {userDetails.panNumber || <FormattedMessage id="NOT_AVAILABLE" />}
              </Typography>
            </Grid>
            <Grid
              size={{
                xs: 12,
                sm: 6
              }}>
              <Typography variant="body2">
                {i({ id: "USER.BANK_ACCOUNT_NO" })}
              </Typography>
              <Typography variant="body1">
                {userDetails?.bankAccountNumber ?? <FormattedMessage id="NOT_AVAILABLE" />}
              </Typography>
            </Grid>
          </>
        }

        {/* Render user custom Attribute value */}
        {userDetails?.customAttributes?.length > 0 &&
          userDetails.customAttributes.map((attribute, index) => (
            <Grid
              key={attribute.customAttributeId}
              size={{
                xs: 12,
                sm: 6
              }}>
              <Typography variant="body2">{attribute.customAttributeTitle?.[currentLanguage] ?? `${i({ id: "COMPANY_MASTER.CUSTOM_ATTRIBUTE.TITLE" })} ${index + 1}`}</Typography>
              <Typography variant="body1">{attribute.customAttributeValueTitle?.[currentLanguage] ?? attribute.customAttributeValueTitle?.[defaultLanguage]}</Typography>
            </Grid>
          ))}
      </Grid>
      <CustomisedModal open={assignmentOpen} handleClose={() => !submittingEmployeeId && setAssignmentOpen(false)} title="Assign Employee ID" maxWidth="sm">
        <Stack spacing={2} sx={{ pt: 1, width: "100%" }}>
          <Typography variant="body2" color="text.secondary">{manualEntry ? "Enter an Employee ID in the company’s configured format. It cannot be changed after assignment." : `The next company Employee ID will be assigned${previewEmployeeId ? `: ${previewEmployeeId}` : ""}.`}</Typography>
          {manualEntry && <TextField autoFocus fullWidth label="Employee ID" value={manualEmployeeId} onChange={(event) => setManualEmployeeId(event.target.value)} placeholder="Enter Employee ID" inputProps={{ maxLength: 64 }} />}
          <Box sx={{ display: "flex", justifyContent: "flex-end" }}><AppButton variant="contained" onClick={requestEmployeeIdAssignment} disabled={submittingEmployeeId}>{submittingEmployeeId ? "Assigning..." : "Review assignment"}</AppButton></Box>
        </Stack>
      </CustomisedModal>
      <ConfirmationModal
        open={assignmentConfirmationOpen}
        title="Confirm Employee ID assignment"
        content={manualEntry
          ? `Assign Employee ID ${manualEmployeeId.trim().toUpperCase()} to ${`${userDetails?.firstName ?? ""} ${userDetails?.lastName ?? ""}`.trim() || "this employee"}? This cannot be changed from this action.`
          : `Assign the next configured Employee ID${previewEmployeeId ? ` (${previewEmployeeId})` : ""} to ${`${userDetails?.firstName ?? ""} ${userDetails?.lastName ?? ""}`.trim() || "this employee"}?`}
        handleClose={() => !submittingEmployeeId && setAssignmentConfirmationOpen(false)}
        handleConfirmation={() => void assignEmployeeId()}
        ok_btn
      />
    </Card>
  );
};

