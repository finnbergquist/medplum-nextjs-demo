'use client';

import { Patient } from '@medplum/fhirtypes';
import { useMedplum } from '@medplum/react';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { PatientDetails } from '../components/PatientDetails';

export function PatientPage(): JSX.Element | null {
  const medplum = useMedplum();
  const params = useParams();
  const [patient, setPatient] = useState<Patient | undefined>();

  useEffect(() => {
    const id = params.id as string;
    if (id) {
      medplum
        .readResource('Patient', id)
        .then(setPatient)
        .catch(console.error);
    }
  }, [medplum, params]);

  if (!patient) {
    return null;
  }

  return <PatientDetails patient={patient} />;
}
