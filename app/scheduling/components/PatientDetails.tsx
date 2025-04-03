'use client';

import { Tabs } from '@mantine/core';
import { Filter, Operator, SearchRequest } from '@medplum/core';
import { Patient } from '@medplum/fhirtypes';
import { Document, ResourceTable, SearchControl } from '@medplum/react';
import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface PatientDetailsProps {
  patient: Patient;
}

export function PatientDetails(props: PatientDetailsProps): JSX.Element {
  const { patient } = props;
  const router = useRouter();
  const pathname = usePathname();

  // Filters to be used in SearchControl search
  const patientFilter: Filter = {
    code: 'patient',
    operator: Operator.EQUALS,
    value: `Patient/${patient.id}`,
  };

  // Search state to control the SearchControl components
  const [appointmentsSearch, setAppointmentsSearch] = useState<SearchRequest>({
    resourceType: 'Appointment',
    fields: ['date', 'status'],
    filters: [patientFilter],
    sortRules: [
      {
        code: '-date',
      },
    ],
  });

  // Get the current tab from the pathname
  const currentTab = pathname.split('/').pop() || 'details';

  function handleTabChange(newTab: string | null): void {
    if (newTab) {
      router.push(`/patient/${patient.id}/${newTab}`);
    }
  }

  function handleResourceClick(resourceType: string, id: string): void {
    router.push(`/${resourceType}/${id}`);
  }

  return (
    <Document>
      <Tabs value={currentTab} onChange={handleTabChange}>
        <Tabs.List>
          <Tabs.Tab value="details">Details</Tabs.Tab>
          <Tabs.Tab value="appointments">Appointments</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="details">
          <ResourceTable value={patient} ignoreMissingValues={true} />
        </Tabs.Panel>
        <Tabs.Panel value="appointments">
          <SearchControl
            search={appointmentsSearch}
            onChange={(e) => setAppointmentsSearch(e.definition)}
            onClick={(e) => {
              if (e.resource.resourceType && e.resource.id) {
                handleResourceClick(e.resource.resourceType, e.resource.id);
              }
            }}
            onAuxClick={(e) => window.open(`/${e.resource.resourceType}/${e.resource.id}`, '_blank')}
            hideFilters
          />
        </Tabs.Panel>
      </Tabs>
    </Document>
  );
}
