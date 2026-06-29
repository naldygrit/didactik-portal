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

const wizardSchema = z.object({
  // Step 1 — Asset metadata
  title: z.string().min(5, 'Title must be at least 5 characters').max(500),
  original_title: z.string().max(500).optional(),
  asset_type: z.enum(
    ['feature_film', 'short_film', 'documentary', 'tv_episode', 'music_video', 'broadcast_recording', 'interview', 'other'],
    { error: 'Select an asset type' },
  ),
  // A licensing catalogue listing needs year, synopsis, language and country of
  // origin to be discoverable and saleable (Filmhub, Apple TV and the MovieLabs
  // MEC spec all require these), so they are not optional. Only the
  // original-language title is genuinely optional.
  production_year: z.preprocess(
    (v) => (v === '' || v === undefined || v === null || Number.isNaN(v) ? undefined : Number(v)),
    z.number({ error: 'Production year is required' }).int().min(1900).max(2030),
  ),
  description: z.string().min(20, 'Write a short synopsis (at least 20 characters)').max(5000),
  primary_language: z.preprocess(
    (v) => (v === '' || v === undefined || v === null || Number.isNaN(Number(v)) ? undefined : Number(v)),
    z.number({ error: 'Select the primary language' }).int().positive(),
  ),
  production_country: z.preprocess(
    (v) => (v === '' || v === undefined || v === null || Number.isNaN(Number(v)) ? undefined : Number(v)),
    z.number({ error: 'Select the country of production' }).int().positive(),
  ),
  // Step 2 — Submitter attestation
  submitter_name: z.string().min(1, 'Your name is required').max(300),
  submitter_contact: z.string().min(1, 'Contact info is required').max(300),
  // Step 2 — Licensing destination (drives the international-licensee consent clause)
  licensing_preference: z.enum(['nigerian', 'international', 'both']).default('both'),
  // Step 3 — Consent
  consented: z.boolean().refine((v) => v === true, {
    message: 'You must accept the consent terms to proceed',
  }),
});

export type WizardFormData = z.infer<typeof wizardSchema>;

// Fields validated before leaving each step. The submitter attestation folds
// into "Rights & consent" (it was a redundant standalone step); the sensitive
// legal confirmation sits last, before upload, per submission-flow research.
const STEP_FIELDS: Record<1 | 2, (keyof WizardFormData)[]> = {
  1: ['title', 'asset_type', 'production_year', 'description', 'primary_language', 'production_country'],
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
      title: '',
      original_title: '',
      asset_type: undefined,
      production_year: undefined,
      description: '',
      primary_language: undefined,
      production_country: undefined,
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
                      className="rounded-lg px-5 py-2 text-sm font-semibold text-white transition-transform active:scale-[0.98]"
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
