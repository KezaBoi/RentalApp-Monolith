import React, { useEffect, useState } from "react";
import { alpha, Box, Icon, IconButton, Stack, Typography, useMediaQuery, useTheme } from "@mui/material";
import { FilterOptions } from "../components/Filter";
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import GradeIcon from '@mui/icons-material/Grade';
import MapIcon from '@mui/icons-material/Map';

import suburbImg from '../assets/aerial_suburb.jpeg'
import { getTopProperties } from "../services/api";
import Carousel from "../components/Carousel";

const FEATURES = [
  { title: 'Smart Filtering', description: 'Find exactly what you need using our high-performance search engine. Filter by rent, location, property type and more instantly.', icon: <FilterAltIcon /> },
  { title: 'User Contributed Ratings', description: 'Make informed decisions with honest feedback from other users, and even contribute your own rating, with the ability to see all your rated properties.', icon: <GradeIcon /> },
  { title: 'Interactive Map', description: 'Explore neighbourhoods in real-time. Our interactive map automatically updates and marks property locations as you move, helping you pinpoint the perfect home in your target area.', icon: <MapIcon /> }
]

export default function Home() {
  return (
    <main>
      <Hero />
      <Features />
      <FeaturedProperties />
    </main>
  );
}

// hero content
const Hero = () => (
  <Box
    justifySelf={'center'}
    justifyItems={'center'}
    margin={4}
    sx={{
      paddingY: 6,
      paddingX: 15,
      borderRadius: 3,
      backgroundImage: `url(${suburbImg})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      marginBottom: 10
    }}
  >
    <Typography
      variant='h6'
      className="hero_subtitle"
      sx={{
        backgroundColor: 'secondary.main',
        padding: 1,
        borderRadius: 3,
        marginBottom: 2,
        boxShadow: 4,
        fontWeight: 'bold'
      }}
    >
      Your Next Move Starts Here
    </Typography>
    <FilterOptions rentalPage={false} />
  </Box>
);

const Features = () => {
  const theme = useTheme();
  const isMed = useMediaQuery(theme.breakpoints.up(1000));

  return (
    <>
      <Typography variant="h4" sx={{ textAlign: 'center', fontWeight: 'bold' }}>Key Site Features</Typography>
      <Stack direction={isMed ? 'row' : 'column'} sx={{ justifyContent: 'center', alignItems: isMed ? '' : 'center', gap: isMed ? 3 : 0, width: '100%' }}>
        {FEATURES.map((feature) => (
          <Stack
            key={feature.title}
            direction={'row'}
            spacing={2}
            sx={{
              marginBlock: 3,
              padding: 2,
              width: isMed ? '20%' : '50%',
              minWidth: '300px',
              borderRadius: 3,
              backgroundColor: 'background.paper',
              boxShadow: 5
            }}
          >
            {React.cloneElement(feature.icon, { sx: { fontSize: 60, alignSelf: 'center' } })}
            <Stack direction={'column'}>
              <Typography variant="h6" fontWeight={'bold'}>{feature.title}</Typography>
              <Typography variant="body2" textAlign={''}>{feature.description}</Typography>
            </Stack>
          </Stack>
        ))}
      </Stack>
    </>
  )
}

const FeaturedProperties = () => {
  const [properties, setProperties] = useState([]);

  useEffect(() => {
    const loadProperties = async () => {
      const data = await getTopProperties();
      setProperties(data.data);
      // console.log(data);
    }
    loadProperties();
  }, [])

  return (
    <Carousel items={properties} />
  )
}