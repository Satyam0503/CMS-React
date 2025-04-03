import { FC } from "react";
import { CustomisedModal } from "../../../../shared/components/CustomisedModal";
import { Stack, Typography } from "@mui/material";
import CustomisedButton from "../../../../shared/components/CustomisedButton";
import { useIntl } from "react-intl";
import { AddDepartmentPayloadModel } from "../../models";
import { Formik } from "formik";

interface Props {
    open:true;
    handleClose:()=>void;
    isEdit:boolean
}
const initialValues:AddDepartmentPayloadModel={
    departmentName:"",
    departmentDescription:""
}

const AddEditDepartment:FC<Props> = ({open,handleClose,isEdit})=>{
    const intl = useIntl();
    return (
        <CustomisedModal open={open} handleClose={handleClose}  >
            <Typography variant="h5" className="mb-5">
                {intl.formatMessage({id:"COMPANY_MASTER.ADD_DEPARTMENT"})}
            </Typography>
            <Formik
                initialValues={initialValues}
                onSubmit={()=>{
                    
                }}
            >

            </Formik>
            <Stack direction={"row"} spacing={1} className="justify-content-end">
                <CustomisedButton
                    label={intl.formatMessage({id:"BUTTON.CLOSE"}) }
                    handleClick={handleClose}
                    variant="outlined"
                />
                <CustomisedButton
                    label={intl.formatMessage({id:isEdit ?"BUTTON.UPDATE": "BUTTON.ADD"}) }
                    handleClick={handleClose}
                />

            </Stack>
        </CustomisedModal>
    )
}
export {AddEditDepartment}