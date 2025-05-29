import { Send } from "@mui/icons-material";
import { Grid, MenuItem, Stack, Typography } from "@mui/material";
import { FC } from "react";
import { useIntl } from "react-intl";
import { CustomisedModal } from "../../../shared/components/CustomisedModal";
import CustomisedButton from "../../../shared/components/CustomisedButton";
import { NoticeModel } from "../../../../utils/common_types";
import { Formik } from "formik";
import { SelectInput } from "../../../shared/components/form-component/SelectInput";
import { NoticeTypes } from "../../../../utils/constant/Constant";
import { TextInput } from "../../../shared/components/form-component/TextInput";
import noticeSchema from "../../../../utils/Schema/noticeSchema";

const initialValues = {

}

interface PropsTypes {
  // initialValues: NoticeModel;
  open: boolean;
  handleClose: () => void;
  isEdit: boolean;
  // handleAddEditNotice: (
  //   values: NoticeModel,
  //   setSubmitting: (isSubmitting: boolean) => void
  // ) => void;
}

export const AddNotice: FC<PropsTypes> = ({
  open,
  isEdit,
  handleClose,
  // initialValues,
}) => {
  const { formatMessage } = useIntl();
  return (
    <CustomisedModal open={open} handleClose={handleClose}>
      <Formik
        initialValues={initialValues}
        validationSchema={noticeSchema}
        onSubmit={(values, { setSubmitting }) => {
          // handleAddEditNotice(values, setSubmitting);
        }}
      >
        {({ isValid, dirty, isSubmitting, handleSubmit }) => (
          <form onSubmit={handleSubmit}>
            <Typography variant="h5" mb={2}>
              {isEdit
                ? formatMessage({ id: "NOTICE.EDIT_NOTICE" })
                : formatMessage({ id: "NOTICE.POST_NOTICE" })}
            </Typography>
            <Grid container rowSpacing={2} columnSpacing={{ xs: 1, sm: 2 }}>
              <Grid item xs={12} md={6}>
                <SelectInput
                  label={formatMessage({ id: "FORM.TYPE" })}
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
                  label={formatMessage({ id: "USER.TARGET" })}
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
                  label={formatMessage({ id: "USER.GROUP" })}
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
                  label={formatMessage({ id: "MENU.MESSAGE" })}
                  name="message"
                  placeholder="Message"
                  type="text"
                />
              </Grid>
            </Grid>
            <Stack direction={"row"} spacing={1} justifyContent={"end"} mt={2}>
              <CustomisedButton
                label={formatMessage({ id: "BUTTON.CANCEL" })}
                handleClick={handleClose}
                variant="outlined"
              />
              <CustomisedButton
                disabled={isSubmitting || !(isValid && dirty)}
                label={isEdit ? formatMessage({ id: "BUTTON.UPDATE" }) : formatMessage({ id: "BUTTON.PUBLISH" })}
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
