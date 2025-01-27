import { Card, Stack, Typography } from "@mui/material";
import { CustomIconButton } from "../../../components/CustomIconButton";
import {
  Add,
  CalendarMonth,
  DeleteOutline,
  Edit,
  School,
} from "@mui/icons-material";
import { UserEducationModel } from "../../../../../utils/common_types";
import { FC, useState } from "react";
import { useIntl } from "react-intl";
import { dateFormatter } from "../../../../../utils/common";
import AddUpdateEducation from "./AddUpdateEducation";
import dayjs from "dayjs";
import { useAppSelector } from "../../../../Redux/hooks";
import { addEmployeeEducation } from "../../userservices";
import { toast } from "react-toastify";

interface PropsType {
  userEducations: UserEducationModel[];
}

const initialValue: UserEducationModel = {
  educationId: "",
  userId: "",
  educationTitle: "",
  collegeName: "",
  startDate: null,
  endDate: null,
  type: "",
};
export const UserEducation: FC<PropsType> = ({ userEducations }) => {
  const intl = useIntl();
//   const [educations, setEducations] =useState<UserEducationModel[]>(userEducations);
  const [educationInitialValues, setEducationInitialValues] =useState(initialValue);
  const [isEdit, setEdit] = useState(false);
  const [open, setOpen] = useState(false);
  const token = useAppSelector((state) => state.auth.token)!;

  const handleClose = () => {
    setEducationInitialValues(initialValue);
    setOpen(false);
    setEdit(false);
  };

  function handleEducationUpdate(education: UserEducationModel) {
    setEdit(true);
    const value = {
      userId: education.userId,
      educationTitle: education.educationTitle,
      startDate: education.startDate,
      endDate: education.endDate,
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
        const response = await addEmployeeEducation(payload, token);
        const { success, message } = response.data;
        if (!success) {
          throw new Error(message);
        }
        setSubmitting(false);
        toast.success(message);
        handleClose();
      } catch (error: any) {
        toast.error(error.message);
      }
    }
  };
  return (
    <Card sx={{ p: 2 }}>
      <Stack
        direction="row"
        display={"flex"}
        justifyContent={"space-between"}
        mb={1}
      >
        <Typography variant="h5">
          {intl.formatMessage({ id: "PROFILE.EDUCATION" })}
        </Typography>
        <CustomIconButton icon={<Add />} handleClick={() => setOpen(true)} />
      </Stack>
      <Stack spacing={2}>
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
            >
              <Stack direction="row" alignItems={"center"}>
                <School sx={{ marginInlineEnd: 1 }} />
                <Stack>
                  <Typography variant="body1" fontWeight={500}>
                    {education.educationTitle}
                  </Typography>
                  <Stack direction="row" spacing={1}>
                    <Typography
                      variant="body2"
                      display={"block"}
                      fontWeight={600}
                    >
                      {education.collegeName}
                    </Typography>
                    <Typography variant="body2" display={"block"}>
                      <CalendarMonth sx={{ height: ".75rem" }} />
                      {dateFormatter(education.startDate, "MMM YYYY")} -{" "}
                      {dateFormatter(education.endDate, "MMM YYYY")}
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
                <CustomIconButton icon={<DeleteOutline />} tooltip="Delete" />
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
    </Card>
  );
};
