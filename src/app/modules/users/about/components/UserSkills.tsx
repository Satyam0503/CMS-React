import { Card, Chip, Stack, Typography } from "@mui/material";
import { FC, useState } from "react";
import { useIntl } from "react-intl";
import { AddUpdateSkills } from "./AddUpdateSkills";
import { CustomIconButton } from "../../../components/CustomIconButton";
import { Add } from "@mui/icons-material";

interface PropsTypes {
  skills: string[];
}

export const UserSkills: FC<PropsTypes> = ({ skills }) => {
  const intl = useIntl();
  const [open, setOpen] = useState(false);

  return (
    <Card sx={{ p: 2 }}>
      <Stack
        direction="row"
        display={"flex"}
        justifyContent={"space-between"}
        mb={1}
      >
        <Typography variant="h5">
          {intl.formatMessage({ id: "PROFILE.SKILLS" })}
        </Typography>
        <CustomIconButton
          icon={<Add />}
          tooltip="Add"
          handleClick={() => setOpen(true)}
        />
      </Stack>

      <Stack direction="row" gap={1} flexWrap={"wrap"}>
        {skills?.length === 0 ? (
          <Typography variant="body2">
            {intl.formatMessage({ id: "ADD.SKILLS" })}
          </Typography>
        ) : (
          skills?.map((skill, index) => <Chip key={index} label={skill} />)
        )}
      </Stack>

      {open && (
        <AddUpdateSkills open={open} setOpen={setOpen} userSkills={skills} />
      )}
    </Card>
  );
};
