import { Create, SimpleForm, TextInput } from 'react-admin';

export default function ClientCreate() {
  return (
    <Create>
      <SimpleForm>
        <TextInput source="name" fullWidth />
        <TextInput source="phone" fullWidth />
        <TextInput source="email" fullWidth />
      </SimpleForm>
    </Create>
  );
}


