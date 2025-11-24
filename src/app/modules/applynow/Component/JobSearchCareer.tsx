import {
    Box,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    SelectChangeEvent,
    Stack,
    TextField, Typography,
} from "@mui/material";
import JobsSection from "./JobsSection";
import React, { useEffect, useState } from "react";
import {
    GetAllVacancyPayload,
    JobModal,
} from "../../recruitment/models";
import { getAllJobVacancies } from "../../recruitment/services";
import { Search } from "@mui/icons-material";
import { useDebounce } from "../../../hooks/useDebounce";
import NoVacancy from "./NoVacancy";

export default function JobSearchCareer() {
    const [activeJobPositionsList, setActiveJobPositionsList] = useState<JobModal[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [filters, setFilters] = useState({jobTypes: [],searchTitle: "",});
    const [refresh, setRefresh] = useState<boolean>(true);
    function handleRefresh() {setRefresh(!refresh);}
    const debouncedValue = useDebounce(refresh);

    const handleChange = ( e:React.ChangeEvent | SelectChangeEvent ) => {
        const {name,value}= e.target;
        if(name==="jobTypes"){
            setFilters({...filters,[name]:value === 0 ?[]:[value]})
        }else{
            setFilters({...filters,[name]:value.replace(' ','')})
        }
        handleRefresh()
    };

    useEffect(() => {
        const payload: GetAllVacancyPayload = {
            jobTypes:filters.jobTypes ,
            status: true,
            search: filters.searchTitle,
        };

    const getActiveVacancy = async () => {
        try {
            const response = await getAllJobVacancies(payload);
            const { statusCode, success, message, methodResults } = response.data;
            if (success) {
            setActiveJobPositionsList(methodResults);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
        };
        getActiveVacancy();
    }, [debouncedValue]);

    return (
        <Stack
        id="recent-jobs"
        component={"div"}
        className="recent-jobs"
        >
            <Box component={"div"} className="job-search-bar">
                <TextField
                name="searchTitle"
                label="Job Position"
                className="job-search-section"
                onChange={(e)=>{
                    handleChange(e)
                }}
                slotProps={{
                    input: {
                        endAdornment: <Search className="me-2" />,
                    }
                }}
                />
                <FormControl className="job-search-section">
                    <InputLabel id="job-type-select-label">Job Type</InputLabel>
                    <Select
                        name="jobTypes"
                        labelId="job-type-select-label"
                        id="job-type-select"
                        label="Job Type"
                        onChange={handleChange}
                        defaultValue="0"
                    >
                        <MenuItem value={0}>All</MenuItem>
                        <MenuItem value={1}>On Site</MenuItem>
                        <MenuItem value={2}>Hybrid</MenuItem>
                        <MenuItem value={3}>Remote</MenuItem>
                    </Select>
                </FormControl>
            </Box>
            {activeJobPositionsList.length > 0 ?
                <>
                    <Typography color="initial" sx={{fontWeight: '600', fontSize: '20px', marginBottom: '15px'}}>Recent Openings:</Typography>
                    <JobsSection activeJobPositionsList={activeJobPositionsList} />
                </>
                : <NoVacancy />
            }
        </Stack>
    );
}
