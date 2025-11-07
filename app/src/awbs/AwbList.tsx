import { List, Datagrid, TextField, TopToolbar, CreateButton, DateInput, NumberField, useRecordContext, useNotify } from 'react-admin';
import { useMemo, useState } from 'react';
import { Button } from '@mui/material';
import { getToken } from '../auth/authProvider';

const dateToYMD = (d: Date) => d.toISOString().slice(0, 10);

const ListActions = () => (
  <TopToolbar>
    <CreateButton label="Create AWB" />
  </TopToolbar>
);

export default function AwbList() {
  const today = useMemo(() => dateToYMD(new Date()), []);
  return (
    <List
      filters={[<DateInput source="date" label="Data" alwaysOn />]}
      filterDefaultValues={{ date: today }}
      actions={<ListActions />}
      perPage={25}
      sort={{ field: 'createdAt', order: 'DESC' }}
    >
      <Datagrid rowClick={false} bulkActionButtons={false}>
        <TextField source="awbNumber" label="AWB" />
        <TextField source="awbStatus" label="Status" />
        <TextField source="serviceName" label="Serviciu" />
        <TextField source="recipientName" label="Destinatar" />
        <TextField source="recipientAddress" label="Adresă destinatar" />
        <TextField source="recipientCounty" label="Județ destinatar" />
        <TextField source="recipientCity" label="Oraș destinatar" />
        <TextField source="recipientPhone" label="Telefon destinatar" />
        <TextField source="clientObservations" label="Observații client" />
        <NumberField source="cashOnDelivery" label="Ramburs" locales="ro-RO" options={{ style: 'currency', currency: 'RON' }} />
        <DownloadAwbButton />
      </Datagrid>
    </List>
  );
}

function DownloadAwbButton() {
  const record = useRecordContext<any>();
  const notify = useNotify();
  const [downloading, setDownloading] = useState(false);

  if (!record) return null;

  const onClick = async () => {
    if (!record.awbNumber) {
      notify('Număr AWB lipsă', { type: 'error' });
      return;
    }
    setDownloading(true);
    try {
      const token = getToken();
      const headers: Record<string, string> = {};
      if (token) headers['X-Auth-Token'] = token;
      const url = `/api/awb/download/${encodeURIComponent(record.awbNumber)}/A4/pdf/attachment`;
      const res = await fetch(url, { headers });
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(text || `Descărcare eșuată (${res.status})`);
      }
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `${record.awbNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(blobUrl);
    } catch (e: any) {
      notify(e?.message || 'Descărcare eșuată', { type: 'error' });
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Button size="small" variant="outlined" onClick={onClick} disabled={downloading}>
      {downloading ? 'Se descarcă…' : 'Descarcă AWB'}
    </Button>
  );
}


