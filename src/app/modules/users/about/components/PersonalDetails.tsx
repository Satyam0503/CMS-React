import { Card, Grid, Stack, Typography } from "@mui/material";
import { FormattedMessage, useIntl } from "react-intl";
import {
  dateFormatter,
  EmploymentTypeMapper,
  hasModuleFeaturePermission,
} from "../../../../../utils/common";
import { UpdateUserInfo } from "./UpdateUserInfo";
import { useState } from "react";
import { CustomIconButton } from "../../../../shared/components/CustomIconButton";
import { Edit } from "@mui/icons-material";
import { useUserDetails } from "../../UserDataProvider";
import { useParams } from "react-router-dom";
import { ModulesName, Permission } from "../../../../../utils/enums";
import { useAppSelector } from "../../../../Redux/hooks";
import { useAppLang } from "../../../../../_themes/i18n/Metronici18n";

export const PersonalDetails = () => {
  const { formatMessage: i } = useIntl();
  const [isModalOpen, setModalOpen] = useState(false);
  const { userDetails } = useUserDetails();
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

  return (
    <Card sx={{ p: 2 }}>
      <Stack className="flex-row justify-content-between mb-4">
        <Typography variant="h5">{i({ id: "PROFILE.PI.TITLE" })}</Typography>
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
      <Grid container spacing={1}>
        <Grid item xs={12}>
          <Typography variant="body2">{i({ id: "USER.ADDRESS" })}</Typography>
          <Typography variant="body1">
            {userDetails?.address || <FormattedMessage id="NOT_AVAILABLE" />}
          </Typography>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Typography variant="body2">{i({ id: "FORM.EMAIL" })}</Typography>
          <Typography variant="body1">{userDetails?.email}</Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography variant="body2">{i({ id: "FORM.PHONE" })}</Typography>
          <Typography variant="body1">
            {userDetails?.phoneNumber || (
              <FormattedMessage id="NOT_AVAILABLE" />
            )}
          </Typography>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Typography variant="body2">{i({ id: "FORM.DOB" })}</Typography>
          <Typography variant="body1">
            {dateFormatter(userDetails?.dateOfBirth!, "DD MMMM YYYY") ||
              i({ id: "NOT_AVAILABLE" })}
          </Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography variant="body2">{i({ id: "USER.GENDER" })}</Typography>
          <Typography variant="body1">{userDetails?.gender}</Typography>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Typography variant="body2">{i({ id: "FORM.DOJ" })}</Typography>
          <Typography variant="body1">
            {dateFormatter(userDetails?.dateOfJoining!, "DD MMMM YYYY") || (
              <FormattedMessage id="NOT_AVAILABLE" />
            )}
          </Typography>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Typography variant="body2">{i({ id: "USER.EMP_ID" })}</Typography>
          <Typography variant="body1">
            {userDetails?.employeeId || <FormattedMessage id="NOT_AVAILABLE" />}
          </Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography variant="body2">
            {i({ id: "FORM.DEPARTMENT" })}
          </Typography>
          <Typography variant="body1">
            {!Boolean(userDetails?.departmentTitle) ||
              userDetails.departmentTitle == null ? (
              <FormattedMessage id="NOT_AVAILABLE" />
            ) : (
              userDetails.departmentTitle[currentLanguage] ||
              userDetails.departmentTitle[defaultLanguage]
            )}
          </Typography>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Typography variant="body2">
            {i({ id: "USER.REPORTING_MANAGER" })}
          </Typography>
          <Typography variant="body1">
            {userDetails?.reportingManagerName || (
              <FormattedMessage id="NOT_AVAILABLE" />
            )}
          </Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography variant="body2">
            {i({ id: "USER.PERSONAL_EMAIL" })}
          </Typography>
          <Typography variant="body1">
            {userDetails?.personalEmail || (
              <FormattedMessage id="NOT_AVAILABLE" />
            )}
          </Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography variant="body2">
            {i({ id: "USER.EMERGENCY_CONTACT" })}
          </Typography>
          <Typography variant="body1">
            {userDetails?.emergencyContact || (
              <FormattedMessage id="NOT_AVAILABLE" />
            )}
          </Typography>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Typography variant="body2">
            {i({ id: "USER.BLOOD_GROUP" })}
          </Typography>
          <Typography variant="body1">
            {userDetails?.bloodGroup || <FormattedMessage id="NOT_AVAILABLE" />}
          </Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
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
            <Grid item xs={12} sm={6}>
              <Typography variant="body2">
                {i({ id: "USER.PAN_NUMBER" })}
              </Typography>
              <Typography variant="body1">
                {userDetails.panNumber || <FormattedMessage id="NOT_AVAILABLE" />}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
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
            <Grid item xs={12} sm={6} key={attribute.customAttributeId}>
              <Typography variant="body2">{attribute.customAttributeTitle?.[currentLanguage] ?? `${i({ id: "COMPANY_MASTER.CUSTOM_ATTRIBUTE.TITLE" })} ${index + 1}`}</Typography>
              <Typography variant="body1">{attribute.customAttributeValueTitle?.[currentLanguage] ?? attribute.customAttributeValueTitle?.[defaultLanguage]}</Typography>
            </Grid>
          ))}
      </Grid>
    </Card>
  );
};

