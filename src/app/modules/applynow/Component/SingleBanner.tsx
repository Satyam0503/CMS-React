import { Stack, Typography } from "@mui/material";
import Wave from "react-wavify";

type Props = {
  title?: string;
  titleorange?: string;
  path?: string;
};

export function SingleBanner({ title, titleorange, path }: Props) {
  return (
    <Stack className="banner-wave">
      <Stack
        className="single_banner"
        direction={"row"}
        sx={{
          justifyContent: "center",
          gap: 1
        }}>
        <Typography
          variant="h2"
          sx={{
            color: "common.white",
            my: 2
          }}>
          Apply
        </Typography>
        <Typography
          variant="h2"
          sx={{
            color: "secondary.main",
            my: 2
          }}>
          Now
        </Typography>
      </Stack>
      <Wave
        className="wave_banner"
        fill="#35126c"
        paused={false}
        options={{
          height: 40,
          amplitude: 40,
          speed: 0.21,
          points: 4,
        }}
      />
    </Stack>
  );
}
