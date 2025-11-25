import Typography from '@mui/material/Typography'
import { Box, Stack } from '@mui/material'


function WhyJoin() {
    return (
        <Stack spacing={2} >
            <Typography variant="h2" color='primary' sx={{ fontWeight: '600' }}>Why Join Us?</Typography>
            <Box
                component='div'
                sx={{
                    flexDirection: { xs: 'column', sm: 'column', md: 'row', },
                    display: 'flex',
                    gap: '20px'
                }}>
                <Stack
                    className='why-join-card'
                    sx={{
                        height: { md: '300px', sm: '250px' },
                        flex: '1'
                    }}>
                    <Box component={'div'}>
                        <img src="/media/Icons/briefcase.png" alt="" height={'50px'} />
                    </Box>
                    <Typography variant="h6" color="initial">Accelerate your professional journey.</Typography>
                    <Typography variant="body1" color="initial" sx={{
                        fontSize: '16px'
                    }}>We invest in your development through mentorship, training, and clear growth paths to help you reach your full potential.</Typography>
                </Stack>

                <Stack
                    className='why-join-card'
                    sx={{
                        height: { md: '300px', sm: '250px' },
                        flex: '1'
                    }}>
                    <Box component={'div'}>
                        <img src="/media/Icons/diamond.png" alt="" height={'50px'} />
                    </Box>
                    <Typography variant="h6" color="initial">Collaborative Work Culture</Typography>
                    <Typography variant="body1" color="initial" sx={{
                        fontSize: '16px'
                    }}>Thrive in a team that values ideas and impact.
                        Join a diverse group of passionate individuals who work together to innovate, learn, and create meaningful results.</Typography>
                </Stack>

                <Stack
                    className='why-join-card'
                    sx={{
                        height: { md: '300px', sm: '250px' },
                        flex: '1'
                    }}>
                    <Box component={'div'}>
                        <img src={"/media/Icons/earth.png"} alt="" height={'50px'} />
                    </Box>
                    <Typography variant="h6" color="initial">Purpose-Driven Mission</Typography>
                    <Typography variant="body1" color="initial" sx={{
                        fontSize: '16px'
                    }}>Make a difference that matters.
                        Be part of a company that’s committed to sustainability, innovation, and creating a positive impact on communities worldwide.</Typography>
                </Stack>
            </Box>
        </Stack>
    );
}

export default WhyJoin