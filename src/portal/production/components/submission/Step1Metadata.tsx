import { useFormContext } from 'react-hook-form';
import type { WizardFormData } from '../../pages/SubmitPage';

const ASSET_TYPES = [
  { value: 'feature_film',        label: 'Feature Film' },
  { value: 'short_film',          label: 'Short Film' },
  { value: 'documentary',         label: 'Documentary' },
  { value: 'tv_episode',          label: 'TV Episode' },
  { value: 'music_video',         label: 'Music Video' },
  { value: 'broadcast_recording', label: 'Broadcast Recording' },
  { value: 'interview',           label: 'Interview' },
  { value: 'other',               label: 'Other' },
] as const;

function FieldError({ name }: { name: keyof WizardFormData }) {
  const { formState: { errors } } = useFormContext<WizardFormData>();
  const error = errors[name];
  if (!error) return null;
  return <p className="mt-1 text-xs text-red-600">{error.message as string}</p>;
}

export function Step1Metadata() {
  const { register } = useFormContext<WizardFormData>();

  return (
    <div className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          {...register('title')}
          placeholder="Working or anglicised title"
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
        <FieldError name="title" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Original title
          <span className="ml-1 text-xs text-gray-400">(optional — title in original language)</span>
        </label>
        <input
          type="text"
          {...register('original_title')}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
        <FieldError name="original_title" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Asset type <span className="text-red-500">*</span>
        </label>
        <select
          {...register('asset_type')}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
        >
          <option value="">Select type…</option>
          {ASSET_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
        <FieldError name="asset_type" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Production year
          <span className="ml-1 text-xs text-gray-400">(optional)</span>
        </label>
        <input
          type="number"
          {...register('production_year', { valueAsNumber: true })}
          placeholder="e.g. 2023"
          min={1900}
          max={2030}
          className="w-40 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
        <FieldError name="production_year" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
          <span className="ml-1 text-xs text-gray-400">(optional)</span>
        </label>
        <textarea
          {...register('description')}
          rows={4}
          placeholder="Brief synopsis or description of the content"
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
        />
        <FieldError name="description" />
      </div>

      <p className="text-xs text-gray-400">
        Language and country of production can be added by Didactik admin after review.
      </p>
    </div>
  );
}
