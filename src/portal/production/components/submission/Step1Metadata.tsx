import { useId } from 'react';
import { useFormContext } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '../../../shared/apiHelpers';
import type { Language, Country } from '../../../shared/types';
import type { WizardFormData } from '../../pages/SubmitPage';
import { DkField } from '../../../../components/dk/DkField';

const TITLE_TYPES = [
  { value: 'film', label: 'Film' },
  { value: 'series', label: 'Series' },
  { value: 'documentary', label: 'Documentary' },
  { value: 'short', label: 'Short' },
  { value: 'animation', label: 'Animation' },
] as const;

const inputClass =
  'w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400';

// Toggleable pill used for the "other languages / other countries" multi-selects.
// aria-pressed exposes the selected/unselected state; the surrounding
// role="group" (below) exposes that these pills are a related set.
function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
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
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<WizardFormData>();

  // Captions for the three chip toggle-groups, referenced via
  // aria-labelledby on each group so a screen reader announces what the set
  // of pills means, not just an unlabeled run of buttons.
  const languagesGroupId = useId();
  const countriesGroupId = useId();
  const genresGroupId = useId();

  const { data: languages } = useQuery<Language[]>({
    queryKey: ['languages'],
    queryFn: () => apiGet<Language[]>('/api/v1/languages/'),
  });
  const { data: countries } = useQuery<Country[]>({
    queryKey: ['countries'],
    queryFn: () => apiGet<Country[]>('/api/v1/countries/'),
  });
  const { data: genres } = useQuery<{ id: number; name: string }[]>({
    queryKey: ['genres'],
    queryFn: () => apiGet<{ id: number; name: string }[]>('/api/v1/genres/'),
  });

  const dialogue = watch('dialogue_languages') ?? [];
  const coCountries = watch('co_production_countries') ?? [];
  const genreIds = watch('genres') ?? [];
  const originalLanguage = watch('original_language');
  const countryOfOrigin = watch('country_of_origin');

  function toggle(
    field: 'dialogue_languages' | 'co_production_countries' | 'genres',
    id: number,
  ) {
    const current = (watch(field) ?? []) as number[];
    setValue(
      field,
      current.includes(id) ? current.filter((x) => x !== id) : [...current, id],
      { shouldValidate: false },
    );
  }

  return (
    <div className="space-y-5">
      <DkField label="Title" required error={errors.name?.message as string | undefined}>
        <input
          type="text"
          {...register('name')}
          placeholder="Working or anglicised title"
          className={inputClass}
        />
      </DkField>

      <DkField
        label={
          <>
            Original title
            <span className="ml-1 text-xs text-gray-400">(optional, in the original language)</span>
          </>
        }
      >
        <input type="text" {...register('original_title')} className={inputClass} />
      </DkField>

      <div className="grid grid-cols-2 gap-4">
        <DkField label="Type" required error={errors.title_type?.message as string | undefined}>
          <select {...register('title_type')} className={inputClass}>
            <option value="">Select type…</option>
            {TITLE_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </DkField>
        <DkField
          label="Production year"
          required
          error={errors.production_year?.message as string | undefined}
        >
          <input
            type="number"
            {...register('production_year', { valueAsNumber: true })}
            placeholder="e.g. 2023"
            min={1900}
            max={2030}
            className={inputClass}
          />
        </DkField>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <DkField
          label={
            <>
              Runtime (minutes)
              <span className="ml-1 text-xs text-gray-400">(optional)</span>
            </>
          }
        >
          <input
            type="number"
            {...register('runtime_minutes', { valueAsNumber: true })}
            placeholder="e.g. 105"
            min={1}
            className={inputClass}
          />
        </DkField>
        <DkField
          label={
            <>
              Logline
              <span className="ml-1 text-xs text-gray-400">(optional, one line)</span>
            </>
          }
        >
          <input
            type="text"
            {...register('logline')}
            placeholder="One sentence hook"
            className={inputClass}
          />
        </DkField>
      </div>

      <DkField label="Synopsis" required error={errors.synopsis?.message as string | undefined}>
        <textarea
          {...register('synopsis')}
          rows={4}
          placeholder="A short synopsis buyers read when deciding to license"
          className={`${inputClass} resize-none`}
        />
      </DkField>

      {/* Languages: original + others */}
      <div>
        <DkField
          label="Original language"
          required
          error={errors.original_language?.message as string | undefined}
        >
          <select {...register('original_language', { valueAsNumber: true })} className={inputClass}>
            <option value="">— select language —</option>
            {languages?.map((l) => (
              <option key={l.id} value={l.id}>
                {l.english_name}
              </option>
            ))}
          </select>
        </DkField>
        <p id={languagesGroupId} className="mt-2 mb-1 text-xs font-medium text-gray-600">
          Other languages spoken <span className="text-gray-400">(optional)</span>
        </p>
        <div role="group" aria-labelledby={languagesGroupId} className="flex flex-wrap gap-2">
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
        <DkField
          label="Country of origin"
          required
          error={errors.country_of_origin?.message as string | undefined}
        >
          <select {...register('country_of_origin', { valueAsNumber: true })} className={inputClass}>
            <option value="">— select country —</option>
            {countries?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </DkField>
        <p id={countriesGroupId} className="mt-2 mb-1 text-xs font-medium text-gray-600">
          Co-production countries <span className="text-gray-400">(optional)</span>
        </p>
        <div role="group" aria-labelledby={countriesGroupId} className="flex flex-wrap gap-2">
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

      <div>
        <p id={genresGroupId} className="mb-1 block text-sm font-medium text-gray-700">
          Genres <span className="text-gray-400 text-xs">(optional)</span>
        </p>
        <div role="group" aria-labelledby={genresGroupId} className="flex flex-wrap gap-2">
          {(genres ?? []).map((g) => (
            <Chip
              key={g.id}
              label={g.name}
              active={genreIds.includes(g.id)}
              onClick={() => toggle('genres', g.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
