'use client';

import { MantineProvider, createTheme } from '@mantine/core';
import '@mantine/core/styles.css';
import { Notifications } from '@mantine/notifications';
import { MedplumClient } from '@medplum/core';
import '@mantine/notifications/styles.css';
import { MedplumProvider } from '@medplum/react';
import '@medplum/react/styles.css';

const medplum = new MedplumClient({
  onUnauthenticated: () => (window.location.href = '/'),
  cacheTime: 5000,
  // baseUrl: 'http://localhost:8103/', //Uncomment this to run against the server on your localhost
});

const theme = createTheme({
  headings: {
    sizes: {
      h1: {
        fontSize: '1.125rem',
        fontWeight: '500',
        lineHeight: '2.0',
      },
    },
  },
  fontSizes: {
    xs: '0.6875rem',
    sm: '0.875rem',
    md: '0.875rem',
    lg: '1.0rem',
    xl: '1.125rem',
  },
});

export default function SchedulingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MedplumProvider medplum={medplum}>
      <MantineProvider theme={theme}>
        <Notifications />
        {children}
      </MantineProvider>
    </MedplumProvider>
  );
} 