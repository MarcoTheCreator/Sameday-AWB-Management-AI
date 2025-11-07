import { Edit, SimpleForm, TextInput } from 'react-admin';

export default function ClientEdit() {
  return (
    <Edit>
      <SimpleForm>
        <TextInput source="id" disabled />
        <TextInput source="name" fullWidth />
        <TextInput source="phone" fullWidth />
        <TextInput source="email" fullWidth />
      </SimpleForm>
    </Edit>
  );
}


