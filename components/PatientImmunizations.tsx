import { formatSearchQuery, Operator, SearchRequest } from '@medplum/core';
import { Patient } from '@medplum/fhirtypes';
import { SearchControl } from '@medplum/react';
import { useRouter } from 'next/navigation';

interface PatientImmunizationsProps {
  patient: Patient;
}

export function PatientImmunizations(props: PatientImmunizationsProps): JSX.Element {
  const router = useRouter();

  const search: SearchRequest = {
    resourceType: 'Immunization',
    filters: [{ code: 'patient', operator: Operator.EQUALS, value: `Patient/${props.patient.id}` }],
    fields: ['status', 'vaccineCode', 'occurrenceDateTime'],
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
