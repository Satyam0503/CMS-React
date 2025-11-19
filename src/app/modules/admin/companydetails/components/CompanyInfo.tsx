import {
  Autocomplete,
  Avatar,
  Box,
  Card,
  Chip,
  Divider,
  Grid,
  IconButton,
  ListItemText,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";

import { useIntl } from "react-intl";
import CustomisedButton from "../../../../shared/components/CustomisedButton";
import { CompanyInfoModel, CompanyModel } from "../../models";
import { getCompanyDetails, updateCompanyDetails } from "../../adminservices";
import { DEFAULT_COMPANY_LOGO, languages } from "../../../../../utils/constant/Constant";
import { CompanyInfoSkeleton } from "./CompanyInfoSkeleton";
import { useFormik } from "formik";
import { companyValidationSchema } from "../../../../../utils/Schema/companyValidationSchema";
import { CloudUploadOutlined } from "@mui/icons-material";
import { ImageCropper } from "../../../users/components/ImageCropper";
import { toast } from "react-toastify";
import { useAppDispatch, useAppSelector } from "../../../../Redux/hooks";
import { setCurrentUser } from "../../../../Redux/Reducers/userSlice";
import { useAppLang } from "../../../../../_themes/i18n/Metronici18n";
import { LANGUAGE } from "../../../../../utils/enums";

const initialCompanyInfo: CompanyModel = {
  defaultLanguage: "",
  applicationLanguage: [],
  companyLogo: null,
  companyName: "",
  primaryContact: "",
  country: "",
  address: ""
}
const SupportedImageFormat = ["jpg", "jpeg", "png", "webp"];
const MAX_FILE_SIZE = 5;

export const CompanyInfo = () => {
  const { currentLanguage, changeAppLanguage } = useAppLang();
  const { formatMessage } = useIntl();
  const [isEdit, setEdit] = useState(false);
  const [loading, setLoading] = useState(true);
  const [companyInfo, setCompanyInfo] = useState<CompanyInfoModel>({} as CompanyInfoModel);
  const [editedInfo, setEditedInfo] = useState<CompanyModel>(initialCompanyInfo);
  const [selectedLogo, setSelectedLogo] = useState<File | null>(null);
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [croppedLogo, setCroppedLogo] = useState<string | null>(null);
  const [isCropperOpen, setCropperOpen] = useState(false);

  const userData = useAppSelector(state => state.user.userData)!;
  const dispatch = useAppDispatch();

  const defaultLanguage = languages.find(lang => lang.lang === companyInfo?.defaultLanguage)?.name ?? "NOT_AVAILABLE";
  const applicationLanguages = companyInfo?.applicationLanguage?.length > 0 ? languages.filter(lang => companyInfo?.applicationLanguage.includes(lang.lang)).map(lang => lang.name) : ["NOT_AVAILABLE"];

  const { values, dirty, handleSubmit, resetForm, setFieldValue, setFieldError, setFieldTouched, errors, touched, getFieldProps, submitForm } = useFormik({
    enableReinitialize: true,
    initialValues: editedInfo,
    validationSchema: companyValidationSchema,
    onSubmit(values) {
      handleUpdateCompanyDetails();
    }
  })
  const handleImageCropDiscard = () => {
    setSelectedLogo(null);
    setImgSrc("");
    setCropperOpen(false);
  };
  const handleImageCropSuccess = (croppedImageDataUrl: string) => {
    setCroppedLogo(croppedImageDataUrl);
    setCropperOpen(false);
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const selectedFile = files[0];
      const fileSizeInMB = selectedFile.size / (1024 * 1024);
      const fileFormat = selectedFile.name.split(".").pop()!;
      if (fileSizeInMB > MAX_FILE_SIZE) {
        setFieldError("companyLogo", "VALIDATION_ERR.PROFILE_PICTURE_SIZE");
        return;
      }
      if (!SupportedImageFormat.includes(fileFormat.toLowerCase())) {
        setFieldError("companyLogo", "VALIDATION_ERR.PICTURE_FORMAT");
        return;
      }
      setFieldValue("companyLogo", selectedFile);
      const reader = new FileReader();
      reader.addEventListener("load", () => {
        setImgSrc(reader.result as string);
        setCropperOpen(true);
      });
      reader.readAsDataURL(selectedFile);
      setSelectedLogo(selectedFile);
    }
  };

  const handleUpdateCompanyDetails = async () => {
    const formData = new FormData();
    if (croppedLogo && selectedLogo) {
      const base64Image = croppedLogo.split(",")[1];
      const blob = new Blob(
        [
          new Uint8Array(
            atob(base64Image)
              .split("")
              .map((c) => c.charCodeAt(0))
          ),
        ],
        {
          type: selectedLogo.type,
        }
      );
      formData.append("companyLogo", blob, selectedLogo.name);
    }

    formData.append("CompanyName", values.companyName);
    formData.append("DefaultLanguage", values.defaultLanguage);
    formData.append("Address", values.address);
    if (values.applicationLanguage.length > 0) {
      values.applicationLanguage.forEach(language =>
        formData.append('ApplicationLanguage', language)
      );
    }
    try {
      const response = await updateCompanyDetails(formData);
      const { success, methodResult } = response.data;
      if (success) {
        dispatch(setCurrentUser({
          ...userData, companyLogo: methodResult.companyLogo ?? userData?.companyLogo, defaultLanguage: methodResult.defaultLanguage,
          applicationLanguage: methodResult.applicationLanguage
        }));
        changeAppLanguage?.(methodResult.defaultLanguage as LANGUAGE);
        setCompanyInfo(methodResult);
        toast.success(formatMessage({ id: "TOAST.SUCCESS.UPDATE" }));
        setEdit(false);
        setSelectedLogo(null);
      } else {
        toast.error(formatMessage({ id: "TOAST.SUCCESS.UPDATE" }));
      }
    } catch (error) {
      console.error((error as Error).message);
    }
  };

  const handleEditCancel = () => {
    setEdit(false);
    setSelectedLogo(null);
    resetForm();
  }
  useEffect(() => {
    (async () => {
      try {
        const response = await getCompanyDetails();
        const { success, methodResult } = response.data;
        if (success) {
          setCompanyInfo(methodResult);
          setEditedInfo({
            ...editedInfo,
            companyName: methodResult.companyName,
            defaultLanguage: methodResult.defaultLanguage,
            applicationLanguage: methodResult.applicationLanguage,
            address: methodResult.address
          });
          setLoading(false);
        }
      }
      catch (error) {
        console.log(error);
      }
    })();
  }, []);

  if (loading) {
    return <CompanyInfoSkeleton />;
  }

  return (
    <>
      <Card sx={{ p: 3, mt: 1, height: "100%" }}>
        <Stack direction={"row"} sx={{ justifyContent: "space-between", alignItems: "flex-start", gap: 2, flexWrap: "wrap" }}>
          <Stack spacing={.5}>
            <Typography variant="h5" sx={{ fontSize: 18 }}>
              {formatMessage({ id: "COMPANY_DETAILS.COMPANY_PROFILE" })}
            </Typography>
            <Typography variant="body2" sx={{ fontSize: 12 }}>
              {formatMessage({ id: "COMPANY_DETAILS.NOTE" })}
            </Typography>
          </Stack>

          {
            isEdit ?
              <Stack direction="row" spacing={1}>
                <CustomisedButton variant="outlined" label={formatMessage({ id: "BUTTON.CANCEL" })} handleClick={handleEditCancel} />
                <CustomisedButton type="submit" disabled={!dirty} label={formatMessage({ id: "BUTTON.UPDATE" })} handleClick={submitForm} />
              </Stack>
              :
              <CustomisedButton
                label={formatMessage({ id: "COMPANY_DETAILS.EDIT_BUTTON" })}
                handleClick={() => setEdit(true)}
              />
          }
        </Stack>
        <Divider sx={{ my: 2 }} />
        <form onSubmit={handleSubmit} className="d-flex flex-column gap-6">
          <Grid container sx={{ gap: 3 }}>
            <Grid
              size={{
                xs: 12,
                sm: 4,
                md: 5
              }}>
              <Typography variant="h6">
                {formatMessage({
                  id: "COMPANY_DETAILS.LANGUAGES",
                })}
              </Typography>
              <Typography variant="body2">
                {formatMessage({ id: "COMPANY_DETAILS.LANGUAGES_NOTE" })}
              </Typography>
            </Grid>
            <Grid
              sx={{ display: "flex", flexDirection: "column", gap: 3 }}
              size={{
                xs: 12,
                sm: 7,
                md: 6
              }}>
              <Stack spacing={1}>
                <Typography variant="body1" id="defaultLanguage">
                  {formatMessage({ id: "COMPANY_DETAILS.DEFAULT_LANG" })}
                </Typography>
                {
                  isEdit ?
                    <Select
                      fullWidth
                      required
                      labelId="defaultLanguage"
                      id="default-language"
                      variant="outlined"
                      sx={{ mt: 1 }}
                      error={touched.defaultLanguage && Boolean(errors.defaultLanguage)}
                      {...getFieldProps("defaultLanguage")}
                    >
                      {
                        languages.map(item =>
                          <MenuItem key={item.id} value={item.lang}>{formatMessage({ id: item.name })}</MenuItem>
                        )
                      }
                    </Select>
                    :
                    <Typography variant="body2">{formatMessage({ id: defaultLanguage })}</Typography>
                }
              </Stack>
              <Stack spacing={1}>
                <Typography variant="body1" >
                  {formatMessage({ id: "COMPANY_DETAILS.APP_LANG" })}
                </Typography>
                {
                  isEdit ?
                    <Autocomplete
                      multiple
                      size="small"
                      id="application-language"
                      options={languages}
                      disableCloseOnSelect
                      value={languages.filter((lang) =>
                        values.applicationLanguage.includes(lang.lang)
                      )}
                      onChange={(event, selectedLanguage) => {
                        setFieldValue(
                          "applicationLanguage",
                          selectedLanguage.map((lang) => lang.lang)
                        );
                      }}
                      getOptionLabel={(option) => option.name}
                      renderInput={(params) => (
                        <TextField {...params} />
                      )}
                      renderValue={(value, getTagProps) => (
                        value.map((option, index: number) => {
                          const { key, ...tagProps } = getTagProps({ index });
                          return (
                            <Chip label={formatMessage({ id: option.name })} size="small" key={key} {...tagProps} />
                          );
                        })
                      )}
                      renderOption={(props, option,) => {
                        return (
                          <li {...props} key={option.id}>
                            <ListItemText primary={formatMessage({ id: option.name })} />
                          </li>
                        );
                      }}
                      sx={{ mt: 1 }}
                    />
                    : <Typography variant="body2">{applicationLanguages.map(lang => formatMessage({ id: lang }) + ", ")}</Typography>
                }
              </Stack>
            </Grid>
          </Grid>
          <Divider sx={{ my: 1 }} />
          <Grid container sx={{ gap: 3 }} >
            <Grid
              className="d-flex flex-column gap-1"
              size={{
                xs: 12,
                sm: 4,
                md: 5
              }}>
              <Typography variant="h6">
                {formatMessage({
                  id: "COMPANY_DETAILS.COMPANY_NAME",
                })}
              </Typography>
              <Typography variant="body2">
                {formatMessage({ id: "COMPANY_DETAILS.NAME_NOTE" })}
              </Typography>
            </Grid>
            <Grid
              size={{
                xs: 12,
                sm: 7,
                md: 6
              }}>
              {
                isEdit ?
                  <TextField id="company-name" fullWidth required {...getFieldProps("companyName")} error={touched.companyName && Boolean(errors.companyName)} />
                  :
                  <Typography variant="body1">{companyInfo.companyName}</Typography>
              }
            </Grid>
          </Grid>
          <Divider sx={{ my: 1 }} />
          <Grid container sx={{ gap: 3 }} >
            <Grid
              className="d-flex flex-column gap-1"
              size={{
                xs: 12,
                sm: 4,
                md: 5
              }}>
              <Typography variant="h6">
                {formatMessage({
                  id: "COMPANY_DETAILS.ADDRESS",
                })}
              </Typography>
              <Typography variant="body2">
                {formatMessage({ id: "COMPANY_DETAILS.ADDRESS_NOTE" })}
              </Typography>
            </Grid>
            <Grid
              size={{
                xs: 12,
                sm: 7,
                md: 6
              }}>
              {
                isEdit ?
                  <TextField id="company-address" fullWidth required {...getFieldProps("address")} error={touched.address && Boolean(errors.address)} />
                  :
                  <Typography variant="body1">{companyInfo.address || formatMessage({ id: "NOT_AVAILABLE" })}</Typography>
              }
            </Grid>
          </Grid>
          <Divider sx={{ my: 1 }} />
          <Grid container sx={{ gap: 3 }}>
            <Grid
              size={{
                xs: 12,
                sm: 4,
                md: 5
              }}>
              <Typography variant="h6">{formatMessage({ id: "COMPANY_DETAILS.LOGO" })}</Typography>
              <Typography variant="body2" sx={{ fontSize: 12 }}>
                {formatMessage({ id: "COMPANY_DETAILS.LOGO_NOTE" })}
              </Typography>
            </Grid>
            <Grid
              className="company-logo-wrapper"
              size={{
                xs: 12,
                sm: 6
              }}>
              <Stack spacing={1}>
                <Avatar
                  variant="square"
                  alt={formatMessage({ id: "COMPANY_DETAILS.LOGO" })}
                  src={userData.companyLogo ?? DEFAULT_COMPANY_LOGO}
                  sx={{
                    width: "250px",
                    height: "70px",
                    backgroundColor: 'background.sidebar',
                    "& .MuiAvatar-img": {
                      objectFit: "contain",
                      objectPosition: "center",
                    }
                  }}
                />
                <Typography variant="h6">{companyInfo.companyName}</Typography>
              </Stack>
              {
                isEdit &&
                <Box
                  className="logo-update-button"
                  sx={{ borderRadius: 1, border: 1, borderColor: touched.companyLogo && Boolean(errors.companyLogo) ? 'error.main' : 'text.secondary' }}
                >
                  <IconButton component="label" role="button" aria-label="select logo" sx={{ border: 0, color: touched.companyLogo && Boolean(errors.companyLogo) ? 'error.main' : 'primary.main' }}>
                    <CloudUploadOutlined />
                    <input
                      name="companyLogo"
                      type="file"
                      accept=".jpg,.png,.webp"
                      onChange={(e) => {
                        setFieldTouched("companyLogo", true, false);
                        handleFileChange(e);
                      }}
                      hidden
                    />
                  </IconButton>
                  {
                    selectedLogo &&
                    <Typography variant="body2" sx={{ fontWeight: 600 }}> {formatMessage({ id: "COMPANY_DETAILS.SELECTED_LOGO" }, { image: selectedLogo.name })}</Typography>
                  }
                  {
                    touched.companyLogo && Boolean(errors.companyLogo) ?
                      <Typography variant="body2" sx={{ color: 'error.main' }}>{errors.companyLogo}</Typography> :
                      <Typography variant="body2">{formatMessage({ id: "COMPANY_DETAILS.LOGO_UPDATE_NOTE" })}</Typography>
                  }
                </Box>
              }

            </Grid>
          </Grid>
          <Divider sx={{ my: 1 }} />

        </form>
      </Card >
      {
        (isCropperOpen && imgSrc) && (
          <ImageCropper
            open={Boolean(imgSrc)}
            handleClose={handleImageCropDiscard}
            imgSrc={imgSrc}
            handleCrop={handleImageCropSuccess}
            circularCrop={false}
          />
        )
      }
    </>
  );
};
