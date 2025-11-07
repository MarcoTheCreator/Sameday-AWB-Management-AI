import { Create, SimpleForm, TextInput, NumberInput } from 'react-admin';

export default function ProductCreate() {
  return (
    <Create>
      <SimpleForm>
        <TextInput source="name" fullWidth />
        <TextInput source="sku" fullWidth />
        <NumberInput source="price" />
        <NumberInput source="weight" />
        <TextInput source="description" multiline fullWidth />
      </SimpleForm>
    </Create>
  );
}


