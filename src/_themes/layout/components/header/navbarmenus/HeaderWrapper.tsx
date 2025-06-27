import { Autocomplete, AutocompleteInputChangeReason, Avatar, Box, CircularProgress, Fade, IconButton, List, ListItem, ListItemAvatar, ListItemButton, ListItemText, Paper, Popper, Stack, TextField, Typography, useMediaQuery, useTheme } from "@mui/material";
import { FC, useCallback, useEffect, useRef, useState } from "react";
import { Navbar } from "./Navbar";
import { EmployeeSearchModel } from "../../../../../utils/common_types";
import { searchEmployee } from "../../../../../app/modules/users/userservices";
import { Clear, ClearSharp, CropSharp, MenuOutlined, Search } from "@mui/icons-material";
import { useIntl } from "react-intl";
import { useDebounce } from "../../../../../app/hooks/useDebounce";
import { useNavigate } from "react-router-dom";

type Props = {
  openSideBar: () => void;
}

export const HeaderWrapper: FC<Props> = ({ openSideBar }) => {
  const { formatMessage } = useIntl();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down(theme.breakpoints.values.md));
  const eleRef = useRef<HTMLElement>(null);
  const [loading, setLoading] = useState(false);
  const [employeeList, setEmployeeList] = useState<EmployeeSearchModel[]>([]);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const debouncedValue = useDebounce(search);
  const navigate = useNavigate();


  const handleSearchChange = async (event: React.SyntheticEvent, value: string, reason: AutocompleteInputChangeReason) => {
    setSearch(value)
  };
  const handleClick = (empId: string) => {
    setSearch("");
    navigate(`/employees/${empId}`);
    setOpen(false);
  };

  useEffect(() => {
    (async () => {
      if (debouncedValue.trim().length > 0) {
        setLoading(true);
        try {
          const { data } = await searchEmployee(debouncedValue);
          if (data.success) {
            setEmployeeList(data.methodResults);
            setOpen(true);
          }
        } catch (error: any) {
          console.error(error.message);
        }
        finally {
          setLoading(false);
        }
      }
    })();
  }, [debouncedValue])

  return (
    <Stack
      sx={{
        backgroundColor: 'background.header',
      }}
      className="p-4 flex-row align-items-center justify-content-between position-sticky top-0 z-3"
    >
      {
        isSmallScreen &&
        <IconButton sx={{ border: 0 }} onClick={openSideBar}>
          <MenuOutlined className="icon-fs-32" />
        </IconButton>
      }
      <Stack direction="row" className="align-items-center flex-grow-1 justify-content-end gap-5" >
        <Autocomplete
          id="employee_search"
          sx={{ width: 250, maxWidth: 250, }}
          size="small"
          open={open}
          onClose={() => {
            setOpen(false);
            setSearch("");
          }}
          disablePortal={true}
          inputValue={search}
          onInputChange={handleSearchChange}
          popupIcon={open ? <ClearSharp /> : <Search />}
          forcePopupIcon={!loading}
          getOptionLabel={(option) => option.firstName + " " + option.lastName}
          options={employeeList}
          loading={loading}
          noOptionsText={formatMessage({ id: "No_Result" })}
          renderInput={(params) => (
            <TextField
              {...params}
              placeholder={formatMessage({ id: "Placeholder.Search_Employee_By_Name" })}
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <>
                    {loading ? <CircularProgress color="inherit" sx={{ mr: 1 }} size={20} /> : null}
                    {params.InputProps.endAdornment}
                  </>
                ),
              }}
            />
          )}
          renderOption={(props, emp, state) => {
            return (
              <ListItemButton key={emp.userId} onClick={() => handleClick(emp.userId)} >
                <ListItemAvatar sx={{ minWidth: "auto", mr: 1 }}>
                  <Avatar src={emp.fullProfileUrl} alt="Profile" sx={{ width: 32, height: 32 }} />
                </ListItemAvatar>
                <ListItemText primary={emp.firstName + " " + emp.lastName} secondary={emp.jobRole} />
              </ListItemButton>
            );
          }}
        />
        <Navbar />
      </Stack>
    </Stack>
  );
}

