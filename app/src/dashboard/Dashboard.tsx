import { Card, CardContent, Grid, Typography } from '@mui/material';
import { useDataProvider, useGetList } from 'react-admin';
import { useEffect, useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Bar
} from 'recharts';

function StatCard({ title, value }: { title: string; value: string | number }) {
  return (
    <Card>
      <CardContent>
        <Typography gutterBottom variant="h6">{title}</Typography>
        <Typography variant="h4">{value}</Typography>
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const dataProvider = useDataProvider();
  const products = useGetList('products', { pagination: { page: 1, perPage: 1 } });
  const clients = useGetList('clients', { pagination: { page: 1, perPage: 1 } });
  const awbs = useGetList('awbs', { pagination: { page: 1, perPage: 1 }, filter: { date: new Date().toISOString().slice(0, 10) } });
  const pickups = useGetList('pickup-points', { pagination: { page: 1, perPage: 1 } });
  const [series, setSeries] = useState<{ day: number; total: number }[]>([]);
  const [loading, setLoading] = useState(false);
  const currentMonth = useMemo(() => new Date().toLocaleString('ro-RO', { month: 'long' }), []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth(); // 0-based
        // last day of month
        const lastDay = new Date(year, month + 1, 0).getDate();
        const days = Array.from({ length: 31 }, (_, i) => i + 1);
        const results = await Promise.all(
          days.map(async (d) => {
            if (d > lastDay) return { day: d, total: 0 };
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            try {
              const { total } = await dataProvider.getList('awbs', {
                pagination: { page: 1, perPage: 1 },
                sort: { field: 'id', order: 'ASC' },
                filter: { date: dateStr }
              });
              return { day: d, total: typeof total === 'number' ? total : 0 };
            } catch {
              return { day: d, total: 0 };
            }
          })
        );
        if (mounted) setSeries(results);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [dataProvider]);

  return (
    <Grid container spacing={2} padding={2}>
      <Grid item xs={12} md={3}><StatCard title="AWBs (today)" value={awbs.total ?? '–'} /></Grid>
      <Grid item xs={12} md={3}><StatCard title="Pickup Points" value={pickups.total ?? '–'} /></Grid>
      <Grid item xs={12} md={3}><StatCard title="Products" value={products.total ?? '–'} /></Grid>
      <Grid item xs={12} md={3}><StatCard title="Clients" value={clients.total ?? '–'} /></Grid>
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography gutterBottom variant="h5" align='center'>Numărul de AWB-uri emise pe zile în {currentMonth} </Typography>
            <div style={{ width: '100%', height: 320 }}>
              <ResponsiveContainer>
                <BarChart data={series}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="day"
                    tickCount={31}
                    interval={0}
                    label={{ value: 'Zilele lunii', position: 'insideBottom', offset: -5 }}
                  />
                  <YAxis
                    allowDecimals={false}
                    label={{ value: 'Număr AWB-uri', angle: -90, position: 'insideLeft', offset: 10 }}
                  />
                  <Tooltip />
                  <Bar dataKey="total" fill="#1976d2" name="AWB-uri" isAnimationActive={!loading} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}


