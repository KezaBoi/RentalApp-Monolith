import { Button, Card, CardContent, CardHeader, Stack, Typography } from "@mui/material";

import IconInfo from './IconInfo';
import { useNavigate } from "react-router-dom";

import { useFilters } from '../context/FilterContext';


export default function PropertyCard({ property, onMap = false }) {
  const navigate = useNavigate();
  const { searchParams } = useFilters();
  return (
    <Card sx={{
      borderRadius: 2,
      boxShadow: 3
    }}>
      <CardHeader
        title={`${property.propertyType} for rent`}
        slotProps={{
          title: { variant: 'bold', sx: { textTransform: 'capitalize' }, paddingRight: 2 }
        }}
        action={
          <Button
            variant='contained'
            size='small'
            onClick={() => navigate(`/rental-search/property?id=${property.id}&${searchParams.toString()}`)}
          >
            More Info
          </Button>
        }
      />
      <CardContent sx={{ paddingTop: 0 }}>
        <Typography variant={'subtitle1'} fontWeight={'bold'}>${property.rent} per week</Typography>
        <Typography variant='subtitle1'>{property.suburb}, {onMap ? '' : `${property.state}, `}{property.postcode}</Typography>
        <Stack direction={'row'} alignItems={'center'} sx={{ gap: 1.5, marginTop: 1 }}>
          <IconInfo property={property} />
        </Stack>
      </CardContent>
    </Card>
  )
}