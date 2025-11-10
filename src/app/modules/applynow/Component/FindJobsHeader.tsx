import { Box, Stack, Typography } from '@mui/material'

export default function FindJobsHeader() {
    return (
        <Stack spacing={1} className='find-jobs-header'>
            <Box component={'div'} className='find-jobs-header-title'>
                <Typography component={'p'} variant='h1' color={'black'}>Explore Our 
                    <Typography component={'span'} variant='h1' color={'primary'}> Open Roles
                    </Typography>
                </Typography>
            </Box>
            <Typography className='find-jobs-header-sub' width={{sm:'100%',md:'70%'}}>
                Find your place among talented people who value creativity, curiosity, and collaboration. Together,
                we're building an inclusive environment where everyone can learn, grow, and do their best work.
            </Typography>
        </Stack>
    )
}
