'use client';

import { Button, Title } from '@mantine/core';
import { Container, ResourceTable, SignInForm, useMedplum, useMedplumProfile } from '@medplum/react';
import { Suspense } from 'react';
import { useRouter } from 'next/navigation';

// Medplum can autodetect Google Client ID from origin, but only if using window.location.host.
// Because window.location.host is not available on the server, we must use a constant value.
// This is a pre-defined Google Client ID for localhost:3000.
// You will need to register your own Google Client ID for your own domain.
const googleClientId = '921088377005-3j1sa10vr6hj86jgmdfh2l53v3mp7lfi.apps.googleusercontent.com';

export default function HomePage(): JSX.Element {
  const medplum = useMedplum();
  const profile = useMedplumProfile();
  const router = useRouter();
  return (
    <Container mt="xl">
      <Title order={1} my="xl">
        Welcome to Medplum &amp; Next.js &amp; GutAlly!
      </Title>
      {!profile && <SignInForm googleClientId={googleClientId}>Sign in</SignInForm>}
      {profile && (
        <Suspense fallback={<div>Loading...</div>}>
          <Title order={3} my="xl">
            Profile
          </Title>
          <ResourceTable value={profile} ignoreMissingValues />
          <Button onClick={() => medplum.signOut()}>Sign out</Button>
          <Button onClick={() => router.push('/patientintake')} style={{ marginLeft: '10px' }}>
            Patient Intake Form
          </Button>
          <Button onClick={() => router.push('/scheduling')} style={{ marginLeft: '10px' }}>
            Scheduling Components
          </Button>
        </Suspense>
      )}
    </Container>
  );
}
