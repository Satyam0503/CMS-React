import { Send } from "@mui/icons-material";
import { Grid, MenuItem, Stack, Typography } from "@mui/material";
import { FC } from "react";
import { useIntl } from "react-intl";
import { CustomisedModal } from "../../modules/components/CustomisedModal";
import CustomisedButton from "../../modules/components/CustomisedButton";
import { NoticeModel } from "../../../utils/common_types";
import { Formik } from "formik";
import { SelectInput } from "../components/form_component/SelectInput";
import { NoticeTypes } from "../../../utils/constant/Constant";
import { TextInput } from "../components/form_component/TextInput";
import noticeSchema from "../../../utils/Schema/noticeSchema";

interface PropsTypes {
  initialValues: NoticeModel;
  open: boolean;
  handleClose: () => void;
  isEdit: boolean;
  handleAddEditNotice: (
    values: NoticeModel,
    setSubmitting: (isSubmitting: boolean) => void
  ) => void;
}

export const AddNotice: FC<PropsTypes> = ({
  open,
  isEdit,
  handleClose,
  handleAddEditNotice,
  initialValues,
}) => {
  const intl = useIntl();
  return (
    <CustomisedModal open={open} handleClose={handleClose}>
      <Formik
        initialValues={initialValues}
        validationSchema={noticeSchema}
        onSubmit={(values, { setSubmitting }) => {
          handleAddEditNotice(values, setSubmitting);
        }}
      >
        {({ isValid, dirty, isSubmitting, handleSubmit }) => (
          <form onSubmit={handleSubmit}>
            <Typography variant="h5" mb={2}>
              {isEdit
                ? intl.formatMessage({ id: "MENU.NOTICE_EDIT" })
                : intl.formatMessage({ id: "MENU.POST_NOTICE" })}
            </Typography>
            <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2 }}>
              <Grid item xs={12} md={6}>
                <SelectInput
                  label={intl.formatMessage({ id: "FORM.TYPE" })}
                  name="type"
                >
                  {NoticeTypes.map((notice) => (
                    <MenuItem key={notice.id} value={notice.value}>
                      {notice.label}
                    </MenuItem>
                  ))}
                </SelectInput>
              </Grid>
              <Grid item xs={12} md={6}>
                <SelectInput
                  label={intl.formatMessage({ id: "USER.TARGET" })}
                  name="target"
                >
                  {NoticeTypes.map((notice) => (
                    <MenuItem key={notice.id} value={notice.value}>
                      {notice.label}
                    </MenuItem>
                  ))}
                </SelectInput>
              </Grid>

              <Grid item xs={12}>
                <SelectInput
                  label={intl.formatMessage({ id: "USER.GROUP" })}
                  name="group"
                >
                  {NoticeTypes.map((notice) => (
                    <MenuItem key={notice.id} value={notice.value}>
                      {notice.label}
                    </MenuItem>
                  ))}
                </SelectInput>
              </Grid>
              <Grid item xs={12}>
                <TextInput
                  multiline={true}
                  label={intl.formatMessage({ id: "MENU.MESSAGE" })}
                  name="message"
                  placeholder="Message"
                  type="text"
                />
              </Grid>
            </Grid>
            <Stack direction={"row"} spacing={1} justifyContent={"end"} mt={2}>
              <CustomisedButton
                label="Cancel"
                handleClick={handleClose}
                variant="outlined"
              />
              <CustomisedButton
                disabled={isSubmitting || !(isValid && dirty)}
                label={isEdit ? "Update" : "Publish"}
                type="submit"
                Icon={<Send />}
              />
            </Stack>
          </form>
        )}
      </Formik>
    </CustomisedModal>
  );
};
