'use client';

import { Tabs, Title } from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { Resource, ResourceType } from '@medplum/fhirtypes';
import { ResourceForm, ResourceHistoryTable, ResourceTable, useMedplum } from '@medplum/react';
import { IconCircleCheck, IconCircleOff } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

/**
 * This is an example of a generic "Resource Display" page.
 * It uses the Medplum `<ResourceTable>` component to display a resource.
 * @returns A React component that displays a resource.
 */
export function ResourcePage(): JSX.Element | null {
  const medplum = useMedplum();
  const router = useRouter();
  const params = useParams();
  const [resource, setResource] = useState<Resource | undefined>(undefined);

  function handleTabChange(newTab: string | null): void {
    if (newTab) {
      router.push(`/${params.resourceType}/${params.id}/${newTab}`);
    }
  }

  useEffect(() => {
    const resourceType = params.resourceType as string;
    const id = params.id as string;
    if (resourceType && id) {
      medplum
        .readResource(resourceType as ResourceType, id)
        .then(setResource)
        .catch((err) => {
          console.error(err);
          router.push('/');
        });
    }
  }, [medplum, params, router]);

  function handleResourceEdit(resource: Resource): void {
    const resourceType = params.resourceType as string;
    const id = params.id as string;
    if (resourceType && id) {
      medplum
        .updateResource(resource)
        .then(() => {
          showNotification({
            title: 'Success',
            message: 'Resource edited.',
            color: 'green',
            icon: <IconCircleCheck />,
          });
          router.push(`/${resourceType}/${id}/details`);
          window.scroll(0, 0);
        })
        .catch((err) => {
          showNotification({
            title: 'Error',
            message: err.message,
            color: 'red',
            icon: <IconCircleOff />,
          });
        });
    }
  }

  if (!resource) {
    return null;
  }

  return (
    <div>
      <Title order={1}>{resource.resourceType}</Title>
      <Tabs defaultValue="details" onChange={handleTabChange}>
        <Tabs.List>
          <Tabs.Tab value="details">Details</Tabs.Tab>
          <Tabs.Tab value="edit">Edit</Tabs.Tab>
          <Tabs.Tab value="history">History</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="details">
          <ResourceTable value={resource} ignoreMissingValues={true} />
        </Tabs.Panel>
        <Tabs.Panel value="edit">
          <ResourceForm defaultValue={resource} onSubmit={handleResourceEdit} />
        </Tabs.Panel>
        <Tabs.Panel value="history">
          <ResourceHistoryTable resourceType={params.resourceType as string} id={params.id as string} />
        </Tabs.Panel>
      </Tabs>
    </div>
  );
}
