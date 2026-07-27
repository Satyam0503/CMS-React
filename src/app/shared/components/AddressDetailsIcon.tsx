import { Place } from "@mui/icons-material";
import { CustomIconButton } from "./C_IconButton";
import { CustomisedModal } from "./C_Modal";
import { Stack, Typography } from "@mui/material";
import CustomisedButton from "./C_Button";
import { useState } from "react";

export const AddressDetailsIcon = (props: { address: string }) => {
  const [open, setOpen] = useState(false);
  function handleClose() {
    setOpen(false);
  }
  return (
    <>
      <CustomIconButton
        handleClick={() => setOpen(true)}
        icon={<Place />}
        tooltip="Address"
        ariaLabel="Address"
      />
      <CustomisedModal open={open} handleClose={handleClose}>
        <Stack spacing={2}>
          <Typography variant="h5">Address</Typography>
          <Typography>{props.address}</Typography>
          <Stack sx={{ alignSelf: "flex-end" }}>
            <CustomisedButton label="Close" handleClick={handleClose} />
          </Stack>
        </Stack>
      </CustomisedModal>
    </>
  );
};
