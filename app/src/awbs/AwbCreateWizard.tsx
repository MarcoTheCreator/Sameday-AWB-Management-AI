import { useNotify, useRedirect, CreateBase, useDataProvider } from 'react-admin';
import FormWizard from 'react-form-wizard-component';
import 'react-form-wizard-component/dist/style.css';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Box, Button, Grid, Paper, Typography, Autocomplete, TextField, Card, CardActionArea, CardContent, Radio, RadioGroup } from '@mui/material';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import LockIcon from '@mui/icons-material/Lock';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import InventoryIcon from '@mui/icons-material/Inventory';
import AllInboxIcon from '@mui/icons-material/AllInbox';

declare global {
  interface LockerPluginInitOptions {
    clientId: string;
    countryCode: string;
    langCode?: string;
    city?: string;
    county?: string;
    theme?: 'light' | 'dark';
    apiUsername?: string;
    filters?: Array<Record<string, unknown>>;
    initialMapCenter?: string;
  }
  interface LockerPluginInstance {
    open(): void;
    close(): void;
    subscribe(handler: (msg: any) => void): void;
  }
  interface Window {
    LockerPlugin?: {
      init(options: LockerPluginInitOptions): void;
      getInstance(): LockerPluginInstance;
    };
  }
}

interface AwbDraft {
  service?: 7 | 15;
  packageType?: 0 | 1 | 2;
  awbRecipient?: {
    countyString?: string;
    cityString?: string;
    name?: string;
    personType?: 0;
    address?: string;
    phoneNumber?: string;
    postalCode?: string;
    email?: string;
  } | null;
  product?: ProductOption | null;
  pickupPoint?: Choice | null;
  oohLastMile?: number | 0;
  lockerName?: string | null;
}

type Choice = { id: string; name: string };
type ProductOption = { id: string; name: string; price?: number; weight?: number };
type ClientOption = {
  id: string;
  name: string;
  email?: string;
  county?: string;
  city?: string;
  address?: string;
  phoneNumber?: string;
  postalCode?: string;
};

export default function AwbCreateWizard() {
  const WizardAny: any = FormWizard;
  const notify = useNotify();
  const redirect = useRedirect();
  const dataProvider = useDataProvider();
  const [draft, setDraft] = useState<AwbDraft>({});
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [pickupPoints, setPickupPoints] = useState<{ id: string; name: string }[]>([]);
  const [loadingClients, setLoadingClients] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingPickupPoints, setLoadingPickupPoints] = useState(false);
  const [isLockerSelected, setIsLockerSelected] = useState(false);

  const formatRON = useMemo(() => new Intl.NumberFormat('ro-RO', { style: 'currency', currency: 'RON' }), []);

  function handleLockerSelected(current: AwbDraft): void {
    const clientId = "e3aff034-224d-4af3-8520-9e6a1d75ee14";//each integrator will have an unique clientId
    const countryCode = "RO";//country for which the plugin is used
    const langCode = "ro";//language of the plugin
    const city = "Sectorul 2";//User's default city to be displayed at start
    const county = "Bucuresti";//User's default county to be displayed at start
    const theme = "light";//theme of the plugin: light, dark
    const apiUsername = "apisupportTEST";//integrator LM Username
    const filters = [{ "showLockers": true }, { "showPudos": true }];//default filters for lockers
    const initialMapCenter = "Sectorul 2";//Where the map will be initially centered. Leave undefined to center on the user's favorite delivery point, if it exists.

    const plugin = window.LockerPlugin;
    if (!plugin || typeof plugin.init !== 'function' || typeof plugin.getInstance !== 'function') {
      // eslint-disable-next-line no-console
      console.warn('LockerPlugin is not available on window. Ensure the plugin script is loaded.');
      return;
    }

    plugin.init({
      clientId: clientId,
      countryCode: countryCode,
      langCode: langCode,
      city: city,
      county: county,
      theme: theme,
      apiUsername: apiUsername,
      filters: filters,
      initialMapCenter: initialMapCenter
    });

    const pluginInstance = plugin.getInstance();

    const handleLockerInput = (msg: any) => {
      draft.oohLastMile = msg.lockerId;
      draft.lockerName = msg.name;
      pluginInstance.close();
      setIsLockerSelected(true);
    }

    pluginInstance.subscribe(handleLockerInput);
    pluginInstance.open();

  }

  const prevServiceRef = useRef<AwbDraft['service']>(undefined);
  useEffect(() => {
    if (draft.service === 15 && prevServiceRef.current !== 15) {
      handleLockerSelected(draft);
    }
    prevServiceRef.current = draft.service;
  }, [draft.service]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoadingClients(true);
        const { data: cData } = await dataProvider.getList('clients', {
          pagination: { page: 1, perPage: 1000 },
          sort: { field: 'name', order: 'ASC' },
          filter: {}
        });
        if (mounted)
          setClients((cData as any[]).map((c) => ({
            id: String(c.id),
            name: String(c.name || c.fullName || c.id),
            email: c.email ? String(c.email) : undefined,
            county: c.county ? String(c.county) : undefined,
            city: c.city ? String(c.city) : undefined,
            address: c.address ? String(c.address) : undefined,
            phoneNumber: c.phoneNumber ? String(c.phoneNumber) : undefined,
            postalCode: c.postalCode ? String(c.postalCode) : undefined
          })));
      } finally {
        if (mounted) setLoadingClients(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [dataProvider]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoadingProducts(true);
        const { data: pData } = await dataProvider.getList('products', {
          pagination: { page: 1, perPage: 1000 },
          sort: { field: 'name', order: 'ASC' },
          filter: {}
        });
        if (mounted)
          setProducts(
            (pData as any[]).map((p) => ({
              id: String(p.id),
              name: String(p.name || p.sku || p.id),
              price: typeof p.price === 'number' ? p.price : Number(p.price ?? 0),
              weight: typeof p.weight === 'number' ? p.weight : Number(p.weight ?? 0)
            }))
          );
      } finally {
        if (mounted) setLoadingProducts(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [dataProvider]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoadingPickupPoints(true);
        const { data: ppData } = await dataProvider.getList('pickup-points', {
          pagination: { page: 1, perPage: 1000 },
          sort: { field: 'alias', order: 'ASC' },
          filter: {}
        });
        if (mounted)
          setPickupPoints((ppData as any[]).map((p) => ({ id: String(p.id), name: String(p.alias || p.address || p.id) })));
      } finally {
        if (mounted) setLoadingPickupPoints(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [dataProvider]);

  const onSubmit = async () => {
    try {
      const payload: any = {
        service: draft.service,
        packageType: draft.packageType,
        awbRecipient: draft.awbRecipient,
        cashOnDelivery: draft.product?.price ?? 0,
        packageWeight: draft.product?.weight ?? 0,
        parcels: draft.product?.weight != null ? [{ weight: draft.product.weight }] : [],
        pickupPoint: draft.pickupPoint?.id,
        awbPayment: 1,
        insuredValue: 0,
        thirdPartyPickup: 0,
        oohLastMile: draft.service === 7 ? 0 : draft.oohLastMile,
        observation: draft.product?.name ?? ""
      };
      await dataProvider.create('awbs', { data: payload });
      notify('AWB creat cu succes', { type: 'success' });
      redirect('/awbs');
    } catch (e: any) {
      notify(e?.message || 'Eroare la generarea AWB-ului', { type: 'error' });
    }
  };

  return (
    <CreateBase>
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Creare AWB
        </Typography>
        <WizardAny
          color="#c92124"
          shape="circle"
          onComplete={onSubmit}
        >
          <FormWizard.TabContent
            title="Livrare"
            icon="ti-truck"
          >
            <Box p={2}>
              <Typography variant="subtitle1" sx={{ mb: 2 }}>
                Selectează metoda de livrare
              </Typography>
              <RadioGroup value={draft.service ?? null} onChange={(_e, v) => setDraft((d) => ({ ...d, service: Number(v) as 7 | 15 }))}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Card variant="outlined" sx={{ borderColor: (draft.service === 7 ? 'primary.main' : 'divider') }}>
                      <CardActionArea onClick={() => setDraft((d) => ({ ...d, service: 7 }))} sx={{ p: 1 }}>
                        <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
                          <Box sx={{ flexBasis: '25%', display: 'flex', alignItems: 'center' }}>
                            <Radio checked={draft.service === 7} value={7} />
                          </Box>
                          <Box sx={{ flexBasis: '50%' }}>
                            <Typography variant="subtitle1">Livrare la adresă</Typography>
                            <Typography variant="body2" color="text.secondary">Predare colet la curier și livrare la adresă</Typography>
                          </Box>
                          <Box sx={{ flexBasis: '25%', display: 'flex', justifyContent: 'flex-end' }}>
                            <LocalShippingIcon color={draft.service === 7 ? 'primary' : 'disabled'} sx={{ fontSize: 36 }} />
                          </Box>
                        </CardContent>
                      </CardActionArea>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Card variant="outlined" sx={{ borderColor: (draft.service === 15 ? 'primary.main' : 'divider') }}>
                      <CardActionArea onClick={() => setDraft((d) => ({ ...d, service: 15 }))} sx={{ p: 1 }}>
                        <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
                          <Box sx={{ flexBasis: '25%', display: 'flex', alignItems: 'center' }}>
                            <Radio checked={draft.service === 15} value={15} />
                          </Box>
                          <Box sx={{ flexBasis: '50%' }}>
                            <Typography variant="subtitle1">Livrare în easybox</Typography>
                            <Typography variant="body2" color="text.secondary">Predare colet la curier și livrare în orice easybox din țară</Typography>
                            <Typography
                              variant="body2"
                              color="text.primary"
                              display={isLockerSelected ? 'block' : 'none'}
                            ><br></br>easybox selectat:<br></br><b>{draft.lockerName}</b></Typography>
                          </Box>
                          <Box sx={{ flexBasis: '25%', display: 'flex', justifyContent: 'flex-end' }}>
                            <LockIcon color={draft.service === 15 ? 'primary' : 'disabled'} sx={{ fontSize: 36 }} />
                          </Box>
                        </CardContent>
                      </CardActionArea>
                    </Card>
                  </Grid>
                </Grid>
              </RadioGroup>
            </Box>
          </FormWizard.TabContent>

          <FormWizard.TabContent
            title="Colet"
            icon="ti-package"
            isValid={draft.service === 7 || draft.service === 15}
            validationError={() => {
              notify('Selectează metoda de livrare', { type: 'error' });
            }}
          >
            <Box p={2}>
              <Typography variant="subtitle1" sx={{ mb: 2 }}>
                Selectează tipul coletului
              </Typography>
              <RadioGroup value={draft.packageType ?? null} onChange={(_e, v) => setDraft((d) => ({ ...d, packageType: Number(v) as 0 | 1 | 2 }))}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <Card variant="outlined" sx={{ borderColor: (draft.packageType === 0 ? 'primary.main' : 'divider') }}>
                      <CardActionArea onClick={() => setDraft((d) => ({ ...d, packageType: 0 }))} sx={{ p: 1 }}>
                        <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
                          <Box sx={{ flexBasis: '25%', display: 'flex', alignItems: 'center' }}>
                            <Radio checked={draft.packageType === 0} value={0} />
                          </Box>
                          <Box sx={{ flexBasis: '50%' }}>
                            <Typography variant="subtitle1">Colet M</Typography>
                            <Typography variant="body2" color="text.secondary">max. 46 x 44 x 18 cm<br></br>până la 9 kg</Typography>
                          </Box>
                          <Box sx={{ flexBasis: '25%', display: 'flex', justifyContent: 'flex-end' }}>
                            <Inventory2Icon color={draft.packageType === 0 ? 'primary' : 'disabled'} sx={{ fontSize: 36 }} />
                          </Box>
                        </CardContent>
                      </CardActionArea>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Card variant="outlined" sx={{ borderColor: (draft.packageType === 1 ? 'primary.main' : 'divider') }}>
                      <CardActionArea onClick={() => setDraft((d) => ({ ...d, packageType: 1 }))} sx={{ p: 1 }}>
                        <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
                          <Box sx={{ flexBasis: '25%', display: 'flex', alignItems: 'center' }}>
                            <Radio checked={draft.packageType === 1} value={1} />
                          </Box>
                          <Box sx={{ flexBasis: '50%' }}>
                            <Typography variant="subtitle1">Colet S</Typography>
                            <Typography variant="body2" color="text.secondary">max. 46 x 44 x 9 cm<br></br>până la 4 kg</Typography>
                          </Box>
                          <Box sx={{ flexBasis: '25%', display: 'flex', justifyContent: 'flex-end' }}>
                            <InventoryIcon color={draft.packageType === 1 ? 'primary' : 'disabled'} sx={{ fontSize: 36 }} />
                          </Box>
                        </CardContent>
                      </CardActionArea>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Card variant="outlined" sx={{ borderColor: (draft.packageType === 2 ? 'primary.main' : 'divider') }}>
                      <CardActionArea onClick={() => setDraft((d) => ({ ...d, packageType: 2 }))} sx={{ p: 1 }}>
                        <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
                          <Box sx={{ flexBasis: '25%', display: 'flex', alignItems: 'center' }}>
                            <Radio checked={draft.packageType === 2} value={2} />
                          </Box>
                          <Box sx={{ flexBasis: '50%' }}>
                            <Typography variant="subtitle1">Colet L</Typography>
                            <Typography variant="body2" color="text.secondary">max. 46 x 44 x 38 cm<br></br>până la 19 kg</Typography>
                          </Box>
                          <Box sx={{ flexBasis: '25%', display: 'flex', justifyContent: 'flex-end' }}>
                            <AllInboxIcon color={draft.packageType === 2 ? 'primary' : 'disabled'} sx={{ fontSize: 36 }} />
                          </Box>
                        </CardContent>
                      </CardActionArea>
                    </Card>
                  </Grid>
                </Grid>
              </RadioGroup>
            </Box>
          </FormWizard.TabContent>

          <FormWizard.TabContent
            title="Destinatar"
            icon="ti-user"
            isValid={draft.packageType !== undefined && draft.packageType !== null}
            validationError={() => {
              notify('Selectează tipul coletului', { type: 'error' });
            }}
          >
            <Box p={2}>
            <Typography variant="subtitle1" sx={{ mb: 2 }}>
                Selectează destinatarul
              </Typography>
              <Autocomplete
                disablePortal
                options={clients}
                getOptionLabel={(o) => `${o.name}${o.email ? ` (${o.email})` : ''}`}
                loading={loadingClients}
                value={null}
                onChange={(_e, v) =>
                  setDraft((d) => ({
                    ...d,
                    awbRecipient: v
                      ? {
                        countyString: v.county,
                        cityString: v.city,
                        name: v.name,
                        personType: 0,
                        address: v.address,
                        phoneNumber: v.phoneNumber,
                        postalCode: v.postalCode,
                        email: v.email
                      }
                      : null
                  }))
                }
                renderInput={(params) => <TextField {...params} label="Destinatarul" />}
              />
            </Box>
          </FormWizard.TabContent>

          <FormWizard.TabContent
            title="Produs"
            icon="ti-tag"
            isValid={Boolean(draft.awbRecipient)}
            validationError={() => {
              notify('Selectează destinatarul', { type: 'error' });
            }}
          >
            <Box p={2}>
            <Typography variant="subtitle1" sx={{ mb: 2 }}>
                Selectează produsul
              </Typography>
              <Autocomplete
                disablePortal
                options={products}
                getOptionLabel={(o) => `${o.name}${typeof o.price === 'number' ? ` (${formatRON.format(o.price)})` : ''}`}
                loading={loadingProducts}
                value={draft.product || null}
                onChange={(_e, v) => setDraft((d) => ({ ...d, product: v }))}
                renderInput={(params) => <TextField {...params} label="Produsul" />}
              />
            </Box>
          </FormWizard.TabContent>

          <FormWizard.TabContent
            title="Punct de ridicare"
            icon="ti-pin2"
            isValid={Boolean(draft.product)}
            validationError={() => {
              notify('Selectează produsul', { type: 'error' });
            }}
          >
            <Box p={2}>
            <Typography variant="subtitle1" sx={{ mb: 2 }}>
                Selectează punctul de ridicare
              </Typography>
              <Autocomplete
                disablePortal
                options={pickupPoints}
                getOptionLabel={(o) => `${o.name} (ID: ${o.id})`}
                loading={loadingPickupPoints}
                value={draft.pickupPoint || null}
                onChange={(_e, v) => setDraft((d) => ({ ...d, pickupPoint: v }))}
                renderInput={(params) => <TextField {...params} label="Punctul de ridicare" />}
              />
            </Box>
          </FormWizard.TabContent>

          <FormWizard.TabContent
            title="Sumar"
            icon="ti-check"
            isValid={Boolean(draft.pickupPoint)}
            validationError={() => {
              notify('Selectează punctul de ridicare', { type: 'error' });
            }}
          >
            <Box p={2}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="subtitle1">Serviciu</Typography>
                  <Typography variant="body2">
                    {draft.service === 7 ? 'La adresă' : draft.service === 15 ? 'La locker' : '-'}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle1">Tip colet</Typography>
                  <Typography variant="body2">
                    {draft.packageType === 0
                      ? 'Standard'
                      : draft.packageType === 1
                        ? 'Mic'
                        : draft.packageType === 2
                          ? 'Mare'
                          : '-'}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle1">Destinatar</Typography>
                  <Typography variant="body2">
                    {draft.awbRecipient?.name
                      ? `${draft.awbRecipient.name}${draft.awbRecipient.email ? ` (${draft.awbRecipient.email})` : ''}`
                      : '-'}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle1">Produs</Typography>
                  <Typography variant="body2">
                    {draft.product?.name
                      ? `${draft.product.name}${typeof draft.product.price === 'number' ? ` (${formatRON.format(draft.product.price)})` : ''}`
                      : '-'}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle1">Punct de ridicare</Typography>
                  <Typography variant="body2">
                    {draft.pickupPoint?.name ? `${draft.pickupPoint.name} (ID: ${draft.pickupPoint.id})` : '-'}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Button variant="contained" onClick={onSubmit}>Creează AWB</Button>
                </Grid>
              </Grid>
            </Box>
          </FormWizard.TabContent>
        </WizardAny>
        <style>{`
          @import url("https://cdn.jsdelivr.net/gh/lykmapipo/themify-icons@0.1.2/css/themify-icons.css");
        `}</style>
      </Paper>
    </CreateBase>
  );
}


