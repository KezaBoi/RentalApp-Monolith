import { createBrowserRouter, RouterProvider, Outlet, useLocation } from 'react-router-dom';
import Box from '@mui/material/Box';

// Material UI font
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

// Components
import Header from "./components/Header";
import Footer from "./components/Footer";
import { AuthProvider } from './context/AuthContext';
import { FilterProvider } from './context/FilterContext'

// Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import RentalSearch from "./pages/RentalSearch";
import Property from "./pages/Property";
import RatedProperties from './pages/RatedProperties';

const router = createBrowserRouter([
  {
    path: "/",
    Component: AppLayout,
    children: [
      { index: true, Component: Home },
      { path: 'login', element: <Login key={useLocation} /> },
      { path: 'rental-search', Component: RentalSearch },
      { path: 'rental-search/property', Component: Property},
      { path: 'rated-properties', Component: RatedProperties}
    ],
  },
]);

function AppLayout() {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh'
      }}>
      <FilterProvider>
      <Header />

      <Box component={'main'} sx={{ flexGrow: 1}}>
        <Outlet />
      </Box>

      <Footer />
      </FilterProvider>
    </Box>
  );
}

function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

export default App
