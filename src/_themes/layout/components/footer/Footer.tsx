import { useEffect } from "react";
import { useLayout } from "../../core";
import { Grid, Link, Stack, Typography } from "@mui/material";

const Footer = () => {
  const { config } = useLayout();
  useEffect(() => { }, [config]);
  return (
    <>
      <Grid
        className="app-footer"
        container
        display={"flex"}
        justifyContent={"space-between"}
        px={{ xs: 2, md: 3 }}
        alignItems={"center"}
        bgcolor="background.header"
        color="text.secondary"
        sx={{
          height: "var(--app-footer-height)",
          minHeight: "var(--app-footer-height)",
          borderTop: "1px solid",
          borderColor: "divider",
          position: "relative",
          zIndex: 1300,
        }}
      >
        <Link href="https://codeji.in/" sx={{ textDecoration: "none" }}>
          <Typography variant="body2" color="text.secondary" fontWeight={500}>
            {" "}
            Codeji Infotech Pvt Ltd
          </Typography>
        </Link>

        <Stack direction={"row"} gap={{ xs: 1.5, sm: 3 }}>
          <Link href="https://codeji.in/contact-us/" target="_blank" rel="noopener noreferrer" sx={{ textDecoration: "none" }}>
            <Typography variant="body2" color="text.secondary" fontWeight={500}>
              {" "}
              About
            </Typography>
          </Link>
          <Link href="https://codeji.in/" sx={{ textDecoration: "none" }}>
            <Typography variant="body2" color="text.secondary" fontWeight={500}>
              Support
            </Typography>
          </Link>

          <Link href="https://codeji.in/" sx={{ textDecoration: "none" }}>
            <Typography variant="body2" color="text.secondary" fontWeight={500}>
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
