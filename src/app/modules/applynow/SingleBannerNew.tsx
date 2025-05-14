import { Stack, Typography } from "@mui/material";
import Wave from "react-wavify";

type Props = {
  title: string;
  titleorange: string;
  path?: string;
};

export function SingleBannerNew({ title, titleorange, path }: Props) {
  return (
    <>
      <Stack className="banner-wave">
        <Stack className="single_banner">
          <Typography variant="h2" color="common.white" mb={2} mt={6}>
            Apply Now
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
    </>
  );
}
