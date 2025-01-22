import {
  Add,
  CalendarMonth,
  Check,
  DeleteOutline,
  Edit,
  School,
} from "@mui/icons-material";
import {
  Card,
  Chip,
  Grid,
  IconButton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useIntl } from "react-intl";
import UpdateUserInfo from "./UpdateUserInfo";
import AddUpdateCertification from "./AddUpdateCertification";
import { useUserDetails } from "./UserDataProvider";
import { useRef, useState } from "react";
import { dateFormatter } from "../../../utils/common";
import { AddUpdateSkills } from "./AddUpdateSkills";
import AddUpdateEducation from "./AddUpdateEducation";

import dayjs from "dayjs";
import {
  CertificationsType,
  UserCertificationType,
  UserEducationType,
} from "../../../utils/common_types";
import {
  addUpdateUserCertification,
  addUpdateUserSummary,
  addUserEducation,
  updateUserEducation,
} from "./userservices";
import { toast } from "react-toastify";
import { ConfirmationModal } from "../components/ConfirmationModal";
import CustomisedButton from "../components/CustomisedButton";
import { useAppSelector } from "../../Redux/hooks";
import { CustomIconButton } from "../components/CustomIconButton";
import { colors } from "../theme/MuiTheme";

const initialEducationValues: UserEducationType = {
  title: "",
  startDate: null,
  endDate: null,
  collegeName: "",
  type: "",
};

const initialCertificationValues: UserCertificationType = {
  title: "",
  startDate: null,
  endDate: null,
  organizationName: "",
  type: "",
};

export default function AboutUser() {
  const token = useAppSelector((state) => state.auth.token)!;
  const userId = useAppSelector((state) => state.user.userData?.userId)!;
  const intl = useIntl();
  const [isSummaryEdit, setSummaryEdit] = useState(false);
  const [isUserModalOpen, setUserUpdateModalOpen] = useState(false);
  const [isSkillsModalOpen, setSkillsModalOpen] = useState(false);
  const [isEducationModalOpen, setEducationModalOpen] = useState(false);
  const [isCertificationModalOpen, setCertificationModalOpen] = useState(false);
  const [initialEducationValue, setInitialEducationValue] =
    useState<UserEducationType>(initialEducationValues);
  const [initialCertificationValue, setInitialCertificationValue] = useState(
    initialCertificationValues
  );
  const [openConfirmationModal, setConfirmationModal] = useState(false);

  const [isEdit, setEdit] = useState(false);
  const { userDetails: currentUser, isRefresh, setRefresh } = useUserDetails();
  const summary = useRef(""); // can replace with state variable
  const skills = currentUser?.skills || [];
  const educations = currentUser?.Education || [];
  const certifications = currentUser?.Certifications || [];

  function handleEducationUpdate(education: UserEducationType) {
    setEdit(true);
    const value = {
      id: education.id,
      title: education.title,
      startDate: dayjs(education.startDate),
      endDate: dayjs(education.endDate),
      type: education.type,
      collegeName: education.collegeName,
    };
    setInitialEducationValue(value);
    setEducationModalOpen(true);
  }

  function handleEducationModalClose() {
    setEducationModalOpen(false);
    setEdit(false);
    setInitialEducationValue(initialEducationValues);
  }

  function handleAddUpdateEducation(
    values: UserEducationType,
    setSubmitting: (isSubmitting: boolean) => void
  ) {
    if (isEdit) {
      const payload = {
        ...values,
        startDate: dayjs(values.startDate),
        endDate: dayjs(values.endDate),
        id: values.id,
      };
      updateUserEducation(); //  handle user education update.
    } else {
      const payload = {
        ...values,
        startDate: dayjs(values.startDate),
        endDate: dayjs(values.endDate),
      };
      addUserEducation(userId, payload, token)
        .then((res) => {
          const { success, message } = res.data;
          if (success) {
            setSubmitting(false);
            toast.success(message);
            setRefresh(!isRefresh);
            handleEducationModalClose();
          }
        })
        .catch((error) => {
          toast.error("Something went Wrong");
          handleEducationModalClose();
        });
    }
  }

  // for user certification add update
  function handleCertificationUpdate(certification: CertificationsType) {
    setEdit(true);
    const value = {
      title: certification.title,
      startDate: dayjs(certification.startDate),
      endDate: dayjs(certification.endDate),
      organizationName: certification.certificationName,
      type: certification.type,
      id: certification.id,
    };
    setInitialCertificationValue(value);
    setCertificationModalOpen(true);
  }

  function handleAddUpdateCertification(
    values: UserCertificationType,
    setSubmitting: (isSubmitting: boolean) => void
  ) {
    if (isEdit) {
      const payload = {
        id: values.id,
        title: values.title,
        startDate: dayjs(values.startDate),
        endDate: dayjs(values.endDate),
        certificationName: values.organizationName, // remove this line later
        // organizationName:values.organizationName,
        type: values.type,
      };
      // updateUserCertification()   // replace comment with updating certification logic
    } else {
      const payload = {
        title: values.title,
        startDate: dayjs(values.startDate),
        endDate: dayjs(values.endDate),
        certificationName: values.organizationName, // remove this line later
        // organizationName:values.organizationName,
        type: values.type,
      };
      addUpdateUserCertification(userId, payload, token)
        .then((res) => {
          const { success, message } = res.data;
          if (success) {
            toast.success(message);
            setSubmitting(false);
            handleCertificationModalClose();
            setRefresh(!isRefresh);
          }
        })
        .catch((error) => {
          toast.error("Failed to add certification");
          handleCertificationModalClose();
        });
    }
  }

  function handleCertificationModalClose() {
    setCertificationModalOpen(false);
    setInitialCertificationValue(initialCertificationValues);
    setEdit(false);
  }

  function deleteCertification(certificationId: string) {
    setConfirmationModal(true);
  }

  function handleUpdateSummary() {
    addUpdateUserSummary(userId, { summary: summary.current }, token)
      .then((res) => {
        const { success, message, methodResult } = res.data;
        if (success) {
          toast.success("Summary Updated");
          setRefresh(!isRefresh);
          // userData?.setUserDetails(methodResult)
        }
      })
      .catch((error) => {
        toast.error("Failed To Update Summary");
      });
    summary.current = "";
  }
  return (
    <>
      <Grid container display={"flex"} gap={2} mt={1}>
        <Grid item sm={12}>
          <Card sx={{ p: 2 }}>
            <Stack
              direction="row"
              display={"flex"}
              justifyContent={"space-between"}
            >
              <Typography variant="h5">
                {intl.formatMessage({ id: "INFO.SUMMARY" })}
              </Typography>
              {isSummaryEdit ? (
                <CustomisedButton
                  label="Update"
                  variant="contained"
                  handleClick={handleUpdateSummary}
                  Icon={<Check />}
                  // disabled={summary.current.length===0}
                />
              ) : (
                <CustomIconButton
                  icon={<Edit />}
                  handleClick={() => setSummaryEdit(true)}
                />
              )}
            </Stack>
            {isSummaryEdit ? (
              <TextField
                sx={{ mt: 1 }}
                fullWidth
                multiline
                id="user_summary"
                placeholder="Type..."
                variant="outlined"
                onChange={(e) => (summary.current = e.target.value)}
              />
            ) : (
              <Typography variant="body1">
                {currentUser?.summary || "Add Your Summary"}
              </Typography>
            )}
          </Card>
        </Grid>
        <Grid item sm={12}>
          <Card sx={{ p: 2 }}>
            <Stack
              direction="row"
              display={"flex"}
              justifyContent={"space-between"}
              mb={1}
            >
              <Typography variant="h5">
                {intl.formatMessage({ id: "PROFILE.PI" })}
              </Typography>
              <CustomIconButton
                icon={<Edit />}
                handleClick={() => setUserUpdateModalOpen(true)}
              />

              {isUserModalOpen && (
                <UpdateUserInfo
                  open={isUserModalOpen}
                  setOpen={setUserUpdateModalOpen}
                />
              )}
            </Stack>
            <Grid container>
              <Grid item xs={12}>
                <Typography variant="body2">
                  {intl.formatMessage({ id: "USER.ADDRESS" })}
                </Typography>
                <Typography>{currentUser?.address || "NA"} </Typography>
              </Grid>

              <Grid container spacing={4}>
                <Grid item xs={6}>
                  <Typography variant="body2">
                    {intl.formatMessage({ id: "AUTH.INPUT.EMAIL" })}
                  </Typography>
                  <Typography variant="body1">
                    {currentUser?.email || "NA"}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2">
                    {intl.formatMessage({ id: "USER.PHONE" })}
                  </Typography>
                  <Typography variant="body1">
                    {currentUser?.phoneNumber || "NA"}
                  </Typography>
                </Grid>
              </Grid>
              <Grid container spacing={4}>
                <Grid item xs={6}>
                  <Typography variant="body2">
                    {intl.formatMessage({ id: "USER.DOB" })}
                  </Typography>
                  <Typography>
                    {dateFormatter(currentUser?.dateOfBirth!, "DD MMMM YYYY")}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2">
                    {intl.formatMessage({ id: "USER.GENDER" })}
                  </Typography>
                  <Typography>{currentUser?.gender}</Typography>
                </Grid>
              </Grid>
              <Grid container spacing={4}>
                <Grid item xs={6}>
                  <Typography variant="body2">
                    {intl.formatMessage({ id: "TRANSLATOR.LANGUAGES" })}
                  </Typography>
                  <Typography>{currentUser?.languagesKnown || "NA"}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2">
                    {intl.formatMessage({ id: "USER.DOJ" })}
                  </Typography>
                  <Typography>
                    {dateFormatter(currentUser?.dateOfJoining!, "DD MMMM YYYY")}
                  </Typography>
                </Grid>
              </Grid>
              <Grid container spacing={4}>
                <Grid item xs={6}>
                  <Typography variant="body2">
                    {intl.formatMessage({ id: "USER.EMP_ID" })}
                  </Typography>
                  <Typography>{currentUser?.employeeId}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2">
                    {intl.formatMessage({ id: "USER.DEPARTMENT" })}
                  </Typography>
                  <Typography>{currentUser?.department || "NA"}</Typography>
                </Grid>
              </Grid>
              <Grid container spacing={4}>
                <Grid item xs={6}>
                  <Typography variant="body2">
                    {intl.formatMessage({ id: "USER.REPORTING_MANAGER" })}
                  </Typography>
                  <Typography>
                    {currentUser?.reportingManager || "NA"}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2">
                    {intl.formatMessage({ id: "USER.TEAM_LEAD" })}
                  </Typography>
                  <Typography>{currentUser?.teamLead || "NA"}</Typography>
                </Grid>
              </Grid>
              <Grid container spacing={4}>
                <Grid item xs={6}>
                  <Typography variant="body2">
                    {intl.formatMessage({ id: "USER.PERSONAL_EMAIL" })}
                  </Typography>
                  <Typography>{currentUser?.personalEmail || "NA"}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2">
                    {intl.formatMessage({ id: "USER.EMERGENCY_CONTACT" })}
                  </Typography>
                  <Typography>
                    {currentUser?.emergencyContact || "NA"}
                  </Typography>
                </Grid>
              </Grid>
              <Grid container spacing={4}>
                <Grid item xs={6}>
                  <Typography variant="body2">
                    {intl.formatMessage({ id: "USER.BLOOD_GROUP" })}
                  </Typography>
                  <Typography>{currentUser?.bloodGroup || "NA"}</Typography>
                </Grid>
              </Grid>
            </Grid>
          </Card>
        </Grid>
        <Grid item sm={12}>
          <Card sx={{ p: 2 }}>
            <Stack
              direction="row"
              display={"flex"}
              justifyContent={"space-between"}
              mb={1}
            >
              <Typography variant="h5">
                {intl.formatMessage({ id: "PROFILE.SKILLS" })}
              </Typography>
              <IconButton onClick={() => setSkillsModalOpen(true)}>
                <Add />
              </IconButton>
              {isSkillsModalOpen && (
                <AddUpdateSkills
                  skills={skills}
                  open={isSkillsModalOpen}
                  setOpen={setSkillsModalOpen}
                />
              )}
            </Stack>

            <Stack
              direction="row"
              gap={1}
              className="skills-chips"
              flexWrap={"wrap"}
            >
              {skills?.length === 0 ? (
                <Typography variant="body2">
                  {intl.formatMessage({ id: "ADD.SKILLS" })}
                </Typography>
              ) : (
                skills?.map((skill, index) => (
                  <Chip key={index} label={skill} />
                ))
              )}
            </Stack>
          </Card>
        </Grid>
        <Grid item sm={12}>
          <Card sx={{ p: 4 }}>
            <Stack
              direction="row"
              display={"flex"}
              justifyContent={"space-between"}
              mb={1}
            >
              <Typography variant="h5">
                {intl.formatMessage({ id: "PROFILE.EDUCATION" })}
              </Typography>
              <IconButton onClick={() => setEducationModalOpen(true)}>
                <Add />
              </IconButton>
            </Stack>
            <Stack spacing={2}>
              {educations.length === 0 ? (
                <Typography variant="body2">
                  {intl.formatMessage({ id: "ADD.EDUCATION" })}
                </Typography>
              ) : (
                educations.map((education) => (
                  <Stack
                    key={education.id}
                    direction="row"
                    justifyContent={"space-between"}
                    alignItems={"center"}
                  >
                    <Stack direction="row" alignItems={"center"}>
                      <School sx={{ marginInlineEnd: 1 }} />
                      <Stack>
                        <Typography
                          variant="body1"
                          className="text-gray-800 text-hover-primary fw-semibold "
                        >
                          {education.title}
                        </Typography>
                        <Stack direction="row" spacing={1}>
                          <Typography
                            variant="body2"
                            className="fw-semibold d-block "
                          >
                            {education.collegeName}
                          </Typography>
                          <Typography
                            variant="body2"
                            className="text-muted fw-semibold d-block "
                          >
                            <CalendarMonth sx={{ height: "14px" }} />
                            {dateFormatter(
                              education.startDate,
                              "MMM YYYY"
                            )} - {dateFormatter(education.endDate, "MMM YYYY")}
                          </Typography>
                        </Stack>
                      </Stack>
                    </Stack>
                    <Stack direction="row" spacing={1}>
                      <CustomIconButton
                        icon={<Edit />}
                        tooltip="Edit"
                        handleClick={() => handleEducationUpdate(education)}
                      />

                      <CustomIconButton
                        icon={<DeleteOutline />}
                        tooltip="Delete"
                      />
                    </Stack>
                  </Stack>
                ))
              )}
            </Stack>
          </Card>
        </Grid>

        <Grid item sm={12}>
          <Card sx={{ p: 2 }}>
            <Stack
              direction="row"
              display={"flex"}
              justifyContent={"space-between"}
              mb={1}
            >
              <Typography variant="h5">
                {intl.formatMessage({ id: "PROFILE.CERTIFICATION" })}
              </Typography>
              <IconButton onClick={() => setCertificationModalOpen(true)}>
                <Add />
              </IconButton>
            </Stack>

            <Stack spacing={2}>
              {certifications.length === 0 ? (
                <Typography variant="body2">
                  {intl.formatMessage({ id: "ADD.CERTIFICATION" })}
                </Typography>
              ) : (
                certifications.map((certification) => (
                  <Stack
                    key={certification.id}
                    direction="row"
                    display={"flex"}
                    justifyContent={"space-between"}
                    alignItems={"center"}
                  >
                    <Stack direction="row" alignItems={"center"}>
                      <School sx={{ marginInlineEnd: 4 }} />
                      <Stack>
                        <Typography
                          variant="body1"
                          className=" text-hover-primary "
                          fontWeight={500}
                          color={colors.alpha.neutral[800]}
                        >
                          {certification.title}
                        </Typography>
                        <Stack direction="row" spacing={1}>
                          <Typography
                            variant="body2"
                            display={"block"}
                            fontWeight={500}
                          >
                            {certification.certificationName},
                            {certification.type}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{ display: "block" }}
                            fontWeight={500}
                          >
                            <CalendarMonth sx={{ height: "14px" }} />
                            {dateFormatter(
                              dayjs(certification.startDate),
                              "MMM YYYY"
                            )}
                            -{" "}
                            {dateFormatter(
                              dayjs(certification.endDate),
                              "MMM YYYY"
                            )}
                          </Typography>
                        </Stack>
                      </Stack>
                    </Stack>
                    <Stack direction="row" spacing={1}>
                      <IconButton
                        onClick={() => handleCertificationUpdate(certification)}
                      >
                        <Edit />
                      </IconButton>
                      <IconButton>
                        <DeleteOutline
                          onClick={() => deleteCertification(certification.id)}
                        />
                      </IconButton>
                    </Stack>
                  </Stack>
                ))
              )}
            </Stack>
          </Card>
        </Grid>
      </Grid>

      {isEducationModalOpen && (
        <AddUpdateEducation
          open={isEducationModalOpen}
          initialValues={initialEducationValue}
          handleAddUpdateEducation={handleAddUpdateEducation}
          handleClose={handleEducationModalClose}
        />
      )}
      {isCertificationModalOpen && (
        <AddUpdateCertification
          open={isCertificationModalOpen}
          initialValues={initialCertificationValue}
          handleClose={handleCertificationModalClose}
          handleAddUpdateCertification={handleAddUpdateCertification}
        />
      )}
      <ConfirmationModal
        open={openConfirmationModal}
        handleClose={() => setConfirmationModal(false)}
        title="Delete Item"
        handleConfirmation={() => console.log("Delelte")}
        content="Are You SUre"
      />
    </>
  );
}
