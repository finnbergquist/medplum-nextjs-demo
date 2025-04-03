import { formatSearchQuery, Operator, SearchRequest } from '@medplum/core';
import { Patient } from '@medplum/fhirtypes';
import { SearchControl } from '@medplum/react';
import { useRouter } from 'next/navigation';

interface PatientConsentsProps {
  patient: Patient;
}

export function PatientConsents(props: PatientConsentsProps): JSX.Element {
  const router = useRouter();

  const search: SearchRequest = {
    resourceType: 'Consent',
    filters: [{ code: 'patient', operator: Operator.EQUALS, value: `Patient/${props.patient.id}` }],
    fields: ['status', 'scope', 'category'],
  };

  return (
    <SearchControl
      search={search}
      hideFilters={true}
      hideToolbar={true}
      onClick={(e) => router.push(`/${e.resource.resourceType.toLowerCase()}/${e.resource.id}`)}
      onChange={(e) => {
        router.push(`/${search.resourceType.toLowerCase()}${formatSearchQuery(e.definition)}`);
      }}
    />
  );
}
