import {
  Typography,
  Card,
  Grid,
  Stack,
  Button,
  TextField,
  InputAdornment,
} from "@mui/material";
import { useIntl } from "react-intl";
import { KTIcon, toAbsoluteUrl } from "../../../_themes/helpers";
import {
  AccountCircle,
  Add,
  Download,
  Filter,
  Filter1,
  SearchOutlined,
  Sort,
} from "@mui/icons-material";
import EmployeeTable from "./EmployeeTable";
import AddEmployee from "./AddEmployee";

type Props = {
  className: string;
};

export default function Employees() {
  const intl = useIntl();
  return (
    <>
      <Grid container sx={{ maxWidth: "1200px", m: "auto" }} spacing={2}>
        <Stack>
          <Typography variant="h4" className="mb-2">
            {intl.formatMessage({ id: "MENU.EMP" })}
          </Typography>
        </Stack>

        <Card sx={{ p: "15px", width: "100%" }}>
          <Stack
            direction="row"
            display={"flex"}
            justifyContent={"space-between"}
          >
            <Stack>
              <TextField
                id="input-with-icon-textfield"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchOutlined />
                    </InputAdornment>
                  ),
                }}
                variant="outlined"
                placeholder="Search something ..."
              />
            </Stack>
            <Stack direction="row" spacing={1}>
              <Button className="btn btn-sm bg-white border btn-active-light-primary">
                <Sort style={{ color: "black" }} />
              </Button>
              <Button className="btn btn-sm bg-white border btn-active-light-primary">
                <AddEmployee />
              </Button>

              <Button className="btn btn-sm bg-white border btn-active-light-primary">
                <Download style={{ color: "black" }} />
              </Button>
            </Stack>
          </Stack>
          <Stack sx={{ mt: ".5rem" }}>
            <EmployeeTable />
          </Stack>
        </Card>
      </Grid>
    </>
  );
}
