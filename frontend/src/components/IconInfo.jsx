import { Box, Tooltip, Typography } from "@mui/material"
import BathtubIcon from '@mui/icons-material/Bathtub';
import HotelIcon from '@mui/icons-material/Hotel';
import DirectionsCarFilledIcon from '@mui/icons-material/DirectionsCarFilled';
import GradeIcon from '@mui/icons-material/Grade';

const ICONS = [
  { tooltip: 'Bathrooms', icon: <BathtubIcon />, reference: 'bathrooms' },
  { tooltip: 'Bedrooms', icon: <HotelIcon />, reference: 'bedrooms' },
  { tooltip: 'Carspaces', icon: <DirectionsCarFilledIcon />, reference: 'parkingSpaces' },
  { tooltip: 'Average Rating', icon: <GradeIcon />, reference: 'averageRating' }
]

export default function IconInfo({property}) {
  return (
  ICONS.map((item) => (
    <Box key={item.reference} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
      <Tooltip title={item.tooltip}>
        {item.icon}
      </Tooltip>
      <Typography variant='body1'>
        {property[item.reference] || 'No Data'}
      </Typography>
      {item.reference === 'averageRating' && <Typography variant="body1">({property.numRatings})</Typography>}
    </Box>
  ))
)
}