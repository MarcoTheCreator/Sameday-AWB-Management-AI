import { List, Datagrid, TextField, TopToolbar, CreateButton, BooleanField } from 'react-admin';

const ListActions = () => (
  <TopToolbar>
    <CreateButton />
  </TopToolbar>
);

export default function PickupPointList() {
  return (
    <List actions={<ListActions />}>
      <Datagrid rowClick={false} bulkActionButtons={false}>
        <TextField source="id" label="ID" />
        <TextField source="alias" label="Nume" />
        <TextField source="address" label="Adresă" />
        <TextField source="cutOff" label="Ora limită" />
        <BooleanField source="defaultPickupPoint" label="Implicit" />
        <BooleanField source="status" label="Activ" />
      </Datagrid>
    </List>
  );
}


