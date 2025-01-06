import {
  Typography,
  Card,
  Stack,
  TextField,
  InputAdornment,
  Container,
  IconButton,
  Dialog,
  DialogContent,
} from "@mui/material";
import { useIntl } from "react-intl";
import {
  Add,
  Close,
  Download,
  FilterList,
  SearchOutlined,
} from "@mui/icons-material";

import React from "react";

import HolidayForm from "../../pages/holidays/HolidayForm";
import { components } from "../../../_themes/assets/ts";

export default function CustomisedSearch() {
  const intl = useIntl();
  const [openModal, setOpenModal] = React.useState(false);

  const handleOpenModal = () => {
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const handleAddHoliday = () => {
    handleCloseModal();
  };

  return (
    <Container sx={{ pt: "16px" }}>
      <Stack direction="column" spacing={2}>
        <Stack
          direction="row"
          display={"flex"}
          justifyContent={"space-between"}
          alignItems={"center"}
        >
          <Stack>
            <TextField
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchOutlined />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={handleOpenModal}
                      sx={{
                        border: 0,
                        "&:hover, &.Mui-selected, &.Mui-selected:hover": {
                          border: "none",
                          background: "none",
                        },
                      }}
                    >
                      <Close sx={{ pl: "5px" }} />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              variant="outlined"
              placeholder="Search something ..."
            />
          </Stack>
          <Stack direction="row" spacing={1}>
            <IconButton aria-label="filter employee">
              <FilterList />
            </IconButton>
            <IconButton
              aria-label="add employee"
              onClick={() => setOpenModal(true)}
            >
              <Add />
            </IconButton>
            <IconButton aria-label="import excel">
              <Download />
            </IconButton>
          </Stack>
        </Stack>
      </Stack>

      <Dialog open={openModal} onClose={handleCloseModal}>
        <DialogContent sx={{ width: "100%" }}>
          <HolidayForm
            handleCloseModal={handleCloseModal}
            handleAddHoliday={handleAddHoliday}
          />
        </DialogContent>
      </Dialog>
    </Container>
  );
}
