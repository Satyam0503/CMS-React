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
import { CircularLoader } from "../../../shared/components/CircularLoader";
import { useIntl } from "react-intl";

type FilterProps = {
    jobTypes: number;
    searchTitle: string;
}

export default function JobSearchCareer() {
    const { formatMessage: i } = useIntl();
    const [activeJobPositionsList, setActiveJobPositionsList] = useState<JobModal[]>([]);
    const [filters, setFilters] = useState<FilterProps>({ jobTypes: 0, searchTitle: "", });
    const debouncedValue = useDebounce(filters.searchTitle);
    const [loading, setLoading] = useState<boolean>(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;
        setFilters({ ...filters, searchTitle: value });
    };

    const handleSelectChange = (event: SelectChangeEvent<typeof filters.jobTypes>) => {
        const { value } = event.target;
        setFilters({ ...filters, jobTypes: value });
    };

    useEffect(() => {
        const payload: GetAllVacancyPayload = {
            jobTypes: filters.jobTypes === 0 ? [] : [filters.jobTypes],
            status: true,
            search: filters.searchTitle,
        };
        setLoading(true);

        const getActiveVacancy = async () => {
            try {
                const response = await getAllJobVacancies(payload);
                const { success, methodResults } = response.data;
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
    }, [debouncedValue, filters.jobTypes]);

    return (
        <Stack
            id="recent-jobs"
            component={"div"}
            className="recent-jobs"
        >
            <Box component={"div"} className="job-search-bar">
                <TextField
                    name="searchTitle"
                    label={i({ id: "PLACEHOLDER.SEARCH" })}
                    className="job-search-section"
                    value={filters.searchTitle}
                    slotProps={{
                        input: {
                            endAdornment: <Search className="me-2" />,
                        }
                    }}
                    onChange={handleInputChange}
                />
                <FormControl className="job-search-section">
                    <InputLabel id="job-type-select-label">{i({ id: "JOB.TYPE" })}</InputLabel>
                    <Select
                        name="jobTypes"
                        labelId="job-type-select-label"
                        id="job-type-select"
                        label="Job Type"
                        onChange={handleSelectChange}
                        value={filters.jobTypes}
                    >
                        <MenuItem value={0}>All</MenuItem>
                        <MenuItem value={1}>On Site</MenuItem>
                        <MenuItem value={2}>Hybrid</MenuItem>
                        <MenuItem value={3}>Remote</MenuItem>
                    </Select>
                </FormControl>
            </Box>
            {
                loading ?
                    <Box sx={{ height: '350px', }}>
                        <CircularLoader />
                    </Box>
                    : activeJobPositionsList.length > 0 ?
                        <>
                            <Typography color="initial" sx={{ fontWeight: '600', fontSize: '20px', marginBottom: '15px' }}>Recent Openings:</Typography>
                            <JobsSection activeJobPositionsList={activeJobPositionsList} />
                        </>
                        : <NoVacancy />
            }
        </Stack>
    );
}
