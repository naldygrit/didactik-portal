import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { useForm, FormProvider, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../shared/AuthContext';
import { Step1Metadata } from '../components/submission/Step1Metadata';
import { Step2Submitter } from '../components/submission/Step2Submitter';
import { LicensingPreference } from '../components/submission/LicensingPreference';
import { Step3Consent } from '../components/submission/Step3Consent';
import { Step4Upload } from '../components/submission/Step4Upload';
import { useState } from 'react';

// ---------------------------------------------------------------------------
// Zod schema — validated step-by-step using trigger()
// ---------------------------------------------------------------------------

// Coerce a select/number value to a number, or undefined when empty.
const toNum = (v: unknown) =>
  v === '' || v === undefined || v === null || Number.isNaN(Number(v)) ? undefined : Number(v);

const wizardSchema = z.object({
  // Step 1 — Title details (aligned with the canonical Title model: a title has
  // an original language plus other dialogue languages, a country of origin plus
  // co-production countries, a type, logline, synopsis, runtime and genres).
  name: z.string().min(2, 'Title must be at least 2 characters').max(300),
  original_title: z.string().max(300).optional(),
  title_type: z.enum(['film', 'series', 'documentary', 'short', 'animation'], {
    error: 'Select a type',
  }),
  production_year: z.preprocess(
    toNum,
    z.number({ error: 'Production year is required' }).int().min(1900).max(2030),
  ),
  runtime_minutes: z.preprocess(toNum, z.number().int().positive().optional()),
  logline: z.string().max(200).optional(),
  synopsis: z.string().min(20, 'Write a short synopsis (at least 20 characters)').max(5000),
  original_language: z.preprocess(
    toNum,
    z.number({ error: 'Select the original language' }).int().positive(),
  ),
  dialogue_languages: z.array(z.number()).default([]),
  country_of_origin: z.preprocess(
    toNum,
    z.number({ error: 'Select the country of origin' }).int().positive(),
  ),
  co_production_countries: z.array(z.number()).default([]),
  genres: z.array(z.number()).default([]),
  // Step 2 — Submitter attestation
  submitter_name: z.string().min(1, 'Your name is required').max(300),
  submitter_contact: z.string().min(1, 'Contact info is required').max(300),
  // Step 2 — Licensing destination (drives the international-licensee consent clause)
  licensing_preference: z
    .enum(['nigerian_broadcasters', 'international_streaming', 'both'])
    .default('both'),
  // Step 3 — Consent
  consented: z.boolean().refine((v) => v === true, {
    message: 'You must accept the consent terms to proceed',
  }),
});

export type WizardFormData = z.infer<typeof wizardSchema>;

// Required fields validated before leaving each step. Multi-value fields
// (dialogue languages, co-production countries, genres) and logline/runtime are
// optional, so they are not gated.
const STEP_FIELDS: Record<1 | 2, (keyof WizardFormData)[]> = {
  1: ['name', 'title_type', 'production_year', 'synopsis', 'original_language', 'country_of_origin'],
  2: ['submitter_name', 'submitter_contact', 'licensing_preference', 'consented'],
};

const STEPS = [
  {
    title: 'Title details',
    rail: 'Title details',
    desc: 'Name, type, year',
    help: 'Tell us what the title is. You can refine any of this after submitting.',
  },
  {
    title: 'Rights & consent',
    rail: 'Rights & consent',
    desc: 'Confirm you hold the rights',
    help: 'Confirm you can license this title and accept the terms. We review every submission before it goes live to broadcasters.',
  },
  {
    title: 'Upload files',
    rail: 'Upload',
    desc: 'Master and screener',
    help: 'Upload your master and a screener. Large files upload directly to storage and bypass our servers, so an unreliable connection is fine.',
  },
];

// ---------------------------------------------------------------------------
// SubmitPage
// ---------------------------------------------------------------------------

export function ProductionSubmitPage() {
  const { user } = useAuth();
  const reduce = useReducedMotion();
  const [step, setStep] = useState<1 | 2 | 3>(1);

  const methods = useForm<WizardFormData>({
    // zodResolver infers the schema INPUT type (unknown for preprocessed
    // numeric fields), while the form is typed on the OUTPUT type. The cast
    // reconciles the two; runtime validation is unaffected.
    resolver: zodResolver(wizardSchema) as Resolver<WizardFormData>,
    defaultValues: {
      name: '',
      original_title: '',
      title_type: undefined,
      production_year: undefined,
      runtime_minutes: undefined,
      logline: '',
      synopsis: '',
      original_language: undefined,
      dialogue_languages: [],
      country_of_origin: undefined,
      co_production_countries: [],
      genres: [],
      submitter_name: '',
      submitter_contact: user?.email ?? '',
      licensing_preference: 'both',
      consented: false,
    },
  });

  // Pre-fill submitter_contact from JWT email on mount
  useEffect(() => {
    if (user?.email) {
      methods.setValue('submitter_contact', user.email, { shouldValidate: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.email]);

  async function handleNext() {
    if (step === 3) return;
    const fields = STEP_FIELDS[step as 1 | 2];
    const valid = await methods.trigger(fields);
    if (valid) setStep((s) => (s + 1) as 1 | 2 | 3);
  }

  function handleBack() {
    if (step > 1) setStep((s) => (s - 1) as 1 | 2 | 3);
  }

  const current = STEPS[step - 1];
  // The Rights & consent step cannot be left until every field on it is filled
  // and the data-transfer consent box is ticked.
  const [submitterName, submitterContact, consented] = methods.watch([
    'submitter_name',
    'submitter_contact',
    'consented',
  ]);
  const nextBlocked =
    step === 2 && (!consented || !submitterName?.trim() || !submitterContact?.trim());

  return (
    <div className="mx-auto max-w-4xl">
      <Link
        to="/portal/production/assets"
        className="inline-flex items-center text-sm font-medium text-gray-500 transition-colors hover:text-gray-800"
      >
        ← Back to catalogue
      </Link>

      <div className="mt-4 grid gap-8 md:grid-cols-[230px_1fr]">
        {/* Step rail */}
        <aside>
          <h1 className="font-display text-2xl font-bold text-gray-900">Submit a title</h1>
          <p className="mt-1 text-sm text-gray-500">
            Add a new title to your catalogue. We review it before it goes live.
          </p>
          <ol className="mt-6 space-y-1">
            {STEPS.map((s, i) => {
              const n = i + 1;
              const active = n === step;
              const done = n < step;
              return (
                <li key={s.rail} className="flex items-start gap-3 py-2">
                  <span
                    className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors"
                    style={{
                      background: done ? BRAND : active ? '#ede9fe' : '#f3f4f6',
                      color: done ? '#fff' : active ? BRAND : '#9ca3af',
                      boxShadow: active ? `inset 0 0 0 1.5px ${BRAND}` : undefined,
                    }}
                  >
                    {done ? '✓' : n}
                  </span>
                  <div className="min-w-0">
                    <div
                      className="text-sm font-medium"
                      style={{ color: active ? '#111827' : done ? '#374151' : '#9ca3af' }}
                    >
                      {s.rail}
                    </div>
                    <div className="text-xs text-gray-500">{s.desc}</div>
                  </div>
                </li>
              );
            })}
          </ol>
        </aside>

        {/* Content */}
        <div>
          <FormProvider {...methods}>
            <motion.div
              key={step}
              initial={reduce ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] as const }}
            >
              <h2 className="text-lg font-semibold text-gray-900">{current.title}</h2>
              <p className="mb-5 mt-0.5 text-sm text-gray-500">{current.help}</p>

              <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                {step === 1 && <Step1Metadata />}
                {step === 2 && (
                  <div className="space-y-6">
                    <Step2Submitter />
                    <div className="border-t border-gray-100" />
                    <LicensingPreference />
                    <div className="border-t border-gray-100" />
                    <Step3Consent />
                  </div>
                )}
                {step === 3 && <Step4Upload formData={methods.getValues()} onBack={handleBack} />}

                {step < 3 && (
                  <div className="mt-8 flex items-center justify-between border-t border-gray-100 pt-4">
                    <button
                      type="button"
                      onClick={handleBack}
                      disabled={step === 1}
                      className="text-sm font-medium text-gray-500 transition-colors hover:text-gray-800 disabled:opacity-0"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={handleNext}
                      disabled={nextBlocked}
                      className="rounded-lg px-5 py-2 text-sm font-semibold text-white transition-transform active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                      style={{ backgroundColor: BRAND }}
                    >
                      {step === 2 ? 'Continue to upload' : 'Save and continue'}
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </FormProvider>
        </div>
      </div>
    </div>
  );
}

const BRAND = '#5343fd';
