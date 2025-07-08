import { Add } from "@mui/icons-material";
import {
  Box,
  Button,
  FormControl,
  Grid,
  MenuItem,
  Modal,
  Select,
  SelectChangeEvent,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import React, { FC, useState } from "react";

import { useIntl } from "react-intl";
import CustomisedDatePicker from "../../../../shared/components/CustomisedDatePicker";
import CustomisedButton from "../../../../shared/components/CustomisedButton";
import { CustomisedModal } from "../../../../shared/components/CustomisedModal";
import { LeaveType, RequestLeaveModel } from "../../../leaves/model";
import { LEAVE_TYPE } from "../../../../../utils/enums";
import { Formik } from "formik";
import { leaveRequestValidationSchema } from "../../../../../utils/Schema/leaveManagementValidationSchemas";
import { SelectInput } from "../../../../shared/components/form-component/SelectInput";
import { LeaveTypeMapper } from "../../../../../utils/common";
import { TextInput } from "../../../../shared/components/form-component/TextInput";


const initialLeaveRequestValue: RequestLeaveModel = {
  leaveType: LEAVE_TYPE.CASUAL_LEAVE,
  isHalfDay: false,
  startDate: null,
  endDate: null,
  totalDays: 0,
  reason: "",
}

type Props = {
  open: boolean;
  handleClose: () => void;
}

export const LeaveApplication: FC<Props> = (props) => {
  const { formatMessage: i } = useIntl();
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);

  return (
    <CustomisedModal open={props.open} handleClose={props.handleClose}>
      <Typography variant="h5" className="mb-4">{i({ id: "APPLICATION.LEAVE" })}</Typography>
      <Formik
        initialValues={initialLeaveRequestValue}
        validationSchema={leaveRequestValidationSchema}
        onSubmit={(values) => {
          console.log(values);

        }}
      >
        {
          ({ values, handleSubmit, setFieldValue, ...formik }) => (
            <form onSubmit={handleSubmit} >
              <Grid container spacing={2}>
                <Grid item xs={12} >
                  <SelectInput name="leaveType" label={i({ id: "LEAVE_TYPE" })}>
                    {leaveTypes.map(type => (
                      <MenuItem key={type.leaveTypeId} value={type.leaveType}>{i({ id: LeaveTypeMapper[type.leaveType] })} </MenuItem>
                    ))}
                  </SelectInput>
                </Grid>
                <Grid item xs={12} sm={6} >
                  <CustomisedDatePicker label={i({ id: "START_DATE" })} value={values.startDate} />
                </Grid>
                <Grid item xs={12} sm={6} >
                  <CustomisedDatePicker label={i({ id: "END_DATE" })} value={values.endDate} />
                </Grid>
                <Grid item xs={12} >
                  <TextInput multiline={true} type="text" name="reason" label={i({ id: "REASON" })} />
                </Grid>
              </Grid>
              <Grid item className="d-flex gap-2 flex-row justify-content-end mt-4">
                <CustomisedButton variant="outlined" label={i({ id: "BUTTON.CANCEL" })} handleClick={props.handleClose} />
                <CustomisedButton label={i({ id: "BUTTON.APPLY" })} />
              </Grid>
            </form>
          )
        }
      </Formik>

    </CustomisedModal>
  );
};
