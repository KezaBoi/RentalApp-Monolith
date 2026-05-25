import { useEffect, useRef, useState } from "react";
import { Autocomplete, Box, Button, Checkbox, Dialog, DialogActions, DialogTitle, Divider, FormControl, FormControlLabel, FormGroup, IconButton, InputLabel, MenuItem, Select, Slider, TextField, Tooltip } from "@mui/material";
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import NumberField from './NumberField';

import { useFilters } from '../context/FilterContext'
import { useNavigate } from "react-router-dom";

const SORT_BY_ITEMS = [
  { value: 'id', text: '--' },
  { value: 'rent', text: 'Rent' },
  { value: 'bathrooms', text: 'Bathrooms' },
  { value: 'bedrooms', text: 'Bedrooms' },
  { value: 'parkingSpaces', text: 'Parking Spaces' },
  { value: 'averageRating', text: 'Average Rating' },
  { value: 'numRatings', text: 'Number of Ratings' },
  { value: 'title', text: 'Title' },
  { value: 'propertyType', text: 'Property Type' },
  { value: 'suburb', text: 'Suburb' },
  { value: 'postcode', text: 'Postcode' },
  { value: 'state', text: 'State' },
  { value: 'latitude', text: 'Latitude' },
  { value: 'longitude', text: 'Longitude' },
]

const SLIDER_CONFIGS = [
  { key: 'Rent', title: 'Set Price Range' },
  { key: 'Bathrooms', title: 'Number of Bathrooms' },
  { key: 'Bedrooms', title: 'Number of Bedrooms' },
  { key: 'Parking', title: 'Number of Carparks' },
  { key: 'Rating', title: 'Average Rating' },
]

export function FilterOptions({ rentalPage = true }) {
  const navigate = useNavigate();
  const { searchFilters, applyFilters, INITIAL_FILTERS, SLIDER_BOUNDS, propertyTypes, ausStates } = useFilters();

  const [filters, setFilters] = useState(searchFilters);

  useEffect(() => {
    setFilters(searchFilters);
  }, [searchFilters])

  const handleSortByChange = (event) => {
    setFilters(prev => ({
      ...prev,
      sortBy: event.target.value
    }))
  };

  const handleSortOrderChange = () => {
    setFilters(prev => ({
      ...prev,
      sortDesc: !prev.sortDesc
    }))
  };

  const handleState = (event, newState) => {
    setFilters(prev => ({
      ...prev,
      state: newState || ''
    }))
  }

  const handleSuburb = (event) => {
    // Use regex to ensure only letters entered
    const onlyText = event.target.value.replace(/[^a-zA-Z\s]/g, '');
    
    setFilters(prev => ({
      ...prev,
      suburb: onlyText
    }))
  }

  const handlePostcode = (value) => {
    setFilters(prev => ({
      ...prev,
      postcode: value
    }))
    // console.log('filters', filters);
  }

  // Add property to filters if not in there, otherwise remove if already in
  const handleSelectProperty = (type) => {
    setFilters(prev => {
      const currentList = prev.selectedPropertyTypes;
      const newList = currentList.includes(type)
        ? currentList.filter(t => t !== type)
        : [...currentList, type];
      return { ...prev, selectedPropertyTypes: newList }
    });
  };

  const [dialogOpen, setDialogOpen] = useState(false);
  const handleSearchSubmit = () => {
    if (!rentalPage) navigate('/rental-search')
      setDialogOpen(false);
    if (JSON.stringify(filters) === JSON.stringify(searchFilters)) return;  // Early return if filters unchanged (preserve routing)
    filters.suburb = filters.suburb.trim();
    applyFilters(filters);
  }
  
  // Trigger immediate refresh on sort by and order change
  useEffect(() => {
    // Early return if sort filters changed by url, or first render (preserve routing)
    if(filters.sortBy === searchFilters.sortBy && filters.sortDesc === searchFilters.sortDesc) return; 
    applyFilters(filters);
  }, [filters.sortBy, filters.sortDesc]);

  const handleClearFilters = () => {
    if (JSON.stringify(filters) === JSON.stringify(INITIAL_FILTERS)) return;  // Early return if filters same as initial filters (preserve routing)
    setFilters(INITIAL_FILTERS);
    applyFilters(INITIAL_FILTERS);
    // console.log(filters);
  }

  return (
    <FormControl
      sx={{
        flexDirection: 'row',
        gap: 2,
        backgroundColor: 'background.paper',
        padding: 2,
        borderRadius: 2,
        alignSelf: 'center'
      }}>
      {/* Main Filters */}
      <Autocomplete
        options={ausStates}
        renderInput={(params) => <TextField {...params} label='State' />}
        sx={{ width: 120 }}
        onChange={handleState}
        value={filters.state}
      />
      <TextField
        label='Suburb'
        onChange={handleSuburb}
        value={filters.suburb}
        sx={{ width: 120 }}
      />
      <NumberField
        label='Postcode'
        min={2000}
        max={8999}
        onValueChange={handlePostcode}
        value={filters.postcode}
        sx={{ width: 100 }}
      />

      {/* Control Buttons */}
      <Button onClick={() => setDialogOpen(true)}>Advanced Filters</Button>
      <Button onClick={handleSearchSubmit}>Search</Button>

      {/* Only render components if on the rental page */}
      {rentalPage && (
        <>
          <Button color='error' onClick={handleClearFilters}>Clear Filters</Button>

          {/* Sorting Logic */}
          <Box sx={{ position: 'relative' }}>
            <InputLabel id='sort-by-label'>Sort By</InputLabel>
            <Select
              value={filters.sortBy}
              labelId='sort-by-label'
              label='Sort By'
              onChange={handleSortByChange}
              sx={{
                width: 150,
              }}
            >
              {SORT_BY_ITEMS.map((item) => (
                <MenuItem key={item.value} value={item.value}>{item.text}</MenuItem>
              ))}
            </Select>
            <Tooltip title={filters.sortDesc ? 'Descending' : 'Ascending'}>
              <IconButton onClick={handleSortOrderChange} sx={{marginLeft: 0.5}}>
                {filters.sortDesc ? <KeyboardArrowDownIcon /> : <KeyboardArrowUpIcon />}
              </IconButton>
            </Tooltip>

          </Box>
        </>
      )}
      {/* Dialog pop up for advanced filters */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
      >
        {/* Property Type Selection */}
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between' }}>
          Property Type
          <Button onClick={handleSearchSubmit}>Search</Button>
        </DialogTitle>
        <DialogActions>
          <FormGroup sx={{ flexDirection: 'row', display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
            <FormControlLabel control={<Checkbox checked={filters.selectedPropertyTypes.length === 0} onChange={() => setFilters(prev => ({ ...prev, selectedPropertyTypes: [] }))} />} label='All' sx={{ width: '30%' }} />
            {propertyTypes.map((type) =>
              <FormControlLabel key={type} label={type} sx={{ textTransform: 'capitalize', width: '30%' }} control=
                {
                  <Checkbox key={type}
                    checked={filters.selectedPropertyTypes.includes(type)}
                    onChange={() => handleSelectProperty(type)}
                  />
                }
              />
            )}
          </FormGroup>

          {/* Sliders */}
        </DialogActions>
        {SLIDER_CONFIGS.map((config) => {
          const [boundMin, boundMax] = SLIDER_BOUNDS[config.key];
          return (
            <FormGroup key={config.key}>
              <Divider variant='middle' />
              <DialogTitle>{config.title}</DialogTitle>
              <DialogActions sx={{ justifyContent: 'center' }}>
                <Slider
                  value={filters[config.key]}
                  valueLabelDisplay='auto'
                  min={boundMin}
                  max={boundMax}
                  onChange={(event, newValue) =>
                    setFilters(prev => ({
                      ...prev,
                      [config.key]: newValue
                    }))}
                  marks={[
                    { value: (boundMin), label: (boundMin) },
                    { value: (boundMax), label: (`${boundMax}${config.key !== 'Rating' ? '+' : ''}`) }
                  ]}
                  sx={{ width: '70%' }}
                />
              </DialogActions>
            </FormGroup>
          )
        })}
      </Dialog>
    </FormControl>
  )
}