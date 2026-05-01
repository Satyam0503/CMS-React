import { Check, VisibilityOffOutlined, VisibilityOutlined } from "@mui/icons-material"
import { Grid, Stack, InputAdornment } from "@mui/material"
import CustomisedButton from "../../../../shared/components/CustomisedButton"
import { CustomisedModal } from "../../../../shared/components/CustomisedModal"
import { useIntl } from "react-intl"
import { toAbsoluteUrl } from "../../../../../_themes/helpers"
import { useState } from "react"
import { changePassword } from "../../userservices"
import { Formik } from "formik"
import { ChangePasswordPayload } from "../../models"
import { changePasswordSchema } from "../../../../../utils/Schema/registrationSchema"
import { TextInput } from "../../../../shared/components/form-component/TextInput"
import { toast } from "react-toastify"
import { getStatusCodeString } from "../../../../../utils/common"
import { PasswordStrenghtMeter } from "../../../../shared/components/form-component/PasswordStrengthMeter"

type PropsType = {
    open: boolean,
    handleClose: () => void
}

const initialValues: ChangePasswordPayload = {
    oldPassword: "",
    newPassword: "",
    confirmPassword: ""
}

export const PasswordResetModel = ({ open, handleClose }: PropsType) => {
    const { formatMessage: i } = useIntl();
    const [showPassword, setShowPassword] = useState(false);

    const handleClickShowPassword = () => {
        setShowPassword(!showPassword);
    }
    const handleUpdate = async (values: ChangePasswordPayload, setSubmitting: (isSubmitting: boolean) => void) => {
        try {
            const { data } = await changePassword({ oldPassword: values.oldPassword, newPassword: values.newPassword });
            if (data.success) {
                toast.success(i({ id: "TOAST.SUCCESS.PASSWORD_UPDATED" }))
                handleClose();
            }
            else {
                toast.error(i({ id: getStatusCodeString(data.statusCode) }))
            }
        } catch (error) {
            console.error((error as Error).message);
        } finally {
            setSubmitting(false);
        }
    }
    return (
        <CustomisedModal open={open} handleClose={handleClose}
            title={i({ id: "AUTH.RESET_PROFILE_PASSWORD" })}
        >
            <Formik
                initialValues={initialValues}
                validationSchema={changePasswordSchema}
                onSubmit={(values, { setSubmitting }) => {
                    handleUpdate(values, setSubmitting);
                }}
            >
                {
                    ({ isSubmitting, handleSubmit, ...formik }) => (
                        <form onSubmit={handleSubmit}>
                            <Grid container className="gap-4">
                                <Grid
                                    className="text-center"
                                    size={{
                                        xs: 12,
                                        sm: 5
                                    }}>
                                    <img
                                        src={toAbsoluteUrl("media/auth/confirmation.svg")}
                                        style={{
                                            maxWidth: "350px",
                                            width: "100%",
                                            marginInline: "auto"
                                        }}
                                    />
                                </Grid>
                                {/* <Divider /> */}
                                <Grid
                                    className="d-flex flex-column gap-4"
                                    size={{
                                        xs: 12,
                                        sm: 6.5
                                    }}>
                                    <TextInput
                                        label={i({ id: "AUTH.OLD_PASSWORD" })}
                                        placeholder={i({ id: "AUTH.OLD_PASSWORD" })}
                                        name="oldPassword"
                                        type="text"
                                    />
                                    <Stack spacing={1}>
                                        <TextInput
                                            label={i({ id: "AUTH.NEW_PASSWORD" })}
                                            placeholder={i({ id: "AUTH.NEW_PASSWORD" })}
                                            name="newPassword"
                                            type="password"
                                        />
                                        <PasswordStrenghtMeter password={formik.values.newPassword} />
                                    </Stack>

                                    <TextInput
                                        label={i({ id: "AUTH.CONFIRM_PASSWORD" })}
                                        placeholder={i({ id: "AUTH.CONFIRM_PASSWORD" })}
                                        type={showPassword ? "text" : "password"}
                                        name="confirmPassword"
                                        InputProps={{
                                            endAdornment: (
                                                <InputAdornment position="end" className="pointer-cursor" >
                                                    {showPassword ? (
                                                        <VisibilityOutlined onClick={handleClickShowPassword} />
                                                    ) : (
                                                        <VisibilityOffOutlined onClick={handleClickShowPassword} />
                                                    )}
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                    <Grid className="d-flex flex-row align-self-end gap-2 mt-2" size={12}>
                                        <CustomisedButton
                                            label={i({ id: "BUTTON.CANCEL" })}
                                            variant="outlined"
                                            handleClick={handleClose}
                                        />
                                        <CustomisedButton
                                            label={i({ id: "BUTTON.UPDATE" })}
                                            variant="contained"
                                            type="submit"
                                            Icon={<Check />}
                                            loading={isSubmitting}
                                            disabled={isSubmitting}
                                        />
                                    </Grid>
                                </Grid>


                            </Grid>
                        </form>
                    )
                }
            </Formik>
        </CustomisedModal >
    );
}