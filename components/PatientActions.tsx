import { Button, Stack, Title } from '@mantine/core';
import { getReferenceString } from '@medplum/core';
import { Patient } from '@medplum/fhirtypes';
import { useMedplum } from '@medplum/react';
import { IconEye } from '@tabler/icons-react';
import { useContext } from 'react';
import { useRouter } from 'next/navigation';
import { IntakeQuestionnaireContext } from '../Questionnaire.context';

interface PatientActionsProps {
  patient: Patient;
  onChange: (patient: Patient) => void;
}

export function PatientActions(props: PatientActionsProps): JSX.Element {
  const medplum = useMedplum();
  const router = useRouter();

  const { questionnaire } = useContext(IntakeQuestionnaireContext);
  const questionnaireResponse = questionnaire
    ? medplum
        .searchOne('QuestionnaireResponse', {
          subject: getReferenceString(props.patient),
          questionnaire: questionnaire.url,
        })
        .read()
    : null;

  function handleViewIntakeForm(): void {
    router.push(`/patient/${props.patient.id}/intake/${questionnaireResponse?.id}`);
  }

  return (
    <Stack p="xs" m="xs">
      <Title>Patient Actions</Title>

      <Button leftSection={<IconEye size={16} />} onClick={handleViewIntakeForm} disabled={!questionnaireResponse}>
        View Intake Form
      </Button>
    </Stack>
  );
}
