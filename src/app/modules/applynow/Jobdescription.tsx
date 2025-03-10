import { Typography, Grid, Stack, Card, CardContent } from "@mui/material";
import { useIntl } from "react-intl";
import { HourglassTop } from "@mui/icons-material";
import { colors } from "../theme/MuiTheme";
import IconStat from "../components/IconStat";

type Props = {
  className: string;
};

export default function JobDescription() {
  const intl = useIntl();

  return (
    <>
      <Grid container>
        <Grid item xs={4}>
          <Card>
            <CardContent>
              <Stack sx={{ alignItems: "center" }}>
                <IconStat
                  iconBg={colors.alpha.primary[100]}
                  icon={<HourglassTop fontSize="large" />}
                  iconColor={colors.alpha.primary[500]}
                />
                <Typography variant="body1" textAlign={"center"}>
                  Full Stack developer
                </Typography>
                <Typography variant="body2" textAlign={"center"}>
                  2 Positions
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={4}>
          <Card>
            <CardContent>
              <Stack sx={{ alignItems: "center" }}>
                <IconStat
                  iconBg={colors.alpha.primary[100]}
                  icon={<HourglassTop fontSize="large" />}
                  iconColor={colors.alpha.primary[500]}
                />
                <Typography variant="body1" textAlign={"center"}>
                  Full Stack developer
                </Typography>
                <Typography variant="body2" textAlign={"center"}>
                  2 Positions
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={4}>
          <Card>
            <CardContent>
              <Stack sx={{ alignItems: "center" }}>
                <IconStat
                  iconBg={colors.alpha.primary[100]}
                  icon={<HourglassTop fontSize="large" />}
                  iconColor={colors.alpha.primary[500]}
                />
                <Typography variant="body1" textAlign={"center"}>
                  Full Stack developer
                </Typography>
                <Typography variant="body2" textAlign={"center"}>
                  2 Positions
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={4}>
          <Card>
            <CardContent>
              <Stack sx={{ alignItems: "center" }}>
                <IconStat
                  iconBg={colors.alpha.primary[100]}
                  icon={<HourglassTop fontSize="large" />}
                  iconColor={colors.alpha.primary[500]}
                />
                <Typography variant="body1" textAlign={"center"}>
                  Full Stack developer
                </Typography>
                <Typography variant="body2" textAlign={"center"}>
                  2 Positions
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={4}>
          <Card>
            <CardContent>
              <Stack sx={{ alignItems: "center" }}>
                <IconStat
                  iconBg={colors.alpha.primary[100]}
                  icon={<HourglassTop fontSize="large" />}
                  iconColor={colors.alpha.primary[500]}
                />
                <Typography variant="body1" textAlign={"center"}>
                  Full Stack developer
                </Typography>
                <Typography variant="body2" textAlign={"center"}>
                  2 Positions
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={4}>
          <Card>
            <CardContent>
              <Stack sx={{ alignItems: "center" }}>
                <IconStat
                  iconBg={colors.alpha.primary[100]}
                  icon={<HourglassTop fontSize="large" />}
                  iconColor={colors.alpha.primary[500]}
                />
                <Typography variant="body1" textAlign={"center"}>
                  Full Stack developer
                </Typography>
                <Typography variant="body2" textAlign={"center"}>
                  2 Positions
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      <Grid container p={5}>
        <Typography variant="body2">
          Lorem ipsum is a dummy or placeholder text commonly used in graphic
          design, publishing, and web development to fill empty spaces in a
          layout that does not yet have content. Lorem ipsum is typically a
          corrupted version of De finibus bonorum et malorum, a 1st-century BC
          text by the Roman statesman and philosopher Cicero, with words
          altered, added, and removed to make it nonsensical and improper Latin.
          The first two words themselves are a truncation of dolorem ipsum.
          Lorem ipsum is a dummy or placeholder text commonly used in graphic
          design, publishing, and web development to fill empty spaces in a
          layout that does not yet have content. Lorem ipsum is typically a
          corrupted version of De finibus bonorum et malorum, a 1st-century BC
          text by the Roman statesman and philosopher Cicero, with words
          altered, added, and removed to make it nonsensical and improper Latin.
          The first two words themselves are a truncation of dolorem ipsum.
        </Typography>
      </Grid>
    </>
  );
}
