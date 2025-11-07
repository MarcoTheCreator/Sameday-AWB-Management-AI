import * as React from 'react';
import { Layout, AppBar, TitlePortal } from 'react-admin';
import { Box } from '@mui/material';

function MyAppBar(props: any) {
  return (
    <AppBar {...props}>
      <TitlePortal />
      <Box sx={{ flex: 1 }} />
      <Box sx={{ pr: 2, display: 'flex', alignItems: 'center' }}>
        <img src="/resources/sameday-logo.png" alt="Sameday" style={{ height: 44 }} />
      </Box>
    </AppBar>
  );
}

export default function MyLayout(props: any) {
  return <Layout {...props} appBar={MyAppBar as any} />;
}


