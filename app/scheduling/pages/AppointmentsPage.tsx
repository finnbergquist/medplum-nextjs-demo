'use client';

import { Paper, Tabs } from '@mantine/core';
import { Filter, getReferenceString, Operator, SearchRequest, WithId } from '@medplum/core';
import { Practitioner } from '@medplum/fhirtypes';
import { SearchControl, useMedplumProfile } from '@medplum/react';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export function AppointmentsPage(): JSX.Element {
  const profile = useMedplumProfile() as WithId<Practitioner>;
  const router = useRouter();
  const pathname = usePathname();

  const tab = pathname.split('/').pop() ?? '';

  const tabs = [
    ['upcoming', 'Upcoming'],
    ['past', 'Past'],
  ];

  const upcomingFilter: Filter = {
    code: 'date',
    operator: Operator.STARTS_AFTER,
    value: new Date().toISOString(),
  };
  const pastFilter: Filter = {
    code: 'date',
    operator: Operator.ENDS_BEFORE,
    value: new Date().toISOString(),
  };

  // Start the SearchRequest with the appropriate filter depending on the active tab
  const [search, setSearch] = useState<SearchRequest>({
    resourceType: 'Appointment',
    fields: ['patient', 'start', 'end', 'status', 'appointmentType', 'serviceType'],
    filters: [
      { code: 'actor', operator: Operator.EQUALS, value: getReferenceString(profile) },
      tab === 'upcoming' ? upcomingFilter : pastFilter,
    ],
    sortRules: [
      {
        code: 'date',
      },
    ],
  });

  // Ensure tab is either 'upcoming' or 'past'
  // if it's neither, navigate to the 'upcoming' tab
  useEffect(() => {
    if (!['upcoming', 'past'].includes(tab)) {
      router.push('/appointment/upcoming');
    }
  }, [tab, router]);

  function changeTab(newTab: string | null): void {
    if (newTab) {
      router.push(`/appointment/${newTab}`);
    }
  }

  return (
    <Paper p="md">
      <Tabs value={tab} onChange={changeTab}>
        <Tabs.List>
          {tabs.map((tab) => (
            <Tabs.Tab value={tab[0]} key={tab[0]}>
              {tab[1]}
            </Tabs.Tab>
          ))}
        </Tabs.List>
        <Tabs.Panel value="upcoming">
          <SearchControl
            search={search}
            onChange={(e) => setSearch(e.definition)}
            onClick={(e) => router.push(`/${e.resource.resourceType}/${e.resource.id}`)}
            onAuxClick={(e) => window.open(`/${e.resource.resourceType}/${e.resource.id}`, '_blank')}
            hideFilters
          />
        </Tabs.Panel>
        <Tabs.Panel value="past">
          <SearchControl
            search={search}
            onChange={(e) => setSearch(e.definition)}
            onClick={(e) => router.push(`/${e.resource.resourceType}/${e.resource.id}`)}
            onAuxClick={(e) => window.open(`/${e.resource.resourceType}/${e.resource.id}`, '_blank')}
            hideFilters
          />
        </Tabs.Panel>
      </Tabs>
    </Paper>
  );
}
