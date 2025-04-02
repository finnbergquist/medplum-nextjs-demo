'use client';

import { SearchControl } from '@medplum/react';
import { SearchRequest } from '@medplum/core';
import { useRouter } from 'next/navigation';

export default function PatientsPage(): JSX.Element {
  const router = useRouter();

  const search: SearchRequest = {
    resourceType: 'Patient',
    fields: ['name', 'birthDate', 'gender'],
  };

  return (
    <div style={{ padding: '20px' }}>
      <SearchControl
        search={search}
        onClick={(e) => router.push(`/scheduling/patient/${e.resource.id}`)}
        onChange={(e) => {
          router.push(`/scheduling/patients${e.definition ? `?${e.definition}` : ''}`);
        }}
      />
    </div>
  );
} 