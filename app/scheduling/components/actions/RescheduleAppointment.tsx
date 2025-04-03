'use client';

import { Modal } from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { getQuestionnaireAnswers, normalizeErrorString } from '@medplum/core';
import { Appointment, Questionnaire, QuestionnaireResponse } from '@medplum/fhirtypes';
import { QuestionnaireForm, useMedplum } from '@medplum/react';
import { IconCircleCheck, IconCircleOff } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';

interface RescheduleAppointmentProps {
  appointment: Appointment;
  readonly opened: boolean;
  readonly handlers: {
    readonly open: () => void;
    readonly close: () => void;
    readonly toggle: () => void;
  };
}

export function RescheduleAppointment(props: RescheduleAppointmentProps): JSX.Element {
  const { appointment, opened, handlers } = props;
  const medplum = useMedplum();
  const router = useRouter();

  async function handleQuestionnaireSubmit(formData: QuestionnaireResponse): Promise<void> {
    try {
      const answers = getQuestionnaireAnswers(formData);
      const start = new Date(answers.start as string);
      const end = new Date(start.getTime() + 30 * 60000); // 30 minutes duration

      await medplum.updateResource({
        ...appointment,
        start: start.toISOString(),
        end: end.toISOString(),
      });

      showNotification({
        icon: <IconCircleCheck />,
        title: 'Success',
        message: 'Appointment rescheduled.',
        color: 'green',
      });

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

  return (
    <Modal opened={opened} onClose={handlers.close} title="Reschedule Appointment">
      <QuestionnaireForm
        questionnaire={{
          resourceType: 'Questionnaire',
          id: 'reschedule-appointment',
          title: 'Reschedule Appointment',
          item: [
            {
              linkId: 'start',
              text: 'New Date and Time',
              type: 'dateTime',
              required: true,
            },
          ],
        }}
        onSubmit={handleQuestionnaireSubmit}
      />
    </Modal>
  );
}
