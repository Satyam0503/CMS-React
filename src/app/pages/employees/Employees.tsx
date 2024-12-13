import { FC } from "react";
import { PageTitle } from "../../../_themes/layout/core";
import { useIntl } from "react-intl";
import { Grid } from "@mui/material";
import Employees from "../../modules/employees/Employees";

const BuilderPageWrapper: FC = () => {
  const intl = useIntl();
  return (
    <>
      <Grid container>
        <PageTitle breadcrumbs={[]}>
          {intl.formatMessage({ id: "MENU.CONTACTS" })}
        </PageTitle>
        <Employees />
      </Grid>
    </>
  );
};

export default BuilderPageWrapper;
