import { TextField, Button } from "@mui/material";
import { Grid, Stack } from "@mui/system";
import React from "react";
import DoneRoundedIcon from "@mui/icons-material/DoneRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import { useIntl } from "react-intl";

type Props = {
  handleFolderNameChange: (value: string) => void;
  handleSaveFolder: () => void;
  handleCloseCreatePolicy: () => void;
  name?: string;
};

export default function CreateEditPolicyfolder(props: Props) {
  const { formatMessage: i } = useIntl();
  console.log(props.name);

  return (
    <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
      <Stack spacing={4} className="policy-folder">
        <TextField
          id="outlined-basic"
          label={i({ id: "Name" })}
          variant="outlined"
          sx={{ width: "80%" }}
          onChange={(e) => props.handleFolderNameChange(e.target.value)}
          defaultValue={props.name}
        />
        <Stack spacing={1} direction={"row"}>
          <Button
            className="success"
            sx={{ width: "80px" }}
            onClick={() => {
              props.handleSaveFolder();
              props.handleCloseCreatePolicy();
            }}
          >
            <DoneRoundedIcon />
            {i({ id: "BUTTON.SAVE" })}
          </Button>
          <Button
            className="danger"
            sx={{ width: "80px" }}
            onClick={props.handleCloseCreatePolicy}
          >
            <DeleteRoundedIcon />
            {i({ id: "BUTTON.CANCEL" })}
          </Button>
        </Stack>
      </Stack>
    </Grid>
  );
}
