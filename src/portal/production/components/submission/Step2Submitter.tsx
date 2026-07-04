import { useFormContext } from 'react-hook-form';
import type { WizardFormData } from '../../pages/SubmitPage';
import { DkField } from '../../../../components/dk/DkField';

export function Step2Submitter() {
  const {
    register,
    formState: { errors },
  } = useFormContext<WizardFormData>();

  return (
    <div className="space-y-5">
      <p className="text-sm text-gray-500">
        Confirm who is submitting this work. This information is captured as part of the
        consent record and is only visible to Didactik admin.
      </p>

      <DkField
        label="Your full name"
        required
        error={errors.submitter_name?.message as string | undefined}
      >
        <input
          type="text"
          {...register('submitter_name')}
          placeholder="As it appears on official documents"
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
      </DkField>

      <DkField
        label="Contact email or phone"
        required
        hint="Didactik will use this to contact you about your submission status."
        error={errors.submitter_contact?.message as string | undefined}
      >
        <input
          type="text"
          {...register('submitter_contact')}
          placeholder="Email or phone number"
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
      </DkField>
    </div>
  );
}
