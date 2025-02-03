import { Card, Stack, Typography } from "@mui/material";
import { CustomIconButton } from "../../../components/CustomIconButton";
import {
  Add,
  CalendarToday,
  DeleteOutline,
  Edit,
  School,
  Visibility,
} from "@mui/icons-material";
import { UserEducationModel } from "../../../../../utils/common_types";
import { useEffect, useState } from "react";
import { useIntl } from "react-intl";
import { dateFormatter } from "../../../../../utils/common";
import AddUpdateEducation from "./AddUpdateEducation";
import {
  addEmployeeEducation,
  getEmployeeEducations,
} from "../../userservices";
import { toast } from "react-toastify";
import { colors } from "../../../theme/MuiTheme";
import dayjs from "dayjs";
import { ConfirmationModal } from "../../../components/ConfirmationModal";

const initialValue: UserEducationModel = {
  educationId: "",
  userId: "",
  educationTitle: "",
  collegeName: "",
  startDate: null,
  endDate: null,
  type: "",
};
export const UserEducation = () => {
  const intl = useIntl();
  const [userEducations, setUserEducations] = useState<UserEducationModel[]>(
    []
  );
  const [educationInitialValues, setEducationInitialValues] =
    useState(initialValue);
  const [isEdit, setEdit] = useState(false);
  const [open, setOpen] = useState(false);
  const [confirmModal, setConfirmModal] = useState(false);
  const [selectedEducation, setSeletedEducation] =
    useState<UserEducationModel | null>(null);
  const [refresh, setRefresh] = useState(false);

  const handleClose = () => {
    setEducationInitialValues(initialValue);
    setOpen(false);
    setEdit(false);
  };

  const handleCloseConfirmation = () => {
    setConfirmModal(false);
    setSeletedEducation(null);
  };

  function handleEducationEdit(education: UserEducationModel) {
    setEdit(true);
    const value = {
      userId: education.userId,
      educationTitle: education.educationTitle,
      startDate: dayjs(education.startDate),
      endDate: dayjs(education.endDate),
      type: education.type,
      collegeName: education.collegeName,
      educationId: education.educationId,
    };
    setEducationInitialValues(value);
    setOpen(true);
  }

  const handleAddUpdateEducation = async (
    values: UserEducationModel,
    setSubmitting: (isSubmitting: boolean) => void
  ) => {
    if (isEdit) {
      //   updateUserEducation(); //  handle user education update.
    } else {
      try {
        const payload = {
          ...values,
        };
        const response = await addEmployeeEducation(payload);
        const { success, message } = response.data;
        if (!success) {
          throw new Error(message);
        }
        toast.success(message);
        setRefresh(!refresh);
        handleClose();
      } catch (error: any) {
        toast.error(error.message);
      } finally {
        setSubmitting(false);
      }
    }
  };

  const handleDeleteEducation = (confirmation: String) => {
    if (!selectedEducation) {
      toast.error("Request Failed");
    }
    // logic for deleting education
  };

  useEffect(() => {
    getEmployeeEducations()
      .then((response) => {
        const { success, message, methodResults } = response.data;
        if (!success) {
          throw new Error(message);
        }
        setUserEducations(methodResults);
      })
      .catch((error) => {
        toast.error(error.message);
      });
  }, [refresh]);

  return (
    <Card sx={{ p: 2 }}>
      <Stack
        direction="row"
        display={"flex"}
        justifyContent={"space-between"}
        mb={2}
      >
        <Typography variant="h5">
          {intl.formatMessage({ id: "PROFILE.EDUCATION" })}
        </Typography>
        <CustomIconButton
          tooltip="Add"
          icon={<Add />}
          handleClick={() => setOpen(true)}
        />
      </Stack>
      <Stack spacing={{ xs: 0.5, sm: 1 }}>
        {userEducations.length === 0 ? (
          <Typography variant="body2">
            {intl.formatMessage({ id: "ADD.EDUCATION" })}
          </Typography>
        ) : (
          userEducations.map((education, index) => (
            <Stack
              key={education.educationId || index}
              direction="row"
              justifyContent={"space-between"}
              alignItems={"center"}
              spacing={1}
              sx={{
                "&:hover .MuiStack-root": {
                  visibility: "visible",
                },
              }}
            >
              <Stack direction="row" alignItems={"center"} spacing={1}>
                <Stack
                  color={colors.alpha.primary[500]}
                  sx={{
                    width: 48,
                    height: 48,
                    bgcolor: colors.alpha.primary[100],
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: 1,
                  }}
                >
                  <School />
                </Stack>
                <Stack>
                  <Typography
                    variant="body1"
                    fontWeight={500}
                    flexWrap={"wrap"}
                  >
                    {education.educationTitle}
                  </Typography>
                  <Stack direction={{ sx: "column", sm: "row" }} spacing={1}>
                    <Stack>
                      <Typography
                        variant="caption"
                        display={"block"}
                        fontWeight={600}
                      >
                        {education.collegeName}
                      </Typography>
                    </Stack>
                    <Stack>
                      <Typography variant="body2">
                        <CalendarToday
                          sx={{
                            height: "1rem",
                            width: "inherit",
                            mb: 0.5,
                            mr: 0.5,
                          }}
                        />
                        {dateFormatter(education.startDate, "MMM YYYY")} -{" "}
                        {dateFormatter(education.endDate, "MMM YYYY")}
                      </Typography>
                    </Stack>
                  </Stack>
                </Stack>
              </Stack>
              <Stack
                direction={{ sx: "column", sm: "row" }}
                spacing={1}
                rowGap={0.5}
                visibility={"hidden"}
                // className="action-buttons"
                sx={{
                  visibility: "hidden",
                  transition: "visibility 0.3s ease-in-out",
                }}
              >
                <CustomIconButton
                  icon={<Edit />}
                  tooltip="Edit"
                  handleClick={() => handleEducationEdit(education)}
                />
                <CustomIconButton
                  icon={<DeleteOutline />}
                  tooltip="Delete"
                  handleClick={() => {
                    setSeletedEducation(education);
                    setConfirmModal(true);
                  }}
                />
              </Stack>
            </Stack>
          ))
        )}
      </Stack>
      {open && (
        <AddUpdateEducation
          isEdit={isEdit}
          initialValues={educationInitialValues}
          open={open}
          handleAddUpdateEducation={handleAddUpdateEducation}
          handleClose={handleClose}
        />
      )}
      {confirmModal && (
        <ConfirmationModal
          title="Delete Education"
          content="Are you sure you want to delete this Education ?"
          open={confirmModal}
          handleClose={handleCloseConfirmation}
          handleConfirmation={handleDeleteEducation}
        />
      )}
    </Card>
  );
};
