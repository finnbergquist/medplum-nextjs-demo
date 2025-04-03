import { Title } from '@mantine/core';
import { Logo, SignInForm } from '@medplum/react';
import { useRouter } from 'next/navigation';

export function SignInPage(): JSX.Element {
  const router = useRouter();
  return (
    <SignInForm
      // Configure according to your settings
      googleClientId="921088377005-3j1sa10vr6hj86jgmdfh2l53v3mp7lfi.apps.googleusercontent.com"
      onSuccess={() => router.push('/')}
    >
      <Logo size={32} />
      <Title>Sign in to Medplum</Title>
    </SignInForm>
  );
}
