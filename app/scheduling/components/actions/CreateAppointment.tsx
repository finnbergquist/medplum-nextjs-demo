'use client';

import { Button, Group, Modal } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { showNotification } from '@mantine/notifications';
import { createReference, getQuestionnaireAnswers, normalizeErrorString } from '@medplum/core';
import {
  Appointment,
  Coding,
  Patient,
  Practitioner,
  Questionnaire,
  QuestionnaireResponse,
  Reference,
  Slot,
} from '@medplum/fhirtypes';
import { QuestionnaireForm, useMedplum, useMedplumProfile } from '@medplum/react';
import { IconCircleCheck, IconCircleOff, IconEdit, IconTrash } from '@tabler/icons-react';
import { Event } from 'react-big-calendar';
import { useRouter } from 'next/navigation';
import { CreateUpdateSlot } from './CreateUpdateSlot';

interface CreateAppointmentProps {
  patient?: Patient;
  event: Event | undefined;
  readonly opened: boolean;
  readonly handlers: {
    readonly open: () => void;
    readonly close: () => void;
    readonly toggle: () => void;
  };
  readonly onAppointmentsUpdated: () => void;
}

/**
 * CreateAppointment component that allows the user to create an appointment from a slot.
 * @param props - CreateAppointmentProps
 * @returns A React component that displays the modal.
 */
export function CreateAppointment(props: CreateAppointmentProps): JSX.Element | null {
  const { patient, event, opened, handlers, onAppointmentsUpdated } = props;
  const slot: Slot | undefined = event?.resource;

  const [updateSlotOpened, updateSlotHandlers] = useDisclosure(false, { onClose: handlers.close });
  const medplum = useMedplum();
  const profile = useMedplumProfile() as Practitioner;
  const router = useRouter();

  // If a patient is provided, remove the patient question from the questionnaire
  if (patient) {
    createAppointmentQuestionnaire.item = createAppointmentQuestionnaire.item?.filter((i) => i.linkId !== 'patient');
  }

  async function handleDeleteSlot(slotId: string): Promise<void> {
    try {
      await medplum.deleteResource('Slot', slotId);
      showNotification({
        icon: <IconCircleCheck />,
        title: 'Success',
        message: 'Slot deleted.',
        color: 'green',
      });
      onAppointmentsUpdated();
      handlers.close();
      router.push('/schedule');
    } catch (err) {
      showNotification({
        icon: <IconCircleOff />,
        title: 'Error',
        message: normalizeErrorString(err),
        color: 'red',
      });
    }
  }

  async function handleQuestionnaireSubmit(formData: QuestionnaireResponse): Promise<void> {
    try {
      const answers = getQuestionnaireAnswers(formData);
      const patientId = patient?.id || answers.patient?.valueReference?.reference?.split('/')[1];
      if (!patientId) {
        throw new Error('No patient selected');
      }

      const appointment = await medplum.createResource<Appointment>({
        resourceType: 'Appointment',
        status: 'booked',
        start: slot?.start,
        end: slot?.end,
        slot: [createReference(slot as Slot)],
        participant: [
          {
            actor: createReference({ resourceType: 'Patient', id: patientId }),
            status: 'accepted',
          },
          {
            actor: createReference(profile),
            status: 'accepted',
          },
        ],
        serviceType: [
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
      });

      showNotification({
        icon: <IconCircleCheck />,
        title: 'Success',
        message: 'Appointment created.',
        color: 'green',
      });

      onAppointmentsUpdated();
      handlers.close();
      router.push(`/Appointment/${appointment.id}`);
    } catch (err) {
      showNotification({
        icon: <IconCircleOff />,
        title: 'Error',
        message: normalizeErrorString(err),
        color: 'red',
      });
    }
  }

  if (!slot) {
    return null;
  }

  return (
    <>
      <Modal opened={opened} onClose={handlers.close} title="Create Appointment">
        <Group justify="flex-end" mb="xs">
          <Button
            variant="light"
            color="red"
            leftSection={<IconTrash size={16} />}
            onClick={() => slot?.id && handleDeleteSlot(slot.id)}
          >
            Delete Slot
          </Button>
          <Button
            variant="light"
            color="blue"
            leftSection={<IconEdit size={16} />}
            onClick={() => updateSlotHandlers.open()}
          >
            Edit Slot
          </Button>
        </Group>
        <QuestionnaireForm questionnaire={createAppointmentQuestionnaire} onSubmit={handleQuestionnaireSubmit} />
      </Modal>
      <CreateUpdateSlot
        event={event}
        opened={updateSlotOpened}
        handlers={updateSlotHandlers}
        onSlotsUpdated={onAppointmentsUpdated}
      />
    </>
  );
}

const createAppointmentQuestionnaire: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'create-appointment',
  title: 'Create Appointment',
  status: 'active',
  item: [
    {
      linkId: 'patient',
      type: 'reference',
      text: 'Patient',
      required: true,
    },
  ],
};
