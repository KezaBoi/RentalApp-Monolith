import { useSearchParams } from "react-router-dom";
import { useState, createContext, useContext, useEffect } from "react";

import { getStates, getPropertyTypes } from "../services/api";

// Slider Filters Min and Max Constants
const SLIDER_BOUNDS = {
  Rent: [0, 5500],
  Bathrooms: [0, 15],
  Bedrooms: [0, 15],
  Parking: [0, 15],
  Rating: [0, 5],
}

const INITIAL_FILTERS = {
  sortBy: 'id',
  sortDesc: false,
  postcode: null,
  suburb: '',
  selectedPropertyTypes: [],
  state: '',
  Rent: [SLIDER_BOUNDS.Rent[0], SLIDER_BOUNDS.Rent[1]],
  Bathrooms: [SLIDER_BOUNDS.Bathrooms[0], SLIDER_BOUNDS.Bathrooms[1]],
  Bedrooms: [SLIDER_BOUNDS.Bedrooms[0], SLIDER_BOUNDS.Bedrooms[1]],
  Parking: [SLIDER_BOUNDS.Parking[0], SLIDER_BOUNDS.Parking[1]],
  Rating: [SLIDER_BOUNDS.Rating[0], SLIDER_BOUNDS.Rating[1]],
}

const FilterContext = createContext();

export const FilterProvider = ({ children }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [propertyTypes, setPropertyTypes] = useState([]);
  const [ausStates, setAusStates] = useState([]);


  useEffect(() => {
    const loadData = async () => {
      const results = await Promise.all([
        getStates(),
        getPropertyTypes()
      ])
      setPropertyTypes(results[0]);
      setAusStates(results[1]);
    }
    loadData();
  }, [])
  
  // Set filters to saved filters in url, otherwise set to initial state
  const getFiltersFromURL = () => {
    const urlState = { ...INITIAL_FILTERS };
    searchParams.forEach((value, key) => {
      if (value === 'true') {
        urlState[key] = true;
      }
      else if (value === 'false') {
        urlState[key] = false;
      }
      else {
        urlState[key] = (value.startsWith('[') || !isNaN(value))
        ? JSON.parse(value)
        : value;
      }
    })
    return urlState;
  }
  
  const [searchFilters, setSearchFilters] = useState(getFiltersFromURL());

  useEffect(() => {
    if (!searchParams.has('id')) setSearchFilters(getFiltersFromURL());
  }, [searchParams])

  // Update url and filters with new filters
  const applyFilters = (newFilters) => {
    const params = {};
    Object.entries(newFilters).forEach(([key, value]) => {
      if (JSON.stringify(value) !== JSON.stringify(INITIAL_FILTERS[key])) {
        params[key] = Array.isArray(value) ? JSON.stringify(value) : value;
      }
    });
    setSearchParams(params);
    setSearchFilters(newFilters);
  }

  // Build query string using filters
  const buildQueryString = (overrides = {}, mapUseFilters = true) => {
    const activeFilters = { ...searchFilters, ...overrides };
    const apiFilters = new URLSearchParams({
      ...(activeFilters.page && { page: activeFilters.page }),
      sortBy: activeFilters.sortBy,
      sortOrder: activeFilters.sortDesc ? 'desc' : 'asc'
    })

    if (activeFilters.postcode) apiFilters.append('postcode', activeFilters.postcode);
    if (activeFilters.suburb) apiFilters.append('suburb', activeFilters.suburb);
    if (activeFilters.state) apiFilters.append('state', activeFilters.state);

    // Enable toggling of filters for map
    if(!mapUseFilters) return apiFilters.toString();

    activeFilters.selectedPropertyTypes.forEach((type) => {
      apiFilters.append('propertyTypes', type);
    })

    Object.entries(SLIDER_BOUNDS).forEach(([key, [boundMin, boundMax]]) => {
      const [min, max] = activeFilters[key];
      if (min > boundMin) apiFilters.append(`minimum${key}`, min);
      if (max < boundMax) apiFilters.append(`maximum${key}`, max);
    })

    return apiFilters.toString();
  }

  return (
    <FilterContext.Provider value={{ searchFilters, searchParams, applyFilters, buildQueryString, INITIAL_FILTERS, SLIDER_BOUNDS, propertyTypes, ausStates }}>
      {children}
    </FilterContext.Provider>
  )
}

export const useFilters = () => useContext(FilterContext);