import {
  Add,
  EditOutlined,
  FileOpenOutlined,
  LinkOutlined,
  Visibility,
} from "@mui/icons-material";
import { Grid, IconButton, Stack, Typography } from "@mui/material";
import { useState } from "react";
import { useIntl } from "react-intl";
import { CustomisedModal } from "../../../modules/components/CustomisedModal";
import CustomisedButton from "../../../modules/components/CustomisedButton";

export default function JobDetail() {
  const intl = useIntl();

  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <Grid container>
      <IconButton onClick={() => setOpen(true)}>
        <Visibility />
      </IconButton>
      <CustomisedModal open={open} handleClose={handleClose}>
        <Grid container display={"flex"} direction={"column"} gap={1}>
          <Grid item xs={12}>
            <Typography variant="h5">
              {intl.formatMessage({ id: "POSITION.DOT_NET" })}
            </Typography>
          </Grid>
          <Grid item xs={12} display={"flex"}>
            <Grid item xs={6}>
              <Typography variant="body1">
                {intl.formatMessage({ id: "USER.ROLE" })}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body1">USER.ROLE</Typography>
            </Grid>
          </Grid>
          <Grid item xs={12} display={"flex"}>
            <Grid item xs={6}>
              <Typography variant="body1">
                {intl.formatMessage({ id: "JOB.LEVEL" })}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body1">USER.ROLE</Typography>
            </Grid>
          </Grid>
          <Grid item xs={12} display={"flex"}>
            <Grid item xs={6}>
              <Typography variant="body1">
                {intl.formatMessage({ id: "JOB.VACANCIES" })}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body1">USER.ROLE</Typography>
            </Grid>
          </Grid>
          <Grid item xs={12} display={"flex"}>
            <Grid item xs={6}>
              <Typography variant="body1">
                {intl.formatMessage({ id: "USER.DEPARTMENT" })}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body1">USER.ROLE</Typography>
            </Grid>
          </Grid>
          <Grid item xs={12} display={"flex"}>
            <Grid item xs={6}>
              <Typography variant="body1">
                {intl.formatMessage({ id: "JOB.MODE" })}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body1">USER.ROLE</Typography>
            </Grid>
          </Grid>
          <Grid item xs={12} display={"flex"}>
            <Grid item xs={6}>
              <Typography variant="body1">
                {intl.formatMessage({ id: "JOB.TYPE" })}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body1">USER.ROLE</Typography>
            </Grid>
          </Grid>
          <Grid item xs={12} display={"flex"}>
            <Grid item xs={6}>
              <Typography variant="body1">
                {intl.formatMessage({ id: "USER.REPORTING_MANAGER" })}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body1">USER.ROLE</Typography>
            </Grid>
          </Grid>
          <Grid item xs={12} display={"flex"}>
            <Grid item xs={6}>
              <Typography variant="body1">
                {intl.formatMessage({ id: "JOB.REQ.QUALIFICATION" })}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body1">USER.ROLE</Typography>
            </Grid>
          </Grid>

          <Grid item xs={12} display={"flex"}>
            <Grid item xs={6}>
              <Typography variant="body1">
                {intl.formatMessage({ id: "PROFILE.STATUS" })}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body1">Active</Typography>
            </Grid>
          </Grid>
        </Grid>

        <hr />

        <Grid item>
          <Typography variant="body1">
            We are seeking an experienced Senior Java Developer to join our
            dynamic team. In this role, you will lead the design, development,
            and deployment of high-performance applications. You will
            collaborate with cross-functional teams to deliver robust and
            scalable software solutions, ensuring they meet business
            requirements and industry standards.
          </Typography>
          <Typography variant="h6"> Key Responsibilities:</Typography>
          <Typography variant="body1">
            Design and develop high-quality, scalable, and maintainable Java
            applications. Lead the end-to-end development process, from
            requirements gathering to deployment. Collaborate with stakeholders
            to understand business requirements and translate them into
            technical solutions. Write clean, efficient, and well-documented
            code following best practices. Conduct code reviews to ensure
            quality and compliance with development standards. Troubleshoot,
            debug, and optimize performance for existing systems. Mentor and
            guide junior developers, fostering a culture of continuous learning.
            Stay updated with the latest Java technologies and frameworks to
            implement innovative solutions.
          </Typography>
          <Typography variant="h6"> Requirements: Experience:</Typography>
          <Typography>
            5+ years of professional experience in Java development. Technical
            Skills: Proficiency in Java 8+, Spring Boot, Hibernate, and related
            frameworks. Strong understanding of RESTful APIs, microservices
            architecture, and database management (e.g., MySQL, PostgreSQL).
            Experience with front-end technologies (e.g., Angular, React) is a
            plus. Familiarity with CI/CD pipelines, Docker, and Kubernetes.
            Problem-Solving: Excellent analytical and problem-solving skills.
            Communication: Strong interpersonal and communication abilities,
            with experience in collaborating with diverse teams.
          </Typography>
          <Typography variant="h6"> What We Offer:</Typography>
          <Typography variant="body1">
            Competitive salary and performance bonuses. Flexible work
            arrangements, including hybrid or remote options. Opportunities for
            professional development and certifications. Collaborative and
            inclusive work culture. Comprehensive health and wellness benefits.
          </Typography>
        </Grid>
        <Grid
          item
          xs={12}
          display={"flex"}
          justifyContent={"flex-end"}
          mt={1}
          gap={1}
        >
          <CustomisedButton
            variant="outlined"
            size="medium"
            label="Page URL"
            Icon={<LinkOutlined />}
            iconPosition="start"
          />
          <CustomisedButton
            variant="contained"
            size="medium"
            label="Submissions"
            Icon={<FileOpenOutlined />}
            iconPosition="start"
          />
          <CustomisedButton variant="outlined" size="medium" label="Close " />
          <CustomisedButton
            variant="outlined"
            size="medium"
            label="Apply"
            Icon={<EditOutlined />}
            iconPosition="start"
          />
        </Grid>
      </CustomisedModal>
    </Grid>
  );
}
