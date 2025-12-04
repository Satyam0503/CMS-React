import { Box, Stack, Typography, useMediaQuery, useTheme } from '@mui/material'
import { useEffect, useState } from 'react'
import { ApplicantStatus, ApplicationStatus } from '../../../../utils/enums';
import { ApplicantModel, JobModal } from '../../recruitment/models';
import { useParams } from "react-router-dom";
import JobInfo from './JobInfo';
import clsx from 'clsx';
import { useIntl } from 'react-intl';
import { JobTypeMapper } from '../../../../utils/common';

const initialValues: ApplicantModel = {
    applicantId: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    state: "",
    experience: 1,
    resume: null,
    vacancyId: "",
    status: ApplicantStatus.InActive,
    activityType: ApplicationStatus.New,
};
type Props = {
    activeJobPositionsList: Array<JobModal>
}

export default function JobsSection(props: Props) {
    const theme = useTheme();
    const { formatMessage: i } = useIntl();
    const [formValues, setFromValues] = useState(initialValues);
    const [selectedJobPosition, setSelectedJobPosition] = useState<JobModal | undefined>();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down("md"));

    const { id } = useParams();
    if (id) localStorage.setItem("clientId", id);

    function handleChangePostion(job: JobModal | undefined) {
        setSelectedJobPosition(job)
    }

    useEffect(() => {
        if (!isSmallScreen) {
            const selectedJob = props.activeJobPositionsList.find((job) => job.status === true);
            if (selectedJob) {
                setSelectedJobPosition(selectedJob);
                setFromValues({
                    ...formValues,
                    vacancyId: selectedJob.jobId,
                });
            }
        }
    }, [props.activeJobPositionsList]);

    return (
        <Box component='div'>
            <Stack direction='row' spacing={4}>
                <Box component='div' className='recent-jobs-section'>
                    <Stack className='recent-jobs-section-container' spacing={2}>
                        {props.activeJobPositionsList.map((job, index) => {
                            const isSelectedJob = job.jobId === selectedJobPosition?.jobId
                            const isJobSelectedOnSmallScreen = selectedJobPosition?.jobId === job.jobId && isSmallScreen;
                            return (
                                <Stack key={index} className={`${clsx('recent-job', { 'selected-job': isSelectedJob })}`} onClick={() => setSelectedJobPosition(job)}>
                                    <Typography
                                        sx={{
                                            fontWeight: '600',
                                            fontSize: '16px'
                                        }}>{job.title}</Typography>
                                    <Stack direction='row' spacing={1} sx={{ fontSize: "14px", marginBlock: .5, fontWeight: "600" }}>
                                        <Typography className='fw-bold'>Vaccancies :</Typography>
                                        <Typography className='fw-bold' >{job.vacancies}</Typography>
                                    </Stack>
                                    <Box component='div' className={clsx('job-type-card', { "mb-2": isJobSelectedOnSmallScreen })}>{i({ id: JobTypeMapper[job.jobType] })}</Box>
                                    {isJobSelectedOnSmallScreen &&
                                        <JobInfo selectedJob={selectedJobPosition} activeJobPositionsList={props.activeJobPositionsList} handleChangePostion={handleChangePostion} />
                                    }
                                </Stack>
                            );
                        }
                        )
                        }
                    </Stack>
                </Box>
                <Box component='div' className='selected-job-section' sx={{
                    width: '60%'
                }}>
                    <JobInfo selectedJob={selectedJobPosition} activeJobPositionsList={props.activeJobPositionsList} handleChangePostion={handleChangePostion} />
                </Box>
            </Stack >
        </Box >
    );
}
