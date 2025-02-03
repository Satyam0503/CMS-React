// .zoom {
//   padding: 50px;
//   background-color: green;
//   transition: transform .2s;
//   width: 200px;
//   height: 200px;
//   margin: 0 auto;
// }

// .zoom:hover {
//   -ms-transform: scale(1.5); /* IE 9 */
//   -webkit-transform: scale(1.5); /* Safari 3-8 */
//   transform: scale(1.5);
// }

// <div class="zoom"></div>

import React, { useState } from "react";
import { Avatar, Card, Grid, Stack, Typography } from "@mui/material";
import { CustomIconButton, CustomisedButton } from "./YourComponent"; // Assuming CustomIconButton and CustomisedButton are already defined
import { Visibility } from "@mui/icons-material"; // Assuming you are using MUI icons
import { Image } from "@mui/icons-material"; // Same for the Image icon
import { Download } from "@mui/icons-material"; // Same for Download

const YourComponent = () => {
  const [isAvatarZoomedOut, setIsAvatarZoomedOut] = useState(false);
  const [open, setOpen] = useState(false); // Assuming setOpen is needed for the image modal

  return (
    <Card
      sx={{
        width: "100%",
        bgcolor: colors.alpha.primary[500],
        alignItems: "center",
        display: "flex",
        flexDirection: "column",
        gap: 2,
        p: 2,
      }}
    >
      <Grid
        container
        display={"flex"}
        justifyContent={"center"}
        alignItems={"center"}
        p={1}
        sx={{
          height: "150px",
          width: "150px",
          border: "1px solid white",
          borderRadius: "50%",
          position: "relative",
          transition: "transform 0.3s ease-in-out", // Add smooth transition
          "&:hover img": {
            opacity: 0.2,
            zIndex: 1,
          },
        }}
      >
        <Avatar
          alt="profile picture"
          src="media/avatars/300-6.jpg"
          sx={{
            width: "100%",
            height: "100%",
            transform: isAvatarZoomedOut ? "scale(0.7)" : "scale(1)", // Scale down on click
          }}
        />

        <Stack className="coverChange" direction={"row"} gap={1} zIndex={3}>
          <CustomIconButton
            handleClick={() => setOpen(true)}
            icon={
              <Image
                sx={{
                  color: "white",
                  "&:hover": {
                    color: colors.alpha.primary[500],
                  },
                }}
              />
            }
          />
          <CustomIconButton
            handleClick={() => setIsAvatarZoomedOut((prev) => !prev)} // Toggle zoom
            icon={
              <Visibility
                sx={{
                  color: "white",
                  "&:hover": {
                    color: colors.alpha.primary[500],
                  },
                }}
              />
            }
          />
        </Stack>
      </Grid>

      <Stack textAlign={"center"} alignItems={"center"}>
        <Typography variant="h5" color={"white"} mb={0.5}>
          {user?.firstName + " " + user?.lastName}
        </Typography>
        <Typography
          variant="body2"
          color={"white"}
          borderRadius={2}
          py={0.5}
          px={1}
          sx={{
            backgroundColor: alpha(lighten(colors.alpha.white[500], 0.2), 0.2),
          }}
        >
          {userPersonalDetails.jobRole || "NA"}
        </Typography>
      </Stack>
      <Stack
        display={"flex"}
        direction={"row"}
        justifyContent={"space-around"}
        textAlign={"center"}
        width={"100%"}
      >
        <Stack>
          <Typography variant="h2" color={"white"}>
            {getAgeInYears(userPersonalDetails.dateOfBirth!) || "NA"}
          </Typography>
          <Typography variant="body2" color={"white"}>
            {intl.formatMessage({ id: "USER.AGE" })}
          </Typography>
        </Stack>
        <Stack>
          <Typography variant="h2" color={"white"}>
            {userPersonalDetails.bloodGroup || "NA"}
          </Typography>
          <Typography variant="body2" color={"white"}>
            {intl.formatMessage({ id: "USER.BLOOD_GROUP" })}
          </Typography>
        </Stack>
      </Stack>
      <CustomisedButton
        variant="contained"
        Icon={<Download />}
        iconPosition="start"
        label="Salary slip"
      />
    </Card>
  );
};

export default YourComponent;
