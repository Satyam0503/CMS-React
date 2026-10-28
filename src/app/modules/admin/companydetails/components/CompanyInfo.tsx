import {
  alpha,
  Autocomplete,
  Avatar,
  Box,
  Card,
  Chip,
  Button,
  Divider,
  Grid,
  ListItemText,
  MenuItem,
  FormControlLabel,
  Stack,
  Switch,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";

import { useIntl } from "react-intl";
import CustomisedButton from "../../../../shared/components/C_Button";
import { CompanyInfoModel, CompanyModel } from "../../models";
import { getCompanyDetails, updateCompanyDetails, getEmployeeIdSequence, skipEmployeeIds, startEmployeeIdSequence, setCompanyFormerEmployeePortalAccess } from "../../adminservices";
import { setCompanyTheme } from "../../../theme/companyTheme";
import { DEFAULT_COMPANY_LOGO, allLanguages, languages } from "../../../../../utils/constant/Constant";
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

import { AppIconButton, AppSelect, AppTextField } from "../../../../shared/components/ui";
import { ConfirmationModal } from "../../../../shared/components/ConfirmModal";
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
  const { changeAppLanguage } = useAppLang();
  const { formatMessage } = useIntl();
  const [isEdit, setEdit] = useState(false);
  const [loading, setLoading] = useState(true);
  const [companyInfo, setCompanyInfo] = useState<CompanyInfoModel>({} as CompanyInfoModel);
  const [editedInfo, setEditedInfo] = useState<CompanyModel>(initialCompanyInfo);
  const [selectedLogo, setSelectedLogo] = useState<File | null>(null);
  const [nextEmployeeId, setNextEmployeeId] = useState("");
  const [employeeIdFormat, setEmployeeIdFormat] = useState("");
  const [skipCount, setSkipCount] = useState("");
  const [startFromId, setStartFromId] = useState("");
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [croppedLogo, setCroppedLogo] = useState<string | null>(null);
  const [isCropperOpen, setCropperOpen] = useState(false);
  const [isLogoUploading, setIsLogoUploading] = useState(false);
  const applyEmployeeIdSequence = (sequence: { currentNextEmployeeId: string; format: string }) => {
    setNextEmployeeId(sequence.currentNextEmployeeId);
    setEmployeeIdFormat(sequence.format);
  };

  const userData = useAppSelector(state => state.user.userData)!;
  const dispatch = useAppDispatch();

  const defaultLanguage = (allLanguages || languages).find(lang => lang.lang === companyInfo?.defaultLanguage)?.name ?? "NOT_AVAILABLE";
  const applicationLanguages = companyInfo?.applicationLanguage?.length > 0 ? (allLanguages || languages).filter(lang => companyInfo?.applicationLanguage.includes(lang.lang)).map(lang => lang.name) : ["NOT_AVAILABLE"];
  const { values, dirty, handleSubmit, resetForm, setFieldValue, setFieldError, setFieldTouched, errors, touched, getFieldProps, submitForm } = useFormik({
    enableReinitialize: true,
    initialValues: editedInfo,
    validationSchema: companyValidationSchema,
    onSubmit() {
      handleUpdateCompanyDetails();
    }
  })
  const handleImageCropDiscard = () => {
    setSelectedLogo(null);
    setImgSrc("");
    setCropperOpen(false);
  };
  const handleImageCropSuccess = async (croppedImageDataUrl: string) => {
    setCroppedLogo(croppedImageDataUrl);
    setCropperOpen(false);
    if (!isEdit) {
      await handleUpdateCompanyDetails(croppedImageDataUrl, selectedLogo, true);
    }
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

  const handleUpdateCompanyDetails = async (
    logoDataUrl = croppedLogo,
    logoFile = selectedLogo,
    logoOnly = false,
  ) => {
    const formData = new FormData();
    if (logoDataUrl && logoFile) {
      const base64Image = logoDataUrl.split(",")[1];
      const blob = new Blob(
        [
          new Uint8Array(
            atob(base64Image)
              .split("")
              .map((c) => c.charCodeAt(0))
          ),
        ],
        {
          type: logoFile.type,
        }
      );
      formData.append("companyLogo", blob, logoFile.name);
    }

    formData.append("CompanyName", values.companyName);
    formData.append("DefaultLanguage", values.defaultLanguage);
    formData.append("Address", values.address);
    formData.append("EmployeeIdPrefix", values.employeeIdPrefix ?? "");
    formData.append("AutoGenerateEmployeeId", String(values.autoGenerateEmployeeId ?? true));
    formData.append("AppTheme", values.appTheme ?? "glass");
    if (values.applicationLanguage.length > 0) {
      values.applicationLanguage.forEach(language =>
        formData.append('ApplicationLanguage', language)
      );
    }
    try {
      if (logoOnly) setIsLogoUploading(true);
      const response = await updateCompanyDetails(formData);
      const { success, methodResult } = response.data;
      if (success) {
        dispatch(setCurrentUser({
          ...userData, companyLogo: methodResult.companyLogo ?? userData?.companyLogo, defaultLanguage: methodResult.defaultLanguage,
          applicationLanguage: methodResult.applicationLanguage
        }));
        changeAppLanguage?.(methodResult.defaultLanguage as LANGUAGE);
        setCompanyInfo(methodResult);
        setCompanyTheme(methodResult.appTheme);
        await refreshEmployeeIdSequence();
        toast.success(formatMessage({ id: "TOAST.SUCCESS.UPDATE" }));
        setEdit(false);
        setSelectedLogo(null);
        setCroppedLogo(null);
      } else {
        toast.error(response.data.message || formatMessage({ id: "ERROR.500" }));
      }
    } catch (error) {
      console.error((error as Error).message);
      toast.error(formatMessage({ id: "ERROR.500" }));
    } finally {
      if (logoOnly) setIsLogoUploading(false);
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
          setEditedInfo((prev) => ({
            ...prev,
            companyName: methodResult.companyName,
            defaultLanguage: methodResult.defaultLanguage,
            applicationLanguage: methodResult.applicationLanguage,
            address: methodResult.address,
            employeeIdPrefix: methodResult.employeeIdPrefix ?? "",
            autoGenerateEmployeeId: methodResult.autoGenerateEmployeeId ?? true,
            appTheme: methodResult.appTheme ?? "glass",
          }));
          setLoading(false);
        }
      }
      catch (error) {
        console.log(error);
      }
    })();
  }, []);

  useEffect(() => {
    void getEmployeeIdSequence().then(({ data }) => {
      if (data.success && data.methodResult) {
        applyEmployeeIdSequence(data.methodResult);
      }
    });
  }, []);

  const refreshEmployeeIdSequence = async () => {
    const { data } = await getEmployeeIdSequence();
    if (data.success && data.methodResult) applyEmployeeIdSequence(data.methodResult);
  };
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [confirmationTitle, setConfirmationTitle] = useState("");
  const [confirmationContent, setConfirmationContent] = useState("");
  const [confirmationAction, setConfirmationAction] = useState<(() => Promise<void>) | null>(null);
  const [confirmationLoading, setConfirmationLoading] = useState(false);
  const toggleFormerEmployeePortal = async (enabled: boolean) => {
    try {
      setConfirmationLoading(true);
      const { data } = await setCompanyFormerEmployeePortalAccess(enabled, enabled ? "Enabled by company administrator" : "Disabled by company administrator");
      if (!data.success) { toast.error(data.message || "Unable to update former-employee portal access."); return; }
      setCompanyInfo((current) => ({ ...current, formerEmployeePortalEnabled: enabled }));
      setEditedInfo((current) => ({ ...current, formerEmployeePortalEnabled: enabled }));
      toast.success(enabled ? "Former-employee portal enabled for this company." : "Former-employee portal disabled and all active portal sessions revoked.");
    } catch { toast.error("Unable to update former-employee portal access."); }
    finally { setConfirmationLoading(false); }
  };
  const confirmSkip = async () => {
    const count = Number(skipCount);
    if (!Number.isInteger(count) || count <= 0) return toast.error("Skip count must be greater than 0.");
    setConfirmationTitle("Confirm Skip");
    setConfirmationContent(`Automatic Employee ID generation will skip ${count} ID(s). Existing employee IDs will not be changed. Continue?`);
    setConfirmationAction(async () => {
      try {
        setConfirmationLoading(true);
        const { data } = await skipEmployeeIds(count);
        if (!data.success) {
          void toast.error(data.message || "Unable to skip Employee IDs.");
          return;
        }
        toast.success(data.message);
        setSkipCount("");
        if (data.methodResult) applyEmployeeIdSequence(data.methodResult);
        else await refreshEmployeeIdSequence();
      } catch (err) {
        console.error(err);
        toast.error("Unable to skip Employee IDs.");
      } finally {
        setConfirmationLoading(false);
        setConfirmationOpen(false);
      }
      return;
    });
    setConfirmationOpen(true);
  };
  const confirmStartFrom = async () => {
    if (!startFromId.trim()) return toast.error("Employee ID is required.");
    setConfirmationTitle("Set Starting ID");
    setConfirmationContent(`Automatic Employee ID generation will continue from ${startFromId.trim().toUpperCase()}. Existing employee IDs will not be changed. Continue?`);
    setConfirmationAction(async () => {
      try {
        setConfirmationLoading(true);
        const { data } = await startEmployeeIdSequence(startFromId);
        if (!data.success) {
          void toast.error(data.message || "Unable to update Employee ID sequence.");
          return;
        }
        toast.success(data.message);
        setStartFromId("");
        if (data.methodResult) applyEmployeeIdSequence(data.methodResult);
        else await refreshEmployeeIdSequence();
      } catch (err) {
        console.error(err);
        toast.error("Unable to update Employee ID sequence.");
      } finally {
        setConfirmationLoading(false);
        setConfirmationOpen(false);
      }
      return;
    });
    setConfirmationOpen(true);
  };

  if (loading) {
    return <CompanyInfoSkeleton />;
  }

  return (
    <>
      <Card sx={{ p: { xs: 1.5, sm: 2.5, md: 3 }, mt: 0, height: "100%", minWidth: 0, border: "1px solid", borderColor: "divider", borderRadius: { xs: 2.5, sm: 3 }, boxShadow: "0 10px 28px rgba(24, 74, 82, .07)" }}>
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
        <Divider sx={{ my: { xs: 1.5, sm: 2 } }} />
        <form onSubmit={handleSubmit} className="d-flex flex-column">
          <Grid container spacing={{ xs: 2, md: 3 }} alignItems="flex-start">
            <Grid
              size={{
                xs: 12,
                md: 4,
              }}>
              <Typography variant="h6">
                {formatMessage({
                  id: "COMPANY_DETAILS.LANGUAGES",
                })}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {formatMessage({ id: "COMPANY_DETAILS.LANGUAGES_NOTE" })}
              </Typography>
            </Grid>
            <Grid
              sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}
              size={{
                xs: 12,
                md: 8,
              }}>
              <Stack spacing={0.75} sx={{ maxWidth: { xs: "100%", sm: 520 } }}>
                <Typography variant="body2" fontWeight={700} id="defaultLanguage">
                  {formatMessage({ id: "COMPANY_DETAILS.DEFAULT_LANG" })}
                </Typography>
                {
                  isEdit ?
                    <AppSelect
                      fullWidth
                      required
                      labelId="defaultLanguage"
                      id="default-language"
                      variant="outlined"
                      sx={{ mt: 0.5 }}
                      error={touched.defaultLanguage && Boolean(errors.defaultLanguage)}
                      {...getFieldProps("defaultLanguage")}
                    >
                      {
                        languages.map(item =>
                          <MenuItem key={item.id} value={item.lang}>{formatMessage({ id: item.name })}</MenuItem>
                        )
                      }
                    </AppSelect>
                    :
                    <Typography variant="body2">{formatMessage({ id: defaultLanguage })}</Typography>
                }
              </Stack>
              <Stack spacing={0.75} sx={{ maxWidth: { xs: "100%", sm: 520 } }}>
                <Typography variant="body2" fontWeight={700}>
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
                        <AppTextField {...params} />
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
                      sx={{ mt: 0.5 }}
                    />
                    : <Typography variant="body2">{applicationLanguages.map(lang => formatMessage({ id: lang })).join(", ")}</Typography>
                }
              </Stack>
              <Stack spacing={0.75} sx={{ maxWidth: { xs: "100%", sm: 520 } }}>
                <Typography variant="body2" fontWeight={700}>Company theme</Typography>
                {isEdit ? <AppSelect fullWidth {...getFieldProps("appTheme")}><MenuItem value="glass">Glass</MenuItem><MenuItem value="slate">Slate</MenuItem><MenuItem value="dawn">Dawn</MenuItem><MenuItem value="blush">Blush</MenuItem></AppSelect> : <Typography variant="body2" sx={{ textTransform: "capitalize", fontWeight: 600 }}>{values.appTheme ?? "glass"}</Typography>}
                <Typography variant="caption" color="text.secondary">Applied to all signed-in users and this company’s public careers pages.</Typography>
              </Stack>
            </Grid>
          </Grid>
          {companyInfo.autoGenerateEmployeeId !== false && <><Divider sx={{ my: { xs: 2, sm: 2.5 } }} /><Grid container spacing={{ xs: 2, md: 3 }} alignItems="flex-start">
            <Grid className="d-flex flex-column gap-1" size={{ xs: 12, md: 4 }}>
              <Typography variant="h6">Employee ID sequence</Typography>
              <Typography variant="body2" color="text.secondary">Control where automatic Employee ID generation continues. Existing employee IDs are never changed.</Typography>
            </Grid>
            <Grid size={{ xs: 12, md: 8 }}>
              <Stack spacing={1.5} sx={{ maxWidth: { xs: "100%", md: 580 } }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: 1.5,
                    px: 2,
                    py: 1,
                    borderRadius: 2,
                    border: "1px solid",
                    borderColor: (theme) => alpha(theme.palette.primary.main, 0.25),
                    bgcolor: (theme) => alpha(theme.palette.primary.main, 0.04),
                  }}
                >
                  <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ display: "block", lineHeight: 1.1 }}>
                      Next automatic ID
                    </Typography>
                    <Typography variant="h6" fontWeight={800} color="primary.main" sx={{ lineHeight: 1.25, mt: 0.25 }}>
                      {nextEmployeeId || "Loading..."}
                    </Typography>
                  </Box>
                  <Chip
                    size="small"
                    variant="outlined"
                    color="primary"
                    label={`Format: ${employeeIdFormat || "TT-0001"}`}
                    sx={{ fontWeight: 650, borderRadius: 1.5, height: 26, fontSize: "0.75rem" }}
                  />
                </Box>

                <Grid container spacing={1.25}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Stack direction="row" spacing={0.75} alignItems="stretch">
                      <AppTextField
                        size="small"
                        sx={{ flex: 1, minWidth: 0 }}
                        label="Skip IDs"
                        placeholder="e.g. 5"
                        value={skipCount}
                        onChange={(e) => setSkipCount(e.target.value)}
                        inputProps={{ inputMode: "numeric", min: 1, step: 1 }}
                      />
                      <Button
                        size="small"
                        variant="contained"
                        onClick={() => { void confirmSkip(); }}
                        sx={{ flexShrink: 0, minWidth: 72, whiteSpace: "nowrap", textTransform: "none", fontWeight: 700 }}
                      >
                        Skip
                      </Button>
                    </Stack>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Stack direction="row" spacing={0.75} alignItems="stretch">
                      <AppTextField
                        size="small"
                        sx={{ flex: 1, minWidth: 0 }}
                        label="Set next ID"
                        placeholder={nextEmployeeId || employeeIdFormat || "TT-0001"}
                        value={startFromId}
                        onChange={(e) => setStartFromId(e.target.value)}
                      />
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => { void confirmStartFrom(); }}
                        sx={{ flexShrink: 0, minWidth: 72, whiteSpace: "nowrap", textTransform: "none", fontWeight: 700 }}
                      >
                        Set
                      </Button>
                    </Stack>
                  </Grid>
                </Grid>
              </Stack>
            </Grid>
          </Grid></>}
          <Divider sx={{ my: { xs: 2, sm: 2.5 } }} />
          <Grid container spacing={{ xs: 2, md: 3 }} alignItems="flex-start">
            <Grid className="d-flex flex-column gap-1" size={{ xs: 12, md: 4 }}>
              <Typography variant="h6">Former-employee portal</Typography>
              <Typography variant="body2" color="text.secondary">Company-wide access control. Turning this off immediately revokes every former employee session; employee records and issued documents are retained.</Typography>
            </Grid>
            <Grid size={{ xs: 12, md: 8 }}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75, maxWidth: { xs: "100%", md: 580 } }}>
                <FormControlLabel
                  sx={{ ml: 0, gap: 1.5, alignItems: "center" }}
                  control={
                    <Switch
                      checked={companyInfo.formerEmployeePortalEnabled !== false}
                      onChange={(event) => void toggleFormerEmployeePortal(event.target.checked)}
                      disabled={confirmationLoading}
                      inputProps={{ "aria-label": "Enable former employee portal for this company" }}
                    />
                  }
                  label={
                    <Typography variant="body2" fontWeight={700}>
                      {companyInfo.formerEmployeePortalEnabled !== false ? "Portal enabled for this company" : "Portal disabled for this company"}
                    </Typography>
                  }
                />
                <Typography variant="caption" color="text.secondary" display="block">
                  Former employees still need individual access enabled and a verified personal email to sign in with OTP.
                </Typography>
              </Box>
            </Grid>
          </Grid>
          <Divider sx={{ my: { xs: 2, sm: 2.5 } }} />
          <Grid container spacing={{ xs: 2, md: 3 }} alignItems="flex-start">
            <Grid className="d-flex flex-column gap-1" size={{ xs: 12, md: 4 }}>
              <Typography variant="h6">Employee ID format</Typography>
              <Typography variant="body2" color="text.secondary">Set the company prefix, such as CD for Codeji. Automatic IDs use CD-0001; turn it off to enter IDs manually.</Typography>
            </Grid>
            <Grid size={{ xs: 12, md: 8 }}>
              {isEdit ? (
                <Stack spacing={1.25} sx={{ maxWidth: { xs: "100%", sm: 420 } }}>
                  <AppTextField label="Company employee code" inputProps={{ maxLength: 6 }} {...getFieldProps("employeeIdPrefix")} />
                  <FormControlLabel sx={{ ml: 0, gap: 1.25 }} control={<Switch checked={values.autoGenerateEmployeeId ?? true} onChange={(event) => setFieldValue("autoGenerateEmployeeId", event.target.checked)} />} label="Generate employee IDs automatically" />
                </Stack>
              ) : (
                <Chip
                  variant="outlined"
                  color={companyInfo.autoGenerateEmployeeId === false ? "default" : "primary"}
                  label={companyInfo.autoGenerateEmployeeId === false ? "Manual employee IDs" : employeeIdFormat || "Loading..."}
                  sx={{ fontWeight: 700, borderRadius: 1.75, px: 0.5 }}
                />
              )}
            </Grid>
          </Grid>
          <Divider sx={{ my: { xs: 2, sm: 2.5 } }} />
          <Grid container spacing={{ xs: 2, md: 3 }} alignItems="center">
            <Grid
              className="d-flex flex-column gap-1"
              size={{
                xs: 12,
                md: 4,
              }}>
              <Typography variant="h6">
                {formatMessage({
                  id: "COMPANY_DETAILS.COMPANY_NAME",
                })}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {formatMessage({ id: "COMPANY_DETAILS.NAME_NOTE" })}
              </Typography>
            </Grid>
            <Grid
              size={{
                xs: 12,
                md: 8,
              }}>
              {
                isEdit ?
                  <Box sx={{ maxWidth: { xs: "100%", sm: 520 } }}>
                    <AppTextField id="company-name" fullWidth required {...getFieldProps("companyName")} error={touched.companyName && Boolean(errors.companyName)} />
                  </Box>
                  :
                  <Typography variant="body1" fontWeight={650}>{companyInfo.companyName}</Typography>
              }
            </Grid>
          </Grid>
          <Divider sx={{ my: { xs: 2, sm: 2.5 } }} />
          <Grid container spacing={{ xs: 2, md: 3 }} alignItems="center">
            <Grid
              className="d-flex flex-column gap-1"
              size={{
                xs: 12,
                md: 4,
              }}>
              <Typography variant="h6">
                {formatMessage({
                  id: "COMPANY_DETAILS.ADDRESS",
                })}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {formatMessage({ id: "COMPANY_DETAILS.ADDRESS_NOTE" })}
              </Typography>
            </Grid>
            <Grid
              size={{
                xs: 12,
                md: 8,
              }}>
              {
                isEdit ?
                  <Box sx={{ maxWidth: { xs: "100%", sm: 520 } }}>
                    <AppTextField id="company-address" fullWidth required {...getFieldProps("address")} error={touched.address && Boolean(errors.address)} />
                  </Box>
                  :
                  <Typography variant="body1" color={companyInfo.address ? "text.primary" : "text.secondary"}>{companyInfo.address || formatMessage({ id: "NOT_AVAILABLE" })}</Typography>
              }
            </Grid>
          </Grid>
          <Divider sx={{ my: { xs: 2, sm: 2.5 } }} />
          <Grid container spacing={{ xs: 2, md: 3 }}>
            <Grid
              size={{
                xs: 12,
                md: 4,
              }}>
              <Typography variant="h6">{formatMessage({ id: "COMPANY_DETAILS.LOGO" })}</Typography>
              <Typography variant="body2" color="text.secondary">
                {formatMessage({ id: "COMPANY_DETAILS.LOGO_NOTE" })}
              </Typography>
            </Grid>
            <Grid
              className="company-logo-wrapper"
              size={{
                xs: 12,
                md: 8,
              }}>
              <Stack spacing={1}>
                <Avatar
                  variant="square"
                  alt={formatMessage({ id: "COMPANY_DETAILS.LOGO" })}
                  src={userData.companyLogo ?? DEFAULT_COMPANY_LOGO}
                  sx={{
                    maxWidth: "100%",
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
              <Box
                  className="logo-update-button"
                  sx={{ borderRadius: 1, border: 1, borderColor: touched.companyLogo && Boolean(errors.companyLogo) ? 'error.main' : 'text.secondary' }}
                >
                  <AppIconButton component="label" role="button" aria-label="upload company logo" disabled={isLogoUploading} sx={{ border: 0, color: touched.companyLogo && Boolean(errors.companyLogo) ? 'error.main' : 'primary.main' }}>
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
                  </AppIconButton>
                  {
                    selectedLogo &&
                    <Typography variant="body2" sx={{ fontWeight: 600 }}> {formatMessage({ id: "COMPANY_DETAILS.SELECTED_LOGO" }, { image: selectedLogo.name })}</Typography>
                  }
                  {
                    touched.companyLogo && Boolean(errors.companyLogo) ?
                      <Typography variant="body2" sx={{ color: 'error.main' }}>{errors.companyLogo}</Typography> :
                      <Typography variant="body2">{isLogoUploading ? "Uploading company logo..." : formatMessage({ id: "COMPANY_DETAILS.LOGO_UPDATE_NOTE" })}</Typography>
                  }
                </Box>

            </Grid>
          </Grid>
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
      {confirmationOpen && (
        <ConfirmationModal
          open={confirmationOpen}
          title={confirmationTitle}
          content={confirmationContent}
          handleClose={() => setConfirmationOpen(false)}
          handleConfirmation={async (res: string) => {
            if (res === "ok" && confirmationAction) {
              await confirmationAction();
            } else {
              setConfirmationOpen(false);
            }
          }}
          ok_btn={true}
          confirming={confirmationLoading}
        />
      )}
    </>
  );
};
