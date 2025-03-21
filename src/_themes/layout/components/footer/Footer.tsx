import { useEffect } from "react";
import { ILayout, useLayout } from "../../core";
import { Container, Grid, Link, List, Stack, Typography } from "@mui/material";
import { colors } from "../../../../app/modules/theme/MuiTheme";

const Footer = () => {
  const { config } = useLayout();
  useEffect(() => {}, [config]);
  return (
    <>
      <Grid
        container
        display={"flex"}
        justifyContent={"space-between"}
        p={2}
        pb={0}
      >
        <Link href="https://codeji.in/" sx={{ textDecoration: "none" }}>
          <Typography
            variant="body1"
            color={colors.alpha.neutral[400]}
            fontWeight={400}
          >
            {" "}
            Codeji Infotech Pvt Ltd
          </Typography>
        </Link>

        <Stack direction={"row"} gap={4}>
          <Link href="https://codeji.in/" sx={{ textDecoration: "none" }}>
            <Typography
              variant="body1"
              color={colors.alpha.neutral[600]}
              fontWeight={400}
            >
              {" "}
              About
            </Typography>
          </Link>
          <Link href="https://codeji.in/" sx={{ textDecoration: "none" }}>
            <Typography
              variant="body1"
              color={colors.alpha.neutral[600]}
              fontWeight={400}
            >
              Support
            </Typography>
          </Link>

          <Link href="https://codeji.in/" sx={{ textDecoration: "none" }}>
            <Typography
              variant="body1"
              color={colors.alpha.neutral[600]}
              fontWeight={400}
            >
              Purchase
            </Typography>
          </Link>
        </Stack>
      </Grid>
    </>
  );
};

// const updateDOM = (config: ILayout) => {
//   if (config.app?.footer?.fixed?.desktop) {
//     document.body.classList.add("data-kt-app-footer-fixed", "true");
//   }

//   if (config.app?.footer?.fixed?.mobile) {
//     document.body.classList.add("data-kt-app-footer-fixed-mobile", "true");
//   }
// };

export { Footer };
