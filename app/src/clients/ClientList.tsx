import { List, Datagrid, TextField, EditButton } from 'react-admin';

export default function ClientList() {
  return (
    <List>
      <Datagrid rowClick="edit">
        <TextField source="id" label="ID" />
        <TextField source="name" label="Nume" />
        <TextField source="phoneNumber" label="Telefon" />
        <TextField source="email" label="Email" />
        <TextField source="county" label="Județ" />
        <TextField source="city" label="Oraș" />
        <TextField source="address" label="Adresă" />
        <TextField source="postalCode" label="Cod poștal" />
      </Datagrid>
    </List>
  );
}


