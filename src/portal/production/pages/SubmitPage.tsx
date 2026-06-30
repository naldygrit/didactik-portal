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
import { FileUploadField, type UploadState } from '../components/submission/FileUploadField';
import { apiPost } from '../../shared/apiHelpers';
import type { TitleUploadInitiatedResponse } from '../../shared/types';
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
  // Step 3 — Consent (Q1, data transfer)
  consented: z.boolean().refine((v) => v === true, {
    message: 'You must accept the consent terms to proceed',
  }),
  // Step 3 — Rights warranty (Q2, content provenance). Required by the backend
  // initiate-upload endpoint; a submission cannot proceed without it.
  rights_attested: z.boolean().refine((v) => v === true, {
    message: 'You must affirm the rights warranty to proceed',
  }),
});

export type WizardFormData = z.infer<typeof wizardSchema>;

// Required fields validated before leaving each step. Multi-value fields
// (dialogue languages, co-production countries, genres) and logline/runtime are
// optional, so they are not gated.
const STEP_FIELDS: Record<1 | 2, (keyof WizardFormData)[]> = {
  1: ['name', 'title_type', 'production_year', 'synopsis', 'original_language', 'country_of_origin'],
  2: ['submitter_name', 'submitter_contact', 'licensing_preference', 'consented', 'rights_attested'],
};

const STEPS = [
  {
    title: 'Title details',
    rail: 'Title details',
    desc: 'File, name, languages',
    help: 'Choose your master file (it uploads in the background) and tell us what the title is. You can refine any of this after submitting.',
  },
  {
    title: 'Rights & consent',
    rail: 'Rights & consent',
    desc: 'Confirm you hold the rights',
    help: 'Confirm you can license this title and accept the terms. We review every submission before it goes live to broadcasters.',
  },
  {
    title: 'Review & submit',
    rail: 'Review',
    desc: 'Confirm and submit',
    help: 'Your file uploads while you work. Once it finishes, submit for review.',
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
      rights_attested: false,
    },
  });

  // Pre-fill submitter_contact from JWT email on mount
  useEffect(() => {
    if (user?.email) {
      methods.setValue('submitter_contact', user.email, { shouldValidate: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.email]);

  // Upload-first: the master streams to storage in the background as soon as it
  // is chosen, so it is usually finished by the time the form is.
  const [upload, setUpload] = useState<UploadState>({ status: 'idle' });
  const [submitState, setSubmitState] = useState<
    | { kind: 'idle' }
    | { kind: 'submitting' }
    | { kind: 'success'; message: string }
    | { kind: 'error'; message: string }
  >({ kind: 'idle' });

  async function startUpload(file: File) {
    setUpload({ status: 'uploading', percent: 0, file });
    try {
      const { data, status } = await apiPost<{ upload_url: string | null; file_key: string }>(
        '/api/v1/production/titles/upload-url/',
        { filename: file.name, content_type: file.type || 'application/octet-stream' },
      );
      if (status !== 200) throw new Error('Could not start the upload.');
      if (!data.upload_url) {
        // Mock mode (or a backend without B2): treat as already uploaded.
        setUpload({ status: 'done', fileKey: data.file_key, file });
        return;
      }
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('PUT', data.upload_url as string);
        xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream');
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            setUpload({ status: 'uploading', percent: Math.round((e.loaded / e.total) * 100), file });
          }
        });
        xhr.addEventListener('load', () =>
          xhr.status >= 200 && xhr.status < 300
            ? resolve()
            : reject(new Error(`Upload failed (${xhr.status}).`)),
        );
        xhr.addEventListener('error', () => reject(new Error('Network error during upload.')));
        xhr.send(file);
      });
      setUpload({ status: 'done', fileKey: data.file_key, file });
    } catch (e) {
      setUpload({ status: 'error', message: e instanceof Error ? e.message : 'Upload failed.', file });
    }
  }

  async function handleFinalSubmit() {
    if (upload.status !== 'done') return;
    if (!(await methods.trigger())) return;
    setSubmitState({ kind: 'submitting' });
    const d = methods.getValues();
    const payload = {
      name: d.name,
      original_title: d.original_title ?? '',
      title_type: d.title_type,
      production_year: d.production_year,
      runtime_minutes: Number.isNaN(d.runtime_minutes) ? undefined : d.runtime_minutes ?? undefined,
      logline: d.logline ?? '',
      synopsis: d.synopsis,
      original_language: d.original_language,
      dialogue_languages: d.dialogue_languages ?? [],
      country_of_origin: d.country_of_origin,
      co_production_countries: d.co_production_countries ?? [],
      genres: d.genres ?? [],
      licensing_intent: d.licensing_preference,
      submitter_name: d.submitter_name,
      submitter_contact: d.submitter_contact,
      consented: true,
      rights_attested: true,
      filename: upload.file.name,
      content_type: upload.file.type || 'application/octet-stream',
      file_key: upload.fileKey,
    };
    try {
      const { data, status } = await apiPost<TitleUploadInitiatedResponse>(
        '/api/v1/production/titles/initiate-upload/',
        payload,
      );
      if (status >= 200 && status < 300) {
        setSubmitState({ kind: 'success', message: data.message });
      } else {
        setSubmitState({ kind: 'error', message: 'Submission failed. Please try again.' });
      }
    } catch {
      setSubmitState({ kind: 'error', message: 'Submission failed. Please try again.' });
    }
  }

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
  const [submitterName, submitterContact, consented, rightsAttested] = methods.watch([
    'submitter_name',
    'submitter_contact',
    'consented',
    'rights_attested',
  ]);
  const nextBlocked =
    step === 2 &&
    (!consented || !rightsAttested || !submitterName?.trim() || !submitterContact?.trim());

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
                {step === 1 && (
                  <div className="space-y-6">
                    <FileUploadField upload={upload} onPick={startUpload} />
                    <div className="border-t border-gray-100" />
                    <Step1Metadata />
                  </div>
                )}
                {step === 2 && (
                  <div className="space-y-6">
                    <Step2Submitter />
                    <div className="border-t border-gray-100" />
                    <LicensingPreference />
                    <div className="border-t border-gray-100" />
                    <Step3Consent />
                  </div>
                )}
                {step === 3 &&
                  (submitState.kind === 'success' ? (
                    <div className="space-y-3 py-6 text-center">
                      <div className="text-4xl">✓</div>
                      <h3 className="text-lg font-semibold text-gray-900">Submission received</h3>
                      <p className="mx-auto max-w-sm text-sm text-gray-600">{submitState.message}</p>
                      <a
                        href="/portal/production/assets"
                        className="mt-2 inline-block rounded-md px-5 py-2 text-sm font-medium text-white"
                        style={{ backgroundColor: BRAND }}
                      >
                        View your catalogue
                      </a>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {upload.status === 'done' && (
                        <p className="text-sm text-emerald-600">
                          Your master finished uploading. Submit when you are ready.
                        </p>
                      )}
                      {upload.status === 'uploading' && (
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>Finishing the upload…</span>
                            <span>{upload.percent}%</span>
                          </div>
                          <div className="h-2 w-full rounded-full bg-gray-200">
                            <div
                              className="h-2 rounded-full transition-all duration-150"
                              style={{ width: `${upload.percent}%`, backgroundColor: BRAND }}
                            />
                          </div>
                          <p className="text-xs text-gray-500">You can submit once it completes.</p>
                        </div>
                      )}
                      {(upload.status === 'idle' || upload.status === 'error') && (
                        <p className="text-sm text-amber-600">
                          Go back to step 1 and choose your master file before submitting.
                        </p>
                      )}
                      {submitState.kind === 'error' && (
                        <p className="text-sm text-red-600">{submitState.message}</p>
                      )}
                      <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                        <button
                          type="button"
                          onClick={handleBack}
                          className="text-sm font-medium text-gray-500 transition-colors hover:text-gray-800"
                        >
                          Back
                        </button>
                        <button
                          type="button"
                          onClick={handleFinalSubmit}
                          disabled={upload.status !== 'done' || submitState.kind === 'submitting'}
                          className="rounded-lg px-5 py-2 text-sm font-semibold text-white transition-transform active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                          style={{ backgroundColor: BRAND }}
                        >
                          {submitState.kind === 'submitting' ? 'Submitting…' : 'Submit for review'}
                        </button>
                      </div>
                    </div>
                  ))}

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
                      {step === 2 ? 'Continue to review' : 'Save and continue'}
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
