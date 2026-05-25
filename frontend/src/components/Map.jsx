import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Map, Marker, Overlay } from 'pigeon-maps';
import { Box, Button, FormControlLabel, Switch, Typography } from '@mui/material';
import { Stack } from '@mui/system';

import { getPostcodes, getRentals, getSuburbCenter } from '../services/api';
import { useFilters } from '../context/FilterContext'
import PropertyCard from './PropertyCard';


const loadPropertiesBound = 13;
const cachedProperties = {};
const postcodeBlacklist = [];   // Store postcodes that dont contain any properties so as to not re-fetch them

const fetchPostcodeProperties = async (pc, buildQueryString, mapUseFilters) => {
  let continueSearching = true;
  let currentPage = 1;
  let results = [];

  // While loop to handle pagination of data
  while (continueSearching) {
    const query = buildQueryString({ postcode: pc, suburb: '', page: currentPage }, mapUseFilters);
    try {
      const data = await getRentals(query);
      if (data.data.length === 0) {
        postcodeBlacklist.push(pc);
        continueSearching = false;
        return [];
      }
      results.push(...data.data);
  
      if (data.pagination.nextPage === null) continueSearching = false;
      else currentPage++;
    } catch (e) {
      continue;
    }
  }
  cachedProperties[pc] = results;
  return results;
}

const getProperties = async (center, bounds, buildQueryString, currentPropertyPC, mapUseFilters) => {
  // Fetch all postcodes within map area, then filter based on previous results and cache
  const initialPostcodes = await getPostcodes(center, bounds, currentPropertyPC);
  const postcodesBlacklistFiltered = initialPostcodes.filter((pc) => !postcodeBlacklist.includes(pc));
  const postcodes = postcodesBlacklistFiltered.filter((pc) => !cachedProperties[pc])

  // Call rental search for filtered postcodes to gather new properties
  await Promise.all(postcodes.map(pc => fetchPostcodeProperties(pc, buildQueryString, mapUseFilters)));

  const allProperties = postcodesBlacklistFiltered.map((pc) => cachedProperties[pc]).flat();
  // console.log('all properties', allProperties)
  // console.log('cached properties', cachedProperties)

  // Filter properties to only keep ones within bounding box of map
  const { ne, sw } = bounds;
  const filtererdProperties = allProperties.filter((property) => {
    const lat = property?.latitude;
    const lng = property?.longitude;
    const latIn = lat >= sw[0] && lat <= ne[0];
    const lngIn = lng >= sw[1] && lng <= ne[1];
    return latIn && lngIn
  })
  return (filtererdProperties);
  // console.log('filtered', filtererdProperties);
}

export default function RentalMap({ currentProperty = null }) {
  const { buildQueryString, searchFilters } = useFilters();
  const navigate = useNavigate();

  const [center, setCenter] = useState([-25, 134]);
  const [zoom, setZoom] = useState(4);
  const [bounds, setBounds] = useState({});
  const [propertySelected, setPropertySelected] = useState(null);
  const [properties, setProperties] = useState([]);
  const [mapUseFilters, setMapUseFilters] = useState(() => {
    const saved = localStorage.getItem('mapUseFilters');
    return saved ? JSON.parse(saved) : true;
  });
  
  // Save mapUseFilters to local storage so preference is saved when navigating from rental search to property page
  useEffect(() => {
    localStorage.setItem('mapUseFilters', JSON.stringify(mapUseFilters));
  }, [mapUseFilters])

  // Load properties when map or filters change, if zoomed in enough
  useEffect(() => {
    if (zoom > loadPropertiesBound && Object.keys(bounds).length !== 0) {
      const loadProperties = async () => {
        const properties = await getProperties(center, bounds, buildQueryString, currentProperty?.postcode || searchFilters.postcode, mapUseFilters);
        setProperties(properties);
      };
      loadProperties();
    } else {
      setProperties([]);
    }
  }, [center, bounds, zoom, searchFilters, mapUseFilters])

  // Clear cache and reset blacklist on filters changed, to prevent bloat, and remove old data
  useEffect(() => {
    Object.keys(cachedProperties).forEach(key => delete cachedProperties[key])
    postcodeBlacklist.length = 0;
  }, [searchFilters, mapUseFilters])

  // Shift property info overlay to try and keep in map bounds
  const setOffset = () => {
    const aboveCenter = propertySelected.latitude >= center[0];
    const leftCenter = propertySelected.longitude <= center[1];
    return {
      position: 'absolute',
      transform: `translate(${leftCenter ? '0%' : '-100%'}, ${aboveCenter ? '0%' : '-125%'})`
    };
  }

  // Zoom map in if postcode or suburb changed (state used to refine search in case of suburb)
  useEffect(() => {
    if (currentProperty) return;

    const updateMapPosition = async () => {
      const coords = await getSuburbCenter(searchFilters);
      if (coords) {
        setCenter(coords);
        setZoom(14);
      }
    }
    updateMapPosition();
  }, [searchFilters.postcode, searchFilters.suburb, searchFilters.state])

  // If on property page, zoom map into property location
  useEffect(() => {
    if (currentProperty) {
      setCenter([currentProperty.latitude, currentProperty.longitude]);
      setZoom(15);
      setPropertySelected(null);
    }
  }, [currentProperty])

  return (
    <Box>
      <Stack direction={'row'} justifyContent={'space-between'} alignItems={'center'} padding={2}>
        <Typography
          variant={currentProperty ? "h4" : "h2"}
          sx={{
            fontWeight: 'bold'
          }}
        >
          Rentals Map
        </Typography>
        <FormControlLabel label="Advanced Filters"
          control={
            <Switch
              checked={mapUseFilters}
              onClick={() => setMapUseFilters(!mapUseFilters)}
            />
          }
        />
      </Stack>


      <Map
        height={currentProperty ? 400 : 500}
        center={center}
        zoom={zoom}
        onBoundsChanged={({ center, zoom, bounds }) => {
          setCenter(center);
          setZoom(zoom);
          setBounds(bounds);
          if (zoom <= loadPropertiesBound) setPropertySelected(null);
        }}
        onClick={(() => setPropertySelected(null))}
      >

        {/* Markers for properties within map view */}
        {properties.map((property) => (
          <Marker
            key={property.id}
            width={property.title === currentProperty?.title || property.title === propertySelected?.title ? 50 : 40}
            color={property.title === currentProperty?.title || property.title === propertySelected?.title ? 'red' : 'orange'}
            anchor={[property.latitude, property.longitude]}
            onClick={() => setPropertySelected(property)}
          />

        ))}

        {/* Overlay to show on marker click */}
        {propertySelected && (
          <Overlay
            anchor={[propertySelected.latitude, propertySelected.longitude]}
          >
            <Box
              sx={{
                ...setOffset()
              }}
            >
              <PropertyCard property={propertySelected} onMap={true} />

            </Box>
          </Overlay>
        )}

        {/* Overlay to suggest zooming in to view properties */}
        {zoom <= loadPropertiesBound && (
          <Overlay anchor={bounds.ne} offset={[214, -5]}>
            <Box sx={{
              backgroundColor: 'secondary.main',
              padding: 1,
              borderRadius: 2,
              boxShadow: 3
            }}>
              <Typography fontWeight={'bold'}>Zoom in to view properties</Typography>
            </Box>
          </Overlay>
        )}
      </Map>
    </Box>
  )
}
