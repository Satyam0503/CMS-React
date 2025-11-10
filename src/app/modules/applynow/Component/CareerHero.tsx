import { Box, Button, Stack, Typography } from '@mui/material'
import CustomisedButton from '../../../shared/components/CustomisedButton'
import CareerHeroIcon from '../../../../../public/media/Icons/CareerHeroIcon.png'
import careerSvg from '../../../../../public/media/flags/careerSvg1.svg'

import React from 'react'

function CareerHero() {
    return (
        <Stack direction={'row'} height={'600px'} spacing={4} className='d-flex align-items-center position-relative justify-content-between'
        sx={{marginBottom: '40px',
            backgroundImage:`url(${careerSvg})`,
            backgroundRepeat:"no-repeat",
            backgroundSize:"contain",
            backgroundPosition:"top right"
        }}>
            <Stack  spacing={.5}
                sx={{  
                    paddingLeft: '40px',
                    paddingRight: '40px',   
                    width: '100%',
                    zIndex: '1',
                    '@media (min-width:850px)': {
                        width: '45%',
                        // padding: '0'
                    }}}>
                <Typography variant="h1" color="initial" className='w-100'>Build a Career That Inspires You</Typography>
                <Typography fontSize={'16px'} component="p">
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
                <img src={CareerHeroIcon} alt="" className='h-100 w-100'/>
            </Box>
            {/* <img src={careerSvg} alt="" className='position-absolute top-0 end-0 border-none h-100'
            sx={{
                    zIndex: '-1',
                }}/> */}
        </Stack>
    )
}

export default CareerHero