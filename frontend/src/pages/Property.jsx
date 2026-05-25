import { useNavigate, useSearchParams } from "react-router-dom";
import Button from "@mui/material/Button";
import { Fragment, useEffect, useState } from "react";
import { Box, Rating, Stack, Tooltip, Typography } from "@mui/material";
import CircleIcon from '@mui/icons-material/Circle';
import { Map, Marker } from 'pigeon-maps';

import IconInfo from '../components/IconInfo'
import RentalMap from '../components/Map'
import { useAuth } from '../context/AuthContext'
import { useFilters } from '../context/FilterContext';
import { postRating, getPropertyRating, getRental } from "../services/api";


export default function Property() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');
  const [property, setProperty] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [rating, setRating] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const results = await Promise.all([
          getRental(id),
          user ?
            getPropertyRating(user.token, id)
              .catch(() => ({ rating: null }))
            : Promise.resolve({ rating: null })
        ])
        setProperty(results[0]);
        setRating(results[1].rating);
      } catch (e) {
        setProperty(null);
        setRating(null);
      }
    }
    // console.log(property);
    loadData();
  }, [id])

  const handleRatingChange = (event, newValue) => {
    if (newValue === null) return;
    // console.log(newValue);
    try {
      postRating(user.token, id, newValue);
      setRating(newValue);
    } catch (e) {
      setRating(null);
    }
  }

  if (!property) {
    return <Typography>Loading property details...</Typography>
  }
  return (
    <Box
      margin={4}
      sx={{
        bgcolor: 'background.paper',
        borderRadius: 3,
        padding: 3
      }}
    >
      <Stack direction={'row'} gap={5}>
        <Stack spacing={4.5} sx={{ flexGrow: 1 }}>
          {/* Address */}
          <Typography variant='h3'>{property.streetAddress}, {property.suburb}, {property.state} {property.postcode}</Typography>

          {/* Icons */}
          <Stack direction={'row'} alignItems={'center'} sx={{ gap: 1.5 }}>
            <IconInfo property={property} />
            <CircleIcon sx={{ fontSize: 7 }} />
            <Typography sx={{ textTransform: 'capitalize' }}>{property.propertyType}</Typography>
          </Stack>

          {/* Rent */}
          <Typography fontWeight={'bold'}>${property.rent} per week</Typography>

          {/* Agency */}
          <Typography fontWeight={'bold'}>Agency: {property.agencyName}</Typography>

          {/* User rating option */}
          <Box>
            <Typography fontWeight={'bold'}>{user ? 'Rate This Property' : 'Login To Rate Properties'}</Typography>
            <Rating
              size='large'
              value={rating}
              onChange={handleRatingChange}
              disabled={!user}

            />
          </Box>
        </Stack>
        <Box width={700}>
          <RentalMap currentProperty={property} />
        </Box>
      </Stack>

      {/* Description */}
      <Box marginY={4}>
        <Typography variant="h4">{property.title}</Typography>
        <Typography
          variant="body1"
          sx={{
            display: '-webkit-box',
            overflow: 'hidden',
            WebkitBoxOrient: 'vertical',
            WebkitLineClamp: isExpanded ? 'none' : 5,
          }}
        >
          {property.description.split('<br/>').map((text, index) => (
            <Fragment key={index}>
              {text}
              <br />
            </Fragment>
          ))}
        </Typography>
        <Button
          onClick={() => setIsExpanded(!isExpanded)}
          size='small'
          color="primary"
          variant="contained"
          sx={{
            marginTop: 1,
            fontWeight: 'bold'
          }}
        >
          {isExpanded ? 'Show Less' : 'Read More'}
        </Button>
      </Box>

      {/* Amenities */}
      {property.amenities && (
        <Box>
          <Typography variant="h4">Amenities</Typography>
          <ul>
            {property.amenities.split(',').map((text, index) => (
              <Fragment key={index}>
                <li>{text}</li>
              </Fragment>
            ))}
          </ul>
        </Box>
      )}

      <Button
        color="secondary"
        variant="contained"
        sx={{
          fontWeight: 'bold'
        }}
        onClick={() => {
          searchParams.delete('id');
          navigate('/rental-search?' + searchParams.toString());
        }}
      >
        Go to Search
      </Button>
    </Box>
  );
}