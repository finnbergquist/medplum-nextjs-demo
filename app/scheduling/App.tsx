'use client';

import { createReference, getReferenceString } from '@medplum/core';
import { Practitioner, Schedule } from '@medplum/fhirtypes';
import { AppShell, ErrorBoundary, Loading, Logo, useMedplum, useMedplumProfile } from '@medplum/react';
import {
  IconCalendar,
  IconClipboard,
  IconDatabaseImport,
  IconHealthRecognition,
  IconRobot,
  IconUser,
} from '@tabler/icons-react';
import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { AppointmentDetailPage } from './pages/AppointmentDetailPage';
import { AppointmentsPage } from './pages/AppointmentsPage';
import { PatientPage } from './pages/PatientPage';
import { PatientSchedulePage } from './pages/PatientSchedulePage';
import { ResourcePage } from './pages/ResourcePage';
import { SchedulePage } from './pages/SchedulePage';
import { SearchPage } from './pages/SearchPage';
import { UploadDataPage } from './pages/UploadDataPage';
import { ScheduleContext } from './Schedule.context';

export function App(): JSX.Element | null {
  const medplum = useMedplum();
  const profile = useMedplumProfile() as Practitioner;
  const pathname = usePathname();
  const router = useRouter();
  const [schedule, setSchedule] = useState<Schedule | undefined>();

  useEffect(() => {
    if (medplum.isLoading() || !profile) {
      return;
    }

    // Search for a Schedule associated with the logged user,
    // create one if it doesn't exist
    medplum
      .searchOne('Schedule', { actor: getReferenceString(profile) })
      .then((foundSchedule) => {
        if (foundSchedule) {
          setSchedule(foundSchedule);
        } else {
          medplum
            .createResource({
              resourceType: 'Schedule',
              actor: [createReference(profile)],
              active: true,
            })
            .then(setSchedule)
            .catch((err) => {
              console.log(err);
            });
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }, [medplum, profile]);

  // Redirect to schedule page if we're at the root
  useEffect(() => {
    if (pathname === '/scheduling') {
      router.push('/scheduling/schedule');
    }
  }, [pathname, router]);

  if (medplum.isLoading()) {
    return <Loading />;
  }

  const renderContent = () => {
    // Handle appointment routes
    if (pathname.startsWith('/scheduling/appointment/')) {
      const parts = pathname.split('/');
      if (parts.length === 4) {
        // /scheduling/appointment/:id
        return <AppointmentDetailPage />;
      } else if (parts.length === 5) {
        // /scheduling/appointment/:type (upcoming/past)
        return <AppointmentsPage />;
      }
    }

    // Handle other routes
    switch (pathname) {
      case '/scheduling/appointments':
        return <AppointmentsPage />;
      case '/scheduling/schedule':
        return <SchedulePage />;
      case '/scheduling/schedule/:id':
        return schedule ? <SchedulePage /> : <Loading />;
      case '/scheduling/patient/:patientId/schedule/:scheduleId':
        return schedule ? <PatientSchedulePage /> : <Loading />;
      case '/scheduling/patient/:id':
        return <PatientPage />;
      case '/scheduling/upload/:dataType':
        return <UploadDataPage />;
      case '/scheduling/:resourceType':
        return <SearchPage />;
      case '/scheduling/:resourceType/:id':
        return <ResourcePage />;
      default:
        return <SchedulePage />;
    }
  };

  return (
    <AppShell
      logo={<Logo size={24} />}
      menus={[
        {
          title: 'Charts',
          links: [{ icon: <IconUser />, label: 'Patients', href: '/Patient' }],
        },
        {
          title: 'Schedule',
          links: [
            {
              icon: <IconCalendar />,
              label: 'My Schedule',
              href: '/Schedule',
            },
            {
              icon: <IconClipboard />,
              label: 'My Appointments',
              href: '/Appointment/upcoming',
            },
          ],
        },
        {
          title: 'Upload Data',
          links: [
            { icon: <IconDatabaseImport />, label: 'Upload Core ValueSets', href: '/upload/core' },
            { icon: <IconRobot />, label: 'Upload Example Bots', href: '/upload/bots' },
            { icon: <IconHealthRecognition />, label: 'Upload Example Data', href: '/upload/example' },
          ],
        },
      ]}
    >
      <ScheduleContext.Provider value={{ schedule: schedule }}>
        <ErrorBoundary>
          <Suspense fallback={<Loading />}>
            {renderContent()}
          </Suspense>
        </ErrorBoundary>
      </ScheduleContext.Provider>
    </AppShell>
  );
}
