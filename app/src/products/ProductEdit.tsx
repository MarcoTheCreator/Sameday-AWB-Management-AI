import { Edit, SimpleForm, TextInput, NumberInput } from 'react-admin';

export default function ProductEdit() {
  return (
    <Edit>
      <SimpleForm>
        <TextInput source="id" disabled />
        <TextInput source="name" fullWidth />
        <TextInput source="sku" fullWidth />
        <NumberInput source="price" />
        <NumberInput source="weight" />
        <TextInput source="description" multiline fullWidth />
      </SimpleForm>
    </Edit>
  );
}


