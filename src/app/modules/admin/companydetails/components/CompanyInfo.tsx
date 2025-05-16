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
import { FC, useEffect, useState } from "react";

import { useIntl } from "react-intl";
import CustomisedButton from "../../../../shared/components/CustomisedButton";
import { CompanyInfoModel, CompanyModel } from "../../models";
import { getCompanyDetails, updateCompanyDetails } from "../../adminservices";
import { languages } from "../../../../../utils/constant/Constant";
import { CompanyInfoSkeleton } from "./CompanyInfoSkeleton";
import { useFormik } from "formik";
import { companyValidationSchema } from "../../../../../utils/Schema/companyValidationSchema";
import { CloudUploadOutlined } from "@mui/icons-material";
import { ImageCropper } from "../../../users/components/ImageCropper";
import { toast } from "react-toastify";
import { useAppDispatch, useAppSelector } from "../../../../Redux/hooks";
import { setCurrentUser } from "../../../../Redux/Reducers/userSlice";

const initialCompanyInfo: CompanyModel = {
  defaultLanguage: "",
  applicationLanguage: [],
  companyLogo: null,
  companyName: "",
  primaryContact: "",
  country: "",
  state: null,
}
const SupportedImageFormat = ["jpg", "jpeg", "png"];
const MAX_FILE_SIZE = 5; // 5MB Max file size

export const CompanyInfo: FC = () => {
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

  const { values, handleSubmit, setFieldValue, setFieldError, setFieldTouched, errors, touched, getFieldProps, submitForm } = useFormik({
    enableReinitialize: true,
    initialValues: editedInfo,
    validationSchema: companyValidationSchema,
    onSubmit(values, { setSubmitting }) {
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
    setFieldValue: (field: string, value: any, shouldValidate?: boolean) => void
  ) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const selectedFile = files[0];
      const fileSizeInMB = selectedFile.size / (1024 * 1024);
      const fileFormat = selectedFile.name.split(".").pop()!;
      if (fileSizeInMB > MAX_FILE_SIZE) {
        setFieldError("companyLogo", "File size should be less then 5MB");
        return;
      }
      if (!SupportedImageFormat.includes(fileFormat.toLowerCase())) {
        setFieldError("companyLogo", "Only .jpg, .jpeg or .png images are allowed");
        return;
      }
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
    if (croppedLogo && selectedLogo) {
      const formData = new FormData();
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
      formData.append("CompanyName", values.companyName);
      formData.append("DefaultLanguage", values.defaultLanguage);
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
          toast.success("Updated Successfully");
          setEdit(false);
        }
      } catch (error) {
        toast.error("Request Failed");
      }
    }
  };
  // console.log(croppedLogo);


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
          });
          setLoading(false);
        }
      }
      catch (error) {
        console.log(error);
      }
    })();
  }, [])

  if (loading) {
    return <CompanyInfoSkeleton />
  }

  return (
    <>

      <Card sx={{ p: 3, mt: 1, height: "100%" }}>
        <Stack direction={"row"} sx={{ justifyContent: "space-between", alignItems: "flex-start" }}>
          <Stack spacing={.5}>
            <Typography variant="h5" sx={{ fontSize: 18 }}>
              {formatMessage({ id: "COMPANY_DETAILS.TAB.COMPANY_PROFILE" })}
            </Typography>
            <Typography variant="body2" sx={{ fontSize: 12 }}>
              {formatMessage({ id: "COMPANY_DETAILS.TAB.NOTE" })}
            </Typography>
          </Stack>

          {
            isEdit ?
              <Stack direction="row" spacing={1}>
                <CustomisedButton variant="outlined" label={formatMessage({ id: "BUTTON.CANCEL" })} handleClick={() => setEdit(false)} />
                <CustomisedButton type="submit" label={formatMessage({ id: "BUTTON.UPDATE" })} handleClick={submitForm} />
              </Stack>
              :
              <CustomisedButton
                label={formatMessage({ id: "COMPANY_DETAILS.EDIT_DETAILS" })}
                handleClick={() => setEdit(true)}
              />
          }
        </Stack>
        <Divider sx={{ my: 2 }} />
        <form onSubmit={handleSubmit} className="d-flex flex-column gap-6">
          <Stack spacing={1}>
            <Typography variant="h6">
              {formatMessage({ id: "COMPANY_DETAILS.TAB.COMPANY_DETAIL.LANGUAGES" })}
            </Typography>
            <Grid container sx={{ justifyContent: "space-between", alignItems: "flex-end", gap: 2 }}>
              <Grid item xs={12} sm={6} md={5}>
                <Typography variant="body1" id="defaultLanguage">
                  {formatMessage({ id: "COMPANY_DETAILS.TAB.COMPANY_DETAIL.DEFAULT_COMPANY_LANGUAGE" })}
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
              </Grid>
              <Grid item xs={12} sm={6} md={5}>
                <Typography variant="body1" >
                  {formatMessage({ id: "COMPANY_DETAILS.TAB.COMPANY_DETAIL.APPLICATION_LANGUAGE" })}
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
                      renderTags={(value, getTagProps) => (
                        value.map((option, index: number) => {
                          const { key, ...tagProps } = getTagProps({ index });
                          return (
                            <Chip label={formatMessage({ id: option.name })} size="small" key={key} {...tagProps} />
                          );
                        })
                      )}
                      renderOption={(props, option, state) => {
                        return (
                          <li {...props} key={option.id}>
                            <ListItemText primary={formatMessage({ id: option.name })} />
                          </li>
                        );
                      }}
                      sx={{ mt: 1 }}
                    />
                    : <Typography variant="body2">{applicationLanguages.map(lang => formatMessage({ id: lang }) + " ")}</Typography>
                }
              </Grid>
            </Grid>
          </Stack>
          <Divider sx={{ my: 1 }} />
          <Stack spacing={1}>
            <Stack>
              <Typography variant="h6">
                {formatMessage({ id: "COMPANY_DETAILS.TAB.COMPANY_DETAIL.COMPANY_NAME", })}
              </Typography>
              <Typography variant="body2">
                The company name is displayed on the application side menu.
              </Typography>
            </Stack>
            <Grid container sx={{ gap: 2 }}>
              <Grid item xs={12} sm={5}>
                {
                  isEdit ?
                    <TextField id="company-name" fullWidth required {...getFieldProps("companyName")} error={touched.companyName && Boolean(errors.companyName)} />
                    :
                    <Typography variant="body1">{companyInfo.companyName}</Typography>
                }
              </Grid>
            </Grid>
          </Stack>
          <Divider sx={{ my: 1 }} />
          <Grid container sx={{ gap: 2 }}>
            <Grid item xs={12} sm={4}>
              <Typography variant="h6">{formatMessage({ id: "COMPANY_DETAILS.TAB.COMPANY_DETAIL.LOGO" })}</Typography>
              <Typography variant="body2" sx={{ fontSize: 12 }}>
                {formatMessage({ id: "COMPANY_DETAILS.LOGO_NOTE" })}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={7} className="company-logo-wrapper">
              <Stack spacing={1}>
                <Avatar
                  variant="square"
                  alt={formatMessage({ id: "COMPANY_DETAILS.TAB.COMPANY_DETAIL.LOGO" })}
                  src={userData.companyLogo ?? ""}
                  sx={{
                    width: "200px",
                    height: "50px",
                    objectFit: "contain",
                    objectPosition: "center",
                    backgroundColor: 'background.sidebar'
                  }}
                />
                <Typography variant="body1">{companyInfo.companyName}</Typography>
                <Stack className="text-nowrap">
                  <Typography variant="body1">{formatMessage({
                    id: "COMPANY_DETAILS.TAB.COMPANY_DETAIL.INDUSTRY",
                  })}</Typography>
                  <Typography variant="body2">Software Development</Typography>
                </Stack>
              </Stack>
              <Box
                className="logo-update-button"
                sx={{ borderRadius: 1, border: 1, borderColor: touched.companyLogo && Boolean(errors.companyLogo) ? 'error.main' : 'text.secondary' }}
              >
                <IconButton component="label" role="button" aria-label="select logo" sx={{ border: 0, color: 'primary.main' }}>
                  <CloudUploadOutlined />
                  <input
                    name="companyLogo"
                    type="file"
                    accept=".jpg,.png,.webp"
                    onChange={(e) => {
                      setFieldTouched("companyLogo", true);
                      handleFileChange(e, setFieldValue);
                    }}
                    hidden
                  />
                </IconButton>
                {
                  selectedLogo &&
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>{selectedLogo.name}</Typography>
                }
                {
                  touched.companyLogo && Boolean(errors.companyLogo) ?
                    <Typography variant="body2" sx={{ color: 'error.main' }}>{errors.companyLogo}</Typography> :
                    <Typography variant="body2">{formatMessage({ id: "COMPANY_DETAILS.LOGO_UPDATE_NOTE" })}</Typography>
                }
              </Box>
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
