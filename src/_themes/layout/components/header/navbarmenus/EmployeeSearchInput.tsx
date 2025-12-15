import { useEffect, useState } from "react";
import { EmployeeSearchModel } from "../../../../../utils/common_types";
import { Autocomplete, Avatar, CircularProgress, ListItemAvatar, ListItemButton, ListItemText, TextField } from "@mui/material";
import { ClearSharp, Search } from "@mui/icons-material";
import { useIntl } from "react-intl";
import { useAppLang } from "../../../../i18n/Metronici18n";
import { useNavigate } from "react-router-dom";
import { DEFAULT_USER_AVATAR } from "../../../../../utils/constant/Constant";
import { useDebounce } from "../../../../../app/hooks/useDebounce";
import { searchEmployee } from "../../../../../app/modules/users/userservices";

export const EmployeeSearchInput = () => {
    const { formatMessage } = useIntl();
    const [loading, setLoading] = useState(false);
    const [employeeList, setEmployeeList] = useState<EmployeeSearchModel[]>([]);
    const [open, setOpen] = useState(false);
    const { currentLanguage } = useAppLang();
    const [search, setSearch] = useState("");
    const debouncedValue = useDebounce(search);
    const navigate = useNavigate();
    const handleSearchChange = async (event: React.SyntheticEvent, value: string) => {
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
                } catch (error) {
                    console.error((error instanceof Error) ? error.message : error);
                }
                finally {
                    setLoading(false);
                }
            }
        })();
    }, [debouncedValue])
    return (
        <Autocomplete
            id="employee_search"
            sx={{ minWidth: 250 }}
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
            noOptionsText={formatMessage({ id: "MESSAGE.NO_RESULT" })}
            renderInput={(params) => (
                <TextField
                    {...params}
                    placeholder={formatMessage({ id: "PLACEHOLDER.SEARCH_EMP" })}
                    slotProps={{
                        input: {
                            ...params.InputProps,
                            endAdornment: (
                                <>
                                    {loading ? <CircularProgress sx={{ mr: 1 }} size={20} /> : null}
                                    {params.InputProps.endAdornment}
                                </>
                            ),
                        }
                    }}
                />
            )}
            renderOption={(props, emp,) => {
                return (
                    <ListItemButton key={emp.userId} onClick={() => handleClick(emp.userId)} >
                        <ListItemAvatar sx={{ minWidth: "auto", mr: 1 }}>
                            <Avatar src={emp.fullProfileUrl || DEFAULT_USER_AVATAR} alt={emp.firstName} sx={{ width: 36, height: 36, backgroundColor: "secondary.main" }} />
                        </ListItemAvatar>
                        <ListItemText primary={`${emp.firstName + " " + emp.lastName}  ${emp.empId ? (" - " + emp.empId) : ""}`} secondary={emp.jobRole?.[currentLanguage] ?? formatMessage({ id: "NOT_AVAILABLE" })} />
                    </ListItemButton>
                );
            }}
        />
    )
}