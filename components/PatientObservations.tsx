import { formatSearchQuery, Operator, SearchRequest } from '@medplum/core';
import { Patient } from '@medplum/fhirtypes';
import { SearchControl } from '@medplum/react';
import { useRouter } from 'next/navigation';

interface PatientObservationsProps {
  patient: Patient;
}

export function PatientObservations(props: PatientObservationsProps): JSX.Element {
  const router = useRouter();

  const search: SearchRequest = {
    resourceType: 'Observation',
    filters: [
      { code: 'patient', operator: Operator.EQUALS, value: `Patient/${props.patient.id}` },
      { code: 'category', operator: Operator.EQUALS, value: 'sdoh' },
    ],
    fields: ['code', 'value[x]'],
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
