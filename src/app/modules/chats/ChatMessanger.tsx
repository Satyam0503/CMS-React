import * as React from "react";

import {
  Button,
  Card,
  Container,
  Grid,
  Link,
  Stack,
  Typography,
} from "@mui/material";
import { useIntl } from "react-intl";
import {
  Add,
  Circle,
  Close,
  Download,
  FilterList,
  ListAltOutlined,
  MoreHoriz,
} from "@mui/icons-material";

import { SearchInput } from "../../modules/components/SearchInput";
import { CustomIconButton } from "../../modules/components/CustomIconButton";
import { colors } from "../../modules/theme/MuiTheme";
import { CustomisedTable } from "../../modules/components/CustomisedTable";
import HolidayForm from "../../modules/holidays/HolidayForm";
import { ConfirmationModal } from "../../modules/components/ConfirmationModal";
import { HolidayType, NoticeModel } from "../../../utils/common_types";
import dayjs from "dayjs";
import { NoticeBoardTableColumnList } from "../../../utils/constant/Constant";

export default function ChatMessenger() {
  return (
    <>
      <Stack>
        <Stack
          direction={"row"}
          display={"flex"}
          justifyContent={"space-between"}
        >
          <Stack>
            <Link href="#">
              <Typography variant="h5">Brian Cox</Typography>
            </Link>
            <Stack direction={"row"} spacing={1}>
              <Circle color="success" />
              <Typography variant="body2">Active</Typography>
            </Stack>
          </Stack>

          <Stack direction={"row"} spacing={1}>
            <CustomIconButton icon={<MoreHoriz />} />
            <CustomIconButton icon={<Close />} />
          </Stack>
        </Stack>
      </Stack>
    </>
  );
}
