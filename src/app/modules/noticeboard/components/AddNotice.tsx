import { Send } from "@mui/icons-material";
import { Grid, MenuItem, Stack, Typography } from "@mui/material";
import { FC, useEffect, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { CustomisedModal } from "../../../shared/components/CustomisedModal";
import CustomisedButton from "../../../shared/components/CustomisedButton";
import { Formik } from "formik";
import { SelectInput } from "../../../shared/components/form-component/SelectInput";
import { NoticeTypes } from "../../../../utils/constant/Constant";
import { TextInput } from "../../../shared/components/form-component/TextInput";
import { NoticeModel } from "../models";
import { noticeValidationSchema } from "../../../../utils/Schema/noticeValidationSchema";
import { getAllDepartments, getAllRoles } from "../../admin/adminservices";
import { DepartmentModel, RoleModel } from "../../admin/models";
import { postNotice, updateNotice } from "../services";
import { toast } from "react-toastify";
import { useLang } from "../../../../_themes/i18n/Metronici18n";
import TextEditor from "../../../shared/components/TextEditor";


interface PropsTypes {
  open: boolean;
  handleClose: () => void;
  isEdit: boolean;
  initialValues: NoticeModel;
  refresh: () => void;
}

export const AddNotice: FC<PropsTypes> = ({
  open,
  isEdit,
  handleClose,
  refresh,
  initialValues
}) => {
  const { formatMessage } = useIntl();
  const [roleList, setRoleList] = useState<RoleModel[]>([]);
  const [departmentList, setDepartmentList] = useState<DepartmentModel[]>([]);
  const currentLanguage = useLang();


  useEffect(() => {
    (async () => {
      const { data } = await getAllRoles(true);
      if (data.success) {
        setRoleList(data.methodResults);
      }
    })();
  }, [])

  useEffect(() => {
    (async () => {
      const { data } = await getAllDepartments(true);
      if (data.success) {
        setDepartmentList(data.methodResults);
      }
    })();
  }, [])

  const handleAddUpdateNotice = async (value: NoticeModel, setSubmitting: (isSubmitting: boolean) => void) => {
    try {
      if (isEdit) {
        const { data } = await updateNotice(value);
        if (!data.success) {
          toast.error(formatMessage({ id: "Toast.UpdateNoticeFailed" }));
        }
        else {
          toast.success(formatMessage({ id: "Toast.UpdateNoticeSuccess" }));
          handleClose();
          refresh();
        }
      } else {
        const { data } = await postNotice(value);
        if (!data.success) {
          toast.error(formatMessage({ id: "Toast.PostNoticeFailed" }));
        }
        else {
          toast.success(formatMessage({ id: "Toast.PostNoticeSuccess" }));
          handleClose();
          refresh();
        }
      }
    } catch (error) {
      console.log(error);
    }
    finally {
      setSubmitting(false);
    }
  }

  return (
    <CustomisedModal open={open} handleClose={handleClose}>
      <Formik
        initialValues={initialValues}
        validationSchema={noticeValidationSchema}
        onSubmit={(values, { setSubmitting }) => {
          handleAddUpdateNotice(values, setSubmitting);
        }}
      >
        {({ values, isValid, dirty, isSubmitting, handleSubmit, setFieldValue }) => (
          <form onSubmit={handleSubmit}>
            <Typography variant="h5" mb={2}>
              {isEdit
                ? formatMessage({ id: "EDIT_NOTICE" })
                : formatMessage({ id: "POST_NOTICE" })}
            </Typography>
            <Grid container rowSpacing={2} columnSpacing={{ xs: 1, sm: 2 }}>
              <Grid item xs={12} sm={6}>
                <SelectInput
                  label={formatMessage({ id: "NOTICE_TYPE" })}
                  name="noticeType"
                  required={true}
                >
                  {NoticeTypes.map((notice) => (
                    <MenuItem key={notice.id} value={notice.value}>{formatMessage({ id: notice.label })}</MenuItem>
                  ))}
                </SelectInput>
              </Grid>
              <Grid item xs={12} sm={6}>
                <SelectInput
                  label={formatMessage({ id: "ROLE" })}
                  name="target"
                  required={true}
                >
                  <MenuItem value={"all"}>{formatMessage({ id: "NOTICE_TYPE.ALL" })}</MenuItem>
                  {roleList.map(role => (
                    <MenuItem key={role.rolesId} value={role.rolesId}>{role.titles}</MenuItem>
                  ))}
                </SelectInput>
              </Grid>
              <Grid item xs={12} >
                <SelectInput
                  label={formatMessage({ id: "DEPARTMENT" })}
                  name="departments"
                  required={true}
                >
                  <MenuItem value={"all"}>{formatMessage({ id: "NOTICE_TYPE.ALL" })}</MenuItem>
                  {departmentList.map((dep) => (
                    <MenuItem
                      key={dep.departmentId}
                      value={dep.departmentId}
                    >
                      {dep.titles.find(title => title.language === currentLanguage)?.label ?? <FormattedMessage id={"TRANSLATION_MISSING"} />}
                    </MenuItem>
                  ))}
                </SelectInput>
              </Grid>

              <Grid item xs={12}>
                <TextInput
                  multiline={true}
                  label={formatMessage({ id: "NOTICE_TITLE" })}
                  name="title"
                  placeholder={formatMessage({ id: "NOTICE_TITLE" })}
                  type="text"
                />
              </Grid>
              <Grid item xs={12}>
                <TextEditor value={values.message} setValue={(value: string) => {
                  setFieldValue("message", value);
                }} placeholder="NOTICE_MESSAGE" />
              </Grid>
            </Grid>
            <Stack direction={"row"} spacing={1} justifyContent={"end"} mt={2}>
              <CustomisedButton
                label={formatMessage({ id: "BUTTON.CANCEL" })}
                handleClick={handleClose}
                variant="outlined"
              />
              <CustomisedButton
                loading={isSubmitting}
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
