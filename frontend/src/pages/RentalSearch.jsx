import { useState, useMemo } from "react";
import Box from '@mui/material/Box';
import { Button, Dialog, DialogContent, DialogTitle, FormControlLabel, Stack, Switch, Typography } from '@mui/material';

import RentalMap from '../components/Map'
import { FilterOptions } from '../components/Filter';
import { useFilters } from '../context/FilterContext';
import { getRentals } from '../services/api';
import MyGrid from "../components/Grid";


export default function RentalSearch() {
  const { searchFilters, buildQueryString } = useFilters();
  const [showMap, setShowMap] = useState(false);

  const dataSource = useMemo(() => {
    return {
      getRows: async (params) => {
        const page = (params.startRow / 10) + 1;
        const query = buildQueryString({ page });
        try {
          const data = await getRentals(query);
          // console.log(data);
          params.successCallback(data.data, data.pagination.total);
        } catch (e) {
          params.failCallback();
        }
      }
    }
  }, [searchFilters]);

  return (
    <Box
      sx={{
        width: '90%',
        height: '85vh',
        display: 'flex',
        flexDirection: 'column',
        margin: '0 auto',
        gap: 2,
        paddingY: 2,
      }}>
      {/* Filter options and show map button */}
      <Stack direction={'row'} alignSelf={'center'} gap={3}>
        <FilterOptions />
        <Button onClick={(() => setShowMap(true))} sx={{ height: 60, alignSelf: 'center' }}>Show Map</Button>
      </Stack>

      {/* Grid component to show rental search results, uses infinite scrolling to load more results as user scrolls down */}
      <MyGrid dataSource={dataSource} resultsPerPage={10} maxCacheSize={10} />

      <Dialog
        open={showMap}
        onClose={() => setShowMap(false)}
        fullWidth
        maxWidth='md'
        keepMounted
      >
        <DialogContent>
          <RentalMap />
        </DialogContent>
      </Dialog>
    </Box>
  );
}