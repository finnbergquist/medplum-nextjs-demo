'use client';

import { Modal } from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { createReference, getQuestionnaireAnswers, normalizeErrorString } from '@medplum/core';
import { Appointment, Coding, Encounter, Patient, Practitioner, Questionnaire, Reference } from '@medplum/fhirtypes';
import { useMedplum, QuestionnaireForm } from '@medplum/react';
import { IconCircleCheck, IconCircleOff } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';

interface CreateEncounterProps {
  appointment: Appointment;
  patient: Patient;
  readonly opened: boolean;
  readonly handlers: {
    readonly open: () => void;
    readonly close: () => void;
    readonly toggle: () => void;
  };
}

export function CreateEncounter(props: CreateEncounterProps): JSX.Element {
  const { appointment, patient, opened, handlers } = props;
  const medplum = useMedplum();
  const router = useRouter();

  async function handleCreateEncounter(formData: any): Promise<void> {
    try {
      const answers = getQuestionnaireAnswers(formData);
      const practitioner = await medplum.getProfile() as Practitioner;
      const encounter = await medplum.createResource<Encounter>({
        resourceType: 'Encounter',
        status: 'finished',
        class: {
          system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode',
          code: 'AMB',
          display: 'ambulatory',
        },
        type: [
          {
            coding: [
              {
                system: 'http://snomed.info/sct',
                code: '185345009',
                display: 'Encounter for check up',
              },
            ],
          },
        ],
        subject: createReference(patient),
        participant: [
          {
            individual: createReference(practitioner),
          },
        ],
        appointment: [createReference(appointment)],
        reasonCode: answers.reasonCode ? [{
          coding: [
            {
              system: 'http://snomed.info/sct',
              code: answers.reasonCode as string,
              display: answers.reasonCode as string,
            },
          ],
        }] : undefined,
      });

      showNotification({
        icon: <IconCircleCheck />,
        title: 'Success',
        message: 'Encounter created.',
        color: 'green',
      });

      handlers.close();
      router.push(`/Encounter/${encounter.id}`);
    } catch (err) {
      showNotification({
        icon: <IconCircleOff />,
        title: 'Error',
        message: normalizeErrorString(err),
        color: 'red',
      });
    }
  }

  return (
    <Modal opened={opened} onClose={handlers.close} title="Create Encounter">
      <QuestionnaireForm
        questionnaire={{
          resourceType: 'Questionnaire',
          id: 'create-encounter',
          title: 'Create Encounter',
          item: [
            {
              linkId: 'reasonCode',
              text: 'Reason for Visit',
              type: 'choice',
              answerOption: [
                {
                  valueCoding: {
                    system: 'http://snomed.info/sct',
                    code: '185345009',
                    display: 'Encounter for check up',
                  },
                },
                {
                  valueCoding: {
                    system: 'http://snomed.info/sct',
                    code: '185345009',
                    display: 'Encounter for check up',
                  },
                },
              ],
            },
          ],
        }}
        onSubmit={handleCreateEncounter}
      />
    </Modal>
  );
}
