'use client';

import { useMedplum } from '@medplum/react';
import { Patient } from '@medplum/fhirtypes';
import { useEffect, useState } from 'react';
import { Loading } from '../../../../components/Loading';
import { PatientDetails } from '../../../../components/PatientDetails';
import { useRouter } from 'next/navigation';

interface PatientPageProps {
  params: {
    id: string;
  };
}

export default function PatientPage(props: PatientPageProps): JSX.Element {
  const medplum = useMedplum();
  const router = useRouter();
  const [patient, setPatient] = useState<Patient | undefined>();

  useEffect(() => {
    medplum
      .readResource('Patient', props.params.id)
      .then((p) => setPatient(p))
      .catch((err) => {
        console.error('Error loading patient:', err);
        router.push('/scheduling');
      });
  }, [medplum, props.params.id, router]);

  if (!patient) {
    return <Loading />;
  }

  return (
    <div style={{ padding: '20px' }}>
      <PatientDetails
        patient={patient}
        onChange={(updatedPatient) => setPatient(updatedPatient)}
      />
    </div>
  );
} 