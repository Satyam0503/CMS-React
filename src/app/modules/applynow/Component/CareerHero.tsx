import { Box, Button, Stack, Typography } from '@mui/material'


function CareerHero() {
    return (
        <Stack
            direction={'row'}
            spacing={4}
            className='d-flex align-items-center position-relative justify-content-between'
            sx={{
                height: '600px',
                marginBottom: '40px',
                backgroundImage: `url(/media/Icons/careerSvg1.svg)`,
                backgroundRepeat: "no-repeat",
                backgroundSize: "contain",
                backgroundPosition: "top right"
            }}>
            <Stack spacing={.5}
                sx={{
                    paddingLeft: '40px',
                    paddingRight: '40px',
                    width: '100%',
                    zIndex: '1',
                    '@media (min-width:850px)': {
                        width: '45%',
                        // padding: '0'
                    }
                }}>
                <Typography variant="h1" color="initial" className='w-100'>Build a Career That Inspires You</Typography>
                <Typography component="p" sx={{
                    fontSize: '16px'
                }}>
                    Join a team where innovation, collaboration, and purpose come together. Supported by people who care about your growth and your success every step of the
                    way.
                </Typography>
                <Button component="a" href='#recent-jobs' variant='contained' className='find-jobs-button mt-4 rounded-pill'>Find Jobs</Button>
            </Stack>
            <Box component={'div'} className='object-fit-fill h-85 w-50 overflow-hidden m-0 career-display-disable-on-md-sceen'
                sx={{
                    zIndex: '1'
                }}
            >
                <img src="/media/Icons/CareerHeroIcon.png" alt="" className='h-100 w-100' />
            </Box>
        </Stack>
    );
}

export default CareerHero