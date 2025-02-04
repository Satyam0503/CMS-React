import {
  Typography,
  Card,
  Grid,
  Stack,
  Button,
  TextField,
  InputAdornment,
  IconButton,
  FormControl,
  Select,
  MenuItem,
  Container,
} from "@mui/material";
import { useIntl } from "react-intl";
import { Check, Colorize, Undo, Edit } from "@mui/icons-material";

type Props = {
  className: string;
};

export default function Career() {
  const intl = useIntl();
  return (
    <>
      <Typography variant="h4" mb={3}>
        {intl.formatMessage({ id: "Are you ready to join out team?" })}
      </Typography>
      <Typography variant="h4" mb={3}>
        {intl.formatMessage({ id: "We are hiring" })}
      </Typography>
    </>
  );
}
