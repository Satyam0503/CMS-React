import { Box, Grid } from "@mui/system";
import React from "react";
import PolicyRoundedIcon from "@mui/icons-material/PolicyRounded";
import { MoreVertOutlined } from "@mui/icons-material";
import { IconButton, Typography } from "@mui/material";
import { PolicyResponseStructure } from "../models";

type Props = {
  policyVersion: PolicyResponseStructure;
  handleActionButtonClick: (
    event: React.MouseEvent<HTMLElement>,
    policy: PolicyResponseStructure
  ) => void;
  handleClick: (policy: PolicyResponseStructure) => void;
};

export default function SelectedPoliciesListing(props: Props) {
  return (
    <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
      <Box
        component={"div"}
        className="policy-file"
        onClick={() => props.handleClick(props.policyVersion)}
      >
        <Box
          component={"div"}
          sx={{ display: "flex", gap: "5px", minWidth: "60px" }}
        >
          <PolicyRoundedIcon />
          <Typography
            variant="body1"
            color="initial"
            sx={{
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              overflow: "hidden",
            }}
          >
            {props.policyVersion.versionName}
          </Typography>
        </Box>
        <IconButton
          sx={{
            border: "none",
          }}
          id="policy-action-button"
          onClick={(e) => {
            e.stopPropagation();
            props.handleActionButtonClick(e, props.policyVersion);
          }}
        >
          <MoreVertOutlined />
        </IconButton>
      </Box>
    </Grid>
  );
}
