import { List, Datagrid, TextField, EditButton, NumberField } from 'react-admin';

export default function ProductList() {
  return (
    <List>
      <Datagrid rowClick="edit">
        <TextField source="id" label="ID" />
        <TextField source="name" label="Nume" />
        <NumberField source="price" label="Preț" locales="ro-RO" options={{ style: 'currency', currency: 'RON' }} />
        <TextField source="weight" label="Greutate" />
      </Datagrid>
    </List>
  );
}


