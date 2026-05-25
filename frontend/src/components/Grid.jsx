import { AllCommunityModule, themeQuartz } from 'ag-grid-community';
import { AgGridProvider, AgGridReact } from 'ag-grid-react';
import { Box, Tooltip } from "@mui/material";
import BathtubIcon from '@mui/icons-material/Bathtub';
import HotelIcon from '@mui/icons-material/Hotel';
import DirectionsCarFilledIcon from '@mui/icons-material/DirectionsCarFilled';
import GradeIcon from '@mui/icons-material/Grade';
import { useNavigate } from 'react-router-dom';
import { useMemo } from 'react';

import { useFilters } from '../context/FilterContext';

const CreateHeader = (tooltip, icon) => {
  return () => (<Tooltip title={tooltip}>{icon}</Tooltip>)
}

const COLUMNS = {
  defaultColDef: {
    sortable: false
  },
  columnDefs: [
    { headerName: 'Title', field: 'title', width: 450 },
    { headerName: 'Rent', field: 'rent', width: 100 },
    { headerName: 'Property Type', field: 'propertyType', width: 150 },
    { headerName: 'Postcode', field: 'postcode', width: 100 },
    { headerName: 'State', field: 'state', width: 80 },
    { headerName: 'Suburb', field: 'suburb', width: 150 },
    { headerComponent: CreateHeader('Number of Bathrooms', <BathtubIcon />), field: 'bathrooms', width: 60 },
    { headerComponent: CreateHeader('Number of Bedrooms', <HotelIcon />), field: 'bedrooms', width: 60 },
    { headerComponent: CreateHeader('Number of Parking Spaces', <DirectionsCarFilledIcon />), field: 'parkingSpaces', width: 60 },
    {
      headerComponent: CreateHeader('Average Rating (Number of Ratings)', <GradeIcon />), width: 90,
      valueGetter: (params) => {
        if (!params.data) { return ''; }
        const rating = params.data.averageRating || 0;
        const numberRatings = params.data.numRatings || 0;
        return `${rating} (${numberRatings})`;
      }
    }
  ]
};

export default function MyGrid({dataSource, resultsPerPage, maxCacheSize, extraColumns = []}) {
  const navigate = useNavigate();
  const { searchParams } = useFilters();

  const mergedColumnDefs = useMemo(() => {
    return [...COLUMNS.columnDefs, ...extraColumns];
  }, [extraColumns])

  const totalWidth = useMemo(() => {
    return mergedColumnDefs.reduce((sum, col) => sum + (col.width || 0), 0)
  })
  return (
    <AgGridProvider modules={[AllCommunityModule]}>
      <Box
        sx={{
          height: '80%',
          flexGrow: 1,
          width: totalWidth + 20,
          maxWidth: '100%',
          margin: '0 auto'

        }}>
        <AgGridReact
          theme={themeQuartz}
          columnDefs={mergedColumnDefs}
          defaultColDef={COLUMNS.defaultColDef}
          rowModelType='infinite'
          datasource={dataSource}
          cacheBlockSize={resultsPerPage}
          maxBlocksInCache={maxCacheSize}
          infiniteInitialRowCount={resultsPerPage}
          onRowClicked={row => navigate(`/rental-search/property?id=${row.data.id}&${searchParams.toString()}`)}
        />
      </Box>
    </AgGridProvider>
  )
}