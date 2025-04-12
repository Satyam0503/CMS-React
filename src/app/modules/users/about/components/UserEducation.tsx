import { Card, Stack, Typography } from "@mui/material";
import { CustomIconButton } from "../../../../shared/components/CustomIconButton";
import {
  Add,
  CalendarToday,
  DeleteOutline,
  Edit,
  School,
} from "@mui/icons-material";
import { UserEducationModel } from "../../../../../utils/common_types";
import { useEffect, useState } from "react";
import { useIntl } from "react-intl";
import { dateFormatter } from "../../../../../utils/common";
import AddUpdateEducation from "./AddUpdateEducation";
import {
  addEmployeeEducation,
  deleteEmployeeEducation,
  getEmployeeEducations,
  updateEmployeeEducation,
} from "../../userservices";
import { toast } from "react-toastify";
import { colors } from "../../../theme/MuiTheme";
import { AxiosError } from "axios";
import { ConfirmationModal } from "../../../../shared/components/ConfirmationModal";
import { useParams } from "react-router-dom";

const initialValue: UserEducationModel = {
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
  const [isConfirmModal, setConfirmModalOpen] = useState(false);
  const [selectedEducationId, setSeletedEducationId] = useState<
    string | undefined
  >();
  const [refresh, setRefresh] = useState(false);
  const {employeeid}= useParams();

  const handleClose = () => {
    setEducationInitialValues(initialValue);
    setOpen(false);
    setEdit(false);
  };

  const handleCloseConfirmation = () => {
    setSeletedEducationId(undefined);
    setConfirmModalOpen(false);
  };

  function handleEducationEdit(education: UserEducationModel) {
    setEdit(true);
    setEducationInitialValues({ ...education });
    setOpen(true);
  }

  const handleAddUpdateEducation = async (
    values: UserEducationModel,
    setSubmitting: (isSubmitting: boolean) => void
  ) => {
    try {
      if (isEdit) {
        const response = await updateEmployeeEducation(values);
        const { success, message } = response.data;
        if (success) {
          toast.success(message);
          setRefresh(!refresh);
        }
      } else {
        const response = await addEmployeeEducation(values);
        const { success, message } = response.data;
        if (!success) {
          throw new Error(message);
        }
        toast.success(message);
        setRefresh(!refresh);
      }
    } catch (error) {
      toast.error((error as AxiosError).message);
    } finally {
      setSubmitting(false);
      handleClose();
    }
  };

  const handleDeleteEducation = async () => {
    if (selectedEducationId) {
      try {
        const response = await deleteEmployeeEducation(selectedEducationId);
        const { success, message } = response.data;
        if (success) {
          toast.success(message);
          handleCloseConfirmation();
          setRefresh(!refresh);
        }
      } catch (error) {
        console.error((error as AxiosError).message);
      }
    }
  };

  useEffect(() => {
    getEmployeeEducations(employeeid?? "")
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
          userEducations.map((education) => (
            <Stack
              key={education.educationId}
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
                  <Stack
                    direction={{ sx: "column", sm: "row" }}
                    spacing={1}
                    alignItems={{ sm: "flex-end" }}
                  >
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
                    setSeletedEducationId(education.educationId);
                    setConfirmModalOpen(true);
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
      {isConfirmModal && (
        <ConfirmationModal
          title="Delete Education"
          content="Are you sure you want to delete this Education ?"
          open={isConfirmModal}
          handleClose={handleCloseConfirmation}
          handleConfirmation={handleDeleteEducation}
        />
      )}
    </Card>
  );
};
