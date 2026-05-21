import { useFormContext } from 'react-hook-form';
import type { WizardFormData } from '../../pages/SubmitPage';

function FieldError({ name }: { name: keyof WizardFormData }) {
  const { formState: { errors } } = useFormContext<WizardFormData>();
  const error = errors[name];
  if (!error) return null;
  return <p className="mt-1 text-xs text-red-600">{error.message as string}</p>;
}

export function Step2Submitter() {
  const { register } = useFormContext<WizardFormData>();

  return (
    <div className="space-y-5">
      <p className="text-sm text-gray-500">
        Confirm who is submitting this work. This information is captured as part of the
        consent record and is only visible to Didactik admin.
      </p>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Your full name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          {...register('submitter_name')}
          placeholder="As it appears on official documents"
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
        <FieldError name="submitter_name" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Contact email or phone <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          {...register('submitter_contact')}
          placeholder="Email or phone number"
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
        <p className="mt-1 text-xs text-gray-400">
          Didactik will use this to contact you about your submission status.
        </p>
        <FieldError name="submitter_contact" />
      </div>
    </div>
  );
}
