import { useFormContext } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '../../../shared/apiHelpers';
import type { Language, Country } from '../../../shared/types';
import type { WizardFormData } from '../../pages/SubmitPage';

const TITLE_TYPES = [
  { value: 'film', label: 'Film' },
  { value: 'series', label: 'Series' },
  { value: 'documentary', label: 'Documentary' },
  { value: 'short', label: 'Short' },
  { value: 'animation', label: 'Animation' },
] as const;

const inputClass =
  'w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400';

function FieldError({ name }: { name: keyof WizardFormData }) {
  const { formState: { errors } } = useFormContext<WizardFormData>();
  const error = errors[name];
  if (!error) return null;
  return <p className="mt-1 text-xs text-red-600">{error.message as string}</p>;
}

// Toggleable pill used for the "other languages / other countries" multi-selects.
function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full border px-3 py-1 text-xs font-medium transition-colors"
      style={
        active
          ? { borderColor: '#5343fd', background: 'rgba(83,67,253,0.08)', color: '#4334d8' }
          : { borderColor: '#e5e7eb', color: '#4b5563' }
      }
    >
      {label}
    </button>
  );
}

export function Step1Metadata() {
  const { register, watch, setValue } = useFormContext<WizardFormData>();

  const { data: languages } = useQuery<Language[]>({
    queryKey: ['languages'],
    queryFn: () => apiGet<Language[]>('/api/v1/languages/'),
  });
  const { data: countries } = useQuery<Country[]>({
    queryKey: ['countries'],
    queryFn: () => apiGet<Country[]>('/api/v1/countries/'),
  });

  const dialogue = watch('dialogue_languages') ?? [];
  const coCountries = watch('co_production_countries') ?? [];
  const originalLanguage = watch('original_language');
  const countryOfOrigin = watch('country_of_origin');

  function toggle(field: 'dialogue_languages' | 'co_production_countries', id: number) {
    const current = (watch(field) ?? []) as number[];
    setValue(
      field,
      current.includes(id) ? current.filter((x) => x !== id) : [...current, id],
      { shouldValidate: false },
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          {...register('name')}
          placeholder="Working or anglicised title"
          className={inputClass}
        />
        <FieldError name="name" />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Original title
          <span className="ml-1 text-xs text-gray-400">(optional, in the original language)</span>
        </label>
        <input type="text" {...register('original_title')} className={inputClass} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Type <span className="text-red-500">*</span>
          </label>
          <select {...register('title_type')} className={inputClass}>
            <option value="">Select type…</option>
            {TITLE_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
          <FieldError name="title_type" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Production year <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            {...register('production_year', { valueAsNumber: true })}
            placeholder="e.g. 2023"
            min={1900}
            max={2030}
            className={inputClass}
          />
          <FieldError name="production_year" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Runtime (minutes)
            <span className="ml-1 text-xs text-gray-400">(optional)</span>
          </label>
          <input
            type="number"
            {...register('runtime_minutes', { valueAsNumber: true })}
            placeholder="e.g. 105"
            min={1}
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Logline
            <span className="ml-1 text-xs text-gray-400">(optional, one line)</span>
          </label>
          <input
            type="text"
            {...register('logline')}
            placeholder="One sentence hook"
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Synopsis <span className="text-red-500">*</span>
        </label>
        <textarea
          {...register('synopsis')}
          rows={4}
          placeholder="A short synopsis buyers read when deciding to license"
          className={`${inputClass} resize-none`}
        />
        <FieldError name="synopsis" />
      </div>

      {/* Languages: original + others */}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Original language <span className="text-red-500">*</span>
        </label>
        <select {...register('original_language', { valueAsNumber: true })} className={inputClass}>
          <option value="">— select language —</option>
          {languages?.map((l) => (
            <option key={l.id} value={l.id}>
              {l.english_name}
            </option>
          ))}
        </select>
        <FieldError name="original_language" />
        <p className="mt-2 mb-1 text-xs font-medium text-gray-600">
          Other languages spoken <span className="text-gray-400">(optional)</span>
        </p>
        <div className="flex flex-wrap gap-2">
          {(languages ?? [])
            .filter((l) => l.id !== originalLanguage)
            .map((l) => (
              <Chip
                key={l.id}
                label={l.english_name}
                active={dialogue.includes(l.id)}
                onClick={() => toggle('dialogue_languages', l.id)}
              />
            ))}
        </div>
      </div>

      {/* Countries: origin + co-production */}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Country of origin <span className="text-red-500">*</span>
        </label>
        <select {...register('country_of_origin', { valueAsNumber: true })} className={inputClass}>
          <option value="">— select country —</option>
          {countries?.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <FieldError name="country_of_origin" />
        <p className="mt-2 mb-1 text-xs font-medium text-gray-600">
          Co-production countries <span className="text-gray-400">(optional)</span>
        </p>
        <div className="flex flex-wrap gap-2">
          {(countries ?? [])
            .filter((c) => c.id !== countryOfOrigin)
            .map((c) => (
              <Chip
                key={c.id}
                label={c.name}
                active={coCountries.includes(c.id)}
                onClick={() => toggle('co_production_countries', c.id)}
              />
            ))}
        </div>
      </div>
    </div>
  );
}
