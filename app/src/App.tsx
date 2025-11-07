import { Admin, Resource } from 'react-admin';
import { BrowserRouter } from 'react-router-dom';
import authProvider from './auth/authProvider';
import dataProvider from './dataProvider';
import LoginPage from './auth/LoginPage';
import Dashboard from './dashboard/Dashboard';
import AwbList from './awbs/AwbList';
import AwbCreateWizard from './awbs/AwbCreateWizard';
import PickupPointList from './pickupPoints/PickupPointList';
import PickupPointCreate from './pickupPoints/PickupPointCreate';
import ProductList from './products/ProductList';
import ProductCreate from './products/ProductCreate';
import ProductEdit from './products/ProductEdit';
import ClientList from './clients/ClientList';
import ClientCreate from './clients/ClientCreate';
import ClientEdit from './clients/ClientEdit';
import { createTheme, ThemeProvider, alpha } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import MyLayout from './layout/MyLayout';

const primary = '#c92124';
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: primary, light: '#e05a5c', dark: '#8f1517', contrastText: '#ffffff' },
    secondary: { main: '#1a1f36' },
    background: { default: '#fafafa', paper: '#ffffff' }
  },
  shape: { borderRadius: 10 },
  components: {
    MuiAppBar: { styleOverrides: { root: { backgroundImage: 'none' } } },
    MuiToolbar: { styleOverrides: { root: { minHeight: 72, '@media (min-width:600px)': { minHeight: 72 } } } },
    MuiButton: { styleOverrides: { root: { textTransform: 'none', borderRadius: 10 } } },
    MuiCard: { styleOverrides: { root: { borderRadius: 14, boxShadow: `0 6px 20px ${alpha('#000', 0.08)}` } } },
    MuiTabs: { styleOverrides: { indicator: { height: 4, borderRadius: 2 } } },
    MuiTableBody: {
      styleOverrides: {
        root: {
          '& tr:nth-of-type(even) td': {
            backgroundColor: alpha(primary, 0.06)
          }
        }
      }
    }
  }
});

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Admin
          layout={MyLayout}
          theme={theme}
          dataProvider={dataProvider}
          authProvider={authProvider}
          loginPage={LoginPage}
          dashboard={Dashboard}
          title="Sameday eAWB"
        >
          <Resource name="awbs" options={{ label: 'AWBs' }} list={AwbList} create={AwbCreateWizard} />
          <Resource name="pickup-points" options={{ label: 'Puncte Ridicare' }} list={PickupPointList} create={PickupPointCreate} />
          <Resource name="products" list={ProductList} options={{ label: 'Produse' }} />
          <Resource name="clients" list={ClientList} options={{ label: 'Clienți' }} />
        </Admin>
      </ThemeProvider>
    </BrowserRouter>
  );
}


