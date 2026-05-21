import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../shared/AuthContext';
import { Step1Metadata } from '../components/submission/Step1Metadata';
import { Step2Submitter } from '../components/submission/Step2Submitter';
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
  production_year: z
    .preprocess(
      (v) => (v === '' || v === undefined || v === null || Number.isNaN(v) ? undefined : Number(v)),
      z.number().int().min(1900).max(2030).optional(),
    ),
  description: z.string().max(5000).optional(),
  // Step 2 — Submitter attestation
  submitter_name: z.string().min(1, 'Your name is required').max(300),
  submitter_contact: z.string().min(1, 'Contact info is required').max(300),
  // Step 3 — Consent
  consented: z.boolean().refine((v) => v === true, {
    message: 'You must accept the consent terms to proceed',
  }),
});

export type WizardFormData = z.infer<typeof wizardSchema>;

// Fields validated on each step's Next press
const STEP_FIELDS: Record<1 | 2 | 3, (keyof WizardFormData)[]> = {
  1: ['title', 'asset_type'],
  2: ['submitter_name', 'submitter_contact'],
  3: ['consented'],
};

const STEP_LABELS = ['Asset Details', 'Submitter', 'Consent', 'Upload'];

// ---------------------------------------------------------------------------
// SubmitPage
// ---------------------------------------------------------------------------

export function ProductionSubmitPage() {
  const { user } = useAuth();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  const methods = useForm<WizardFormData>({
    resolver: zodResolver(wizardSchema),
    defaultValues: {
      title: '',
      original_title: '',
      asset_type: undefined,
      production_year: undefined,
      description: '',
      submitter_name: '',
      submitter_contact: user?.email ?? '',
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
    if (step === 4) return;
    const fields = STEP_FIELDS[step as 1 | 2 | 3];
    const valid = await methods.trigger(fields);
    if (valid) setStep((s) => (s + 1) as 1 | 2 | 3 | 4);
  }

  function handleBack() {
    if (step > 1) setStep((s) => (s - 1) as 1 | 2 | 3 | 4);
  }

  return (
    <div className="max-w-xl mx-auto">
      {/* Back to assets */}
      <Link
        to="/portal/production/assets"
        className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-6"
      >
        ← Back to assets
      </Link>

      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Submit new asset</h1>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8">
        {STEP_LABELS.map((label, i) => {
          const n = (i + 1) as 1 | 2 | 3 | 4;
          const active = n === step;
          const done = n < step;
          return (
            <div key={n} className="flex items-center gap-2">
              <div
                className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold
                  ${done ? 'bg-indigo-600 text-white' : active ? 'ring-2 ring-indigo-600 text-indigo-600' : 'bg-gray-100 text-gray-400'}`}
              >
                {done ? '✓' : n}
              </div>
              <span
                className={`text-xs font-medium ${active ? 'text-indigo-700' : done ? 'text-indigo-500' : 'text-gray-400'}`}
              >
                {label}
              </span>
              {i < STEP_LABELS.length - 1 && (
                <div className={`flex-1 h-px w-6 ${done ? 'bg-indigo-300' : 'bg-gray-200'}`} />
              )}
            </div>
          );
        })}
      </div>

      {/* Form */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <FormProvider {...methods}>
          {step === 1 && <Step1Metadata />}
          {step === 2 && <Step2Submitter />}
          {step === 3 && <Step3Consent />}
          {step === 4 && (
            <Step4Upload
              formData={methods.getValues()}
              onBack={handleBack}
            />
          )}

          {/* Navigation — not shown on Step 4 (it has its own buttons) */}
          {step < 4 && (
            <div className="flex justify-between mt-8 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={handleBack}
                disabled={step === 1}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-0"
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="px-5 py-2 rounded-md text-sm font-medium text-white"
                style={{ backgroundColor: '#5343fd' }}
              >
                {step === 3 ? 'Continue to upload →' : 'Next →'}
              </button>
            </div>
          )}
        </FormProvider>
      </div>
    </div>
  );
}
