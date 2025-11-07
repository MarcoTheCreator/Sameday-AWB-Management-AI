import { Create, SimpleForm, TextInput, NumberInput, SelectInput, required, AutocompleteInput } from 'react-admin';
import { useEffect, useState } from 'react';
import { useWatch } from 'react-hook-form';
import { getToken } from '../auth/authProvider';

function CountySelectInput() {
  const [choices, setChoices] = useState<{ id: number; name: string }[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const headers: Record<string, string> = {};
        const token = getToken();
        if (token) headers['X-Auth-Token'] = token;
        const res = await fetch('/api/geolocation/county', { headers });
        const json = await res.json();
        const list = Array.isArray(json?.data) ? json.data : [];
        if (mounted) setChoices(list as { id: number; name: string }[]);
      } catch {
        if (mounted) setChoices([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <SelectInput
      source="county"
      label="Județ"
      choices={choices}
      optionValue="id"
      optionText="name"
      validate={[required()]}
      fullWidth
      disabled={loading}
    />
  );
}

function CitySelectInput() {
  const countyId = useWatch({ name: 'county' }) as number | undefined;
  const [choices, setChoices] = useState<{ id: number; name: string }[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!countyId) {
        if (mounted) setChoices([]);
        return;
      }
      setLoading(true);
      try {
        const headers: Record<string, string> = {};
        const token = getToken();
        if (token) headers['X-Auth-Token'] = token;

        const url = `/api/geolocation/city?county=${encodeURIComponent(countyId)}`;
        const resCity = await fetch(url, { headers });
        const jsonCity = await resCity.json();
        const list: { id: number; name: string }[] = Array.isArray(jsonCity?.data) ? jsonCity.data : [];
        if (mounted) setChoices(list);
      } catch {
        if (mounted) setChoices([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [countyId]);

  return (
    <AutocompleteInput
      source="city"
      label="Localitate"
      choices={choices}
      optionValue="id"
      optionText="name"
      validate={[required()]}
      fullWidth
      disabled={!countyId || loading}
    />
  );
}

export default function PickupPointCreate() {
  return (
    <Create
      transform={(data: any) => {
        const person = data?.pickupPointContactPerson;
        const wrapped = Array.isArray(person) ? person : [person];
        return { ...data, pickupPointContactPerson: wrapped };
      }}
    >
      <SimpleForm>
        <CountySelectInput />
        <CitySelectInput />
        <TextInput source="address" label="Adresă" validate={[required()]} fullWidth />
        <TextInput source="postalCode" label="Cod poștal" validate={[required()]} fullWidth />
        <TextInput source="alias" label="Alias" validate={[required()]} fullWidth />

        <TextInput source="pickupPointContactPerson.name" label="Persoană contact - Nume" validate={[required()]} fullWidth />
        <TextInput source="pickupPointContactPerson.position" label="Persoană contact - Funcție" fullWidth />
        <TextInput source="pickupPointContactPerson.phoneNumber" label="Persoană contact - Telefon" validate={[required()]} fullWidth />
        <TextInput source="pickupPointContactPerson.email" label="Persoană contact - Email" fullWidth />
      </SimpleForm>
    </Create>
  );
}


