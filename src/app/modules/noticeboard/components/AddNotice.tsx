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
import TextEditor from "../../../shared/components/TextEditor";
import { useAppLang } from "../../../../_themes/i18n/Metronici18n";
import { useAppSelector } from "../../../Redux/hooks";


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
  const { currentLanguage } = useAppLang();
  const defaultLang = useAppSelector(state => state.user.userData?.defaultLanguage!);

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
          toast.error(formatMessage({ id: "TOAST.FAILED.NOTICE_UPDATE" }));
        }
        else {
          toast.success(formatMessage({ id: "TOAST.SUCCESS.NOTICE_UPDATE" }));
          handleClose();
          refresh();
        }
      } else {
        const { data } = await postNotice(value);
        if (!data.success) {
          toast.error(formatMessage({ id: "TOAST.FAILED.NOTICE_POST" }));
        }
        else {
          toast.success(formatMessage({ id: "TOAST.SUCCESS.NOTICE_POST" }));
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
    <CustomisedModal open={open} handleClose={handleClose}

      title={isEdit
        ? formatMessage({ id: "NOTICE.TITLES.EDIT_NOTICE" })
        : formatMessage({ id: "NOTICE.TITLES.POST_NOTICE" })}
    >
      <Formik
        initialValues={initialValues}
        validationSchema={noticeValidationSchema}
        onSubmit={(values, { setSubmitting }) => {
          handleAddUpdateNotice(values, setSubmitting);
        }}
      >
        {({ values, isValid, dirty, isSubmitting, handleSubmit, setFieldValue }) => (
          <form onSubmit={handleSubmit}>
            <Grid container rowSpacing={2} columnSpacing={{ xs: 1, sm: 2 }}>
              <Grid item xs={12} sm={6}>
                <SelectInput
                  label={formatMessage({ id: "NOTICE.TYPE" })}
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
                  label={formatMessage({ id: "NOTICE.ROLE" })}
                  name="target"
                  required={true}
                >
                  <MenuItem value={"all"}>{formatMessage({ id: "NOTICE.TYPES.ALL" })}</MenuItem>
                  {roleList.map(role => (
                    <MenuItem key={role.rolesId} value={role.rolesId}>{role.titles}</MenuItem>
                  ))}
                </SelectInput>
              </Grid>
              <Grid item xs={12} >
                <SelectInput
                  label={formatMessage({ id: "NOTICE.DEPARTMENT" })}
                  name="departments"
                  required={true}
                >
                  <MenuItem value={"all"}>{formatMessage({ id: "NOTICE.TYPES.ALL" })}</MenuItem>
                  {departmentList.map((dep) => (
                    <MenuItem
                      key={dep.departmentId}
                      value={dep.departmentId}
                    >
                      {dep.titles[currentLanguage] || dep.titles[defaultLang] || <FormattedMessage id={"TRANSLATION_MISSING"} />}
                    </MenuItem>
                  ))}
                </SelectInput>
              </Grid>

              <Grid item xs={12}>
                <TextInput
                  multiline={true}
                  label={formatMessage({ id: "NOTICE.TITLE" })}
                  name="title"
                  placeholder={formatMessage({ id: "NOTICE.TITLE" })}
                  type="text"
                />
              </Grid>
              <Grid item xs={12}>
                <TextEditor value={values.message} setValue={(value: string) => {
                  setFieldValue("message", value);
                }} placeholder="NOTICE.MESSAGE" />
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
