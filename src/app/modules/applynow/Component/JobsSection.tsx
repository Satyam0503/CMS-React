import { Box, Stack, Typography, useMediaQuery, useTheme } from '@mui/material'
import  { useEffect, useState } from 'react'
import { ApplicantStatus, ApplicationStatus } from '../../../../utils/enums';
import { ApplicantModel, JobModal } from '../../recruitment/models';
import { useParams } from "react-router-dom";
import JobInfo from './JobInfo';
import clsx from 'clsx';

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

export default function JobsSection(props:Props) {
    const theme = useTheme();

    const [formValues, setFromValues] = useState(initialValues);
    const [selectedJobPosition, setSelectedJobPosition] = useState<JobModal | undefined>();
    const smallScreen = useMediaQuery(theme.breakpoints.down("md"));

    const { id } = useParams();
    if (id) localStorage.setItem("clientId", id);

    function handleChangePostion(job: JobModal| undefined){
        setSelectedJobPosition(job)
    }

    useEffect(() => {
        if(!smallScreen){
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
        <Box component={'div'}>
            <Stack direction={'row'} spacing={4}>
                <Box component={'div'} className='recent-jobs-section'>
                    <Stack className='recent-jobs-section-container' spacing={2}>
                        {props.activeJobPositionsList.map((job, index)=>{ 
                            const isSelectedJob = job.jobId === selectedJobPosition?.jobId
                                
                            return <Stack spacing={.3} key={index} className={`${clsx('recent-job',{'selected-job':isSelectedJob})}`} onClick={()=>setSelectedJobPosition(job)}>
                                        <Typography fontWeight={'600'} fontSize={'18px'} color="initial">{job.title}</Typography>
                                        <Stack direction={'row'} spacing={1} sx={{marginTop: '0'}}>
                                            <Typography variant='h6'>Vaccancies</Typography>
                                            <Typography variant='h6'>{job.vacancies}</Typography>
                                        </Stack>
                                        <Box component={'div'} className='job-footer-container' >
                                            <Box component={'div'} className='job-skill'>{job.jobType === 1 ? 'On- Site' : job.jobType === 2 ? 'Hybrid' : 'Remote'}</Box>
                                            {/* <Box component={'div'} className='job-skill'>{job.vacancies}</Box> */}
                                        </Box>
                                        {selectedJobPosition?.jobId === job.jobId && smallScreen &&
                                            <JobInfo selectedJob={selectedJobPosition} activeJobPositionsList={props.activeJobPositionsList} handleChangePostion={handleChangePostion}/>
                                        }
                                    </Stack>
                                }
                            )
                        }
                    </Stack>
                </Box>
                <Box width={'60%'} component={'div'} className='selected-job-section'>
                    <JobInfo selectedJob={selectedJobPosition} activeJobPositionsList={props.activeJobPositionsList} handleChangePostion={handleChangePostion}/>
                </Box>
            </Stack>
        </Box>
    )
}
