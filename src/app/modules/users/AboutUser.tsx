import {
  Add,
  CalendarMonth,
  Delete,
  DeleteOutline,
  Edit,
  ModeEdit,
  School,
  SchoolTwoTone,
} from "@mui/icons-material";
import { Card, Chip, Grid, Stack, TextField, Typography } from "@mui/material";
import { useIntl } from "react-intl";
import UpdateUserInfo from "./UpdateUserInfo";
import Skills from "./Skills";
import Education from "./Education";
import Certification from "./Certification";
import Employment from "./Employment";
import { useUserDetails } from "./UserDataProvider";
import { AddUpdateUserSummary } from "./AddUpdateUserSummary";
import { useState } from "react";

export default function AboutUser() {
  const intl = useIntl();
  const [isUserUpdateModalOpen,setUserUpdateModalOpen ]= useState(false);
  const userData= useUserDetails();
  const currentUser= userData?.userDetails;
  const handleDelete = () => {
    console.info("You clicked the delete icon.");
  };
  return (
    <Grid container className="d-flex gap-5 mt-2">
      <Grid item sm={12}>
        <Card className="p-5">
          <Stack direction="row" className="d-flex justify-content-between mb-4">
            <Stack>
              <Typography variant="h5">
                {currentUser?.jobRole}
              </Typography>
            </Stack>
            <Stack>
              <AddUpdateUserSummary/>
            </Stack>
          </Stack>
          <Typography variant="body2">{currentUser?.summary || "Add Your Summary"}</Typography>
        </Card>
      </Grid>
      <Card className="w-100 p-5">
        <Stack direction="row" className="d-flex justify-content-between  mb-4">
          <Stack>
            <Typography variant="h5">
              {intl.formatMessage({ id: "PROFILE.PI" })}
            </Typography>
          </Stack>
          <Stack onClick={() =>setUserUpdateModalOpen(true)} className="btn btn-sm bg-white border btn-active-light-primary p-1">
            <Edit />
          </Stack>
          {
            isUserUpdateModalOpen && <UpdateUserInfo open={isUserUpdateModalOpen} setOpen={setUserUpdateModalOpen}/>
          }
        </Stack>
        <Grid container>
          <Grid item xs={12}>
            <Typography variant="body2" className="text-muted">
              Address
            </Typography>
            <Typography>NA</Typography>
          </Grid>

          <Grid container spacing={4}>
            <Grid item xs={6}>
              <Typography variant="body2" className="text-muted">
                Email
              </Typography>
              <Typography variant="body1">NA</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" className="text-muted">
                Phone number
              </Typography>
              <Typography variant="body1">NA</Typography>
            </Grid>
          </Grid>
          <Grid container spacing={4}>
            <Grid item xs={6}>
              <Typography variant="body2" className="text-muted">
                Date of birth
              </Typography>
              <Typography>NA</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" className="text-muted">
                Gender
              </Typography>
              <Typography>NA</Typography>
            </Grid>
          </Grid>
          <Grid container spacing={4}>
            <Grid item xs={6}>
              <Typography variant="body2" className="text-muted">
                Languages Known
              </Typography>
              <Typography>NA</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" className="text-muted">
                Date of joining
              </Typography>
              <Typography>NA</Typography>
            </Grid>
          </Grid>
          <Grid container spacing={4}>
            <Grid item xs={6}>
              <Typography variant="body2" className="text-muted">
                Employee ID
              </Typography>
              <Typography>NA</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" className="text-muted">
                Department
              </Typography>
              <Typography>NA</Typography>
            </Grid>
          </Grid>
          <Grid container spacing={4}>
            <Grid item xs={6}>
              <Typography variant="body2" className="text-muted">
                Reporting Manager
              </Typography>
              <Typography>NA</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" className="text-muted">
                Team Lead
              </Typography>
              <Typography>NA</Typography>
            </Grid>
          </Grid>
          <Grid container spacing={4}>
            <Grid item xs={6}>
              <Typography variant="body2" className="text-muted">
                Personal Email
              </Typography>
              <Typography>NA</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" className="text-muted">
                Emergency Contact
              </Typography>
              <Typography>NA</Typography>
            </Grid>
          </Grid>
          <Grid container spacing={4}>
            <Grid item xs={6}>
              <Typography variant="body2" className="text-muted">
                Blood Group
              </Typography>
              <Typography>NA</Typography>
            </Grid>
          </Grid>
        </Grid>
      </Card>
      <Card className="w-100 p-5">
        <Stack direction="row" className="d-flex justify-content-between mb-4">
          <Stack>
            <Typography variant="h5" className="text-primary">
              {intl.formatMessage({ id: "PROFILE.SKILLS" })}
            </Typography>
          </Stack>

          <Stack>
            <Skills />
          </Stack>
        </Stack>

        <Stack direction="row" spacing={1} className="skills-chips">
          <Chip
            label=".Net"
            variant="filled"
            color="primary"
            size="small"
            onDelete={handleDelete}
          />
          <Chip
            label="SQL Server"
            variant="filled"
            color="primary"
            size="small"
            onDelete={handleDelete}
          />
          <Chip
            label="Web API"
            variant="filled"
            color="primary"
            size="small"
            onDelete={handleDelete}
          />
          <Chip
            label="Javascript"
            variant="filled"
            color="primary"
            size="small"
            onDelete={handleDelete}
          />
        </Stack>
      </Card>
      <Card className="w-100 p-5">
        <Stack direction="row" className="d-flex justify-content-between mb-4">
          <Stack>
            <Typography variant="h5" className="text-primary">
              {intl.formatMessage({ id: "PROFILE.EDUCATION" })}
            </Typography>
          </Stack>

          <Stack>
            <Education />
          </Stack>
        </Stack>

        <Stack
          direction="row"
          className="mb-2 d-flex justify-content-between align-items-center"
        >
          <Stack direction="row" alignItems={"center"}>
            <School className="me-4" />
            <Stack>
              <Typography
                variant="body1"
                className="text-gray-800 text-hover-primary fw-semibold "
              >
                Degree in Bachelor of Computer Science
              </Typography>
              <Stack direction="row" spacing={1}>
                <Typography variant="body2" className="fw-semibold d-block ">
                  Graphic Era Hill, Dehradun
                </Typography>
                <Typography
                  variant="body2"
                  className="text-muted fw-semibold d-block "
                >
                  <CalendarMonth sx={{ height: "14px" }} />
                  Jan 2012- June 2016
                </Typography>
              </Stack>
            </Stack>
          </Stack>
          <Stack direction="row">
            <Stack>
              <Education />
            </Stack>
            <Stack className="btn btn-sm bg-white border btn-active-light-danger p-1 ms-3">
              <DeleteOutline />
            </Stack>
          </Stack>
        </Stack>

        <Stack
          direction="row"
          className="mb-2 d-flex justify-content-between align-items-center"
        >
          <Stack direction="row" alignItems={"center"}>
            <School className="me-4" />
            <Stack>
              <Typography
                variant="body1"
                className="text-gray-800 text-hover-primary fw-semibold "
              >
                Higher Secondary
              </Typography>
              <Stack direction="row" spacing={1}>
                <Typography variant="body2" className="fw-semibold d-block ">
                  ABC School, Mussoorie
                </Typography>
                <Typography
                  variant="body2"
                  className="text-muted fw-semibold d-block "
                >
                  <CalendarMonth sx={{ height: "14px" }} />
                  Jan 2010- June 2012
                </Typography>
              </Stack>
            </Stack>
          </Stack>
          <Stack direction="row">
            <Stack>
              <Education />
            </Stack>
            <Stack className="btn btn-sm bg-white border btn-active-light-danger p-1 ms-3">
              <DeleteOutline />
            </Stack>
          </Stack>
        </Stack>
      </Card>
      <Card className="w-100 p-5">
        <Stack direction="row" className="d-flex justify-content-between mb-4">
          <Stack>
            <Typography variant="h5" className="text-primary">
              {intl.formatMessage({ id: "PROFILE.CERTIFICATION" })}
            </Typography>
          </Stack>

          <Stack>
            <Stack>
              <Certification />
            </Stack>
          </Stack>
        </Stack>

        <Stack
          direction="row"
          className="mb-2 d-flex justify-content-between align-items-center"
        >
          <Stack direction="row" alignItems={"center"}>
            <School className="me-4" />
            <Stack>
              <Typography
                variant="body1"
                className="text-gray-800 text-hover-primary fw-semibold "
              >
                Certification in AI Prompt
              </Typography>
              <Stack direction="row" spacing={1}>
                <Typography variant="body2" className="fw-semibold d-block ">
                  ChatGPT, Online
                </Typography>
                <Typography
                  variant="body2"
                  className="text-muted fw-semibold d-block "
                >
                  <CalendarMonth sx={{ height: "14px" }} />
                  Mar 2022- Mar 2022
                </Typography>
              </Stack>
            </Stack>
          </Stack>
          <Stack direction="row">
            <Stack>
              <Certification />
            </Stack>
            <Stack className="btn btn-sm bg-white border btn-active-light-danger ms-3 p-1">
              <DeleteOutline />
            </Stack>
          </Stack>
        </Stack>
      </Card>
    </Grid>
  );
}
