import { useId, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { postApplication, type OnboardingApplicationInput, type OrgType } from './onboarding';
import { DkFormMessage } from '../../components/dk/DkFormMessage';
import { activePortal, loginPath } from '../shared/portalHost';

const BRAND = '#5343fd';

type Step = 'choose' | 'details' | 'done';

const ORG_OPTIONS: { type: OrgType; title: string; blurb: string }[] = [
  {
    type: 'broadcaster',
    title: 'Broadcaster',
    blurb: 'Discover and license African titles for your territories.',
  },
  {
    type: 'production_company',
    title: 'Production company',
    blurb: 'List your catalogue and reach broadcasters worldwide.',
  },
];

export function ApplyPage() {
  const orgTypeHeadingId = useId();
  // On an audience subdomain the org type is implied by the host — pre-select it
  // and skip the "who are you?" chooser (broadcaster. → broadcaster, producer. →
  // production company). The unified host still shows the chooser.
  const preset: OrgType | null =
    activePortal() === 'broadcaster'
      ? 'broadcaster'
      : activePortal() === 'production'
        ? 'production_company'
        : null;
  const [step, setStep] = useState<Step>(preset ? 'details' : 'choose');
  const [orgType, setOrgType] = useState<OrgType | null>(preset);
  const [form, setForm] = useState({
    org_name: '',
    country: '',
    contact_name: '',
    contact_email: '',
    message: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function choose(type: OrgType) {
    setOrgType(type);
    setStep('details');
  }

  function update(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!orgType) return;
    setError(null);
    setSubmitting(true);
    const payload: OnboardingApplicationInput = {
      org_type: orgType,
      org_name: form.org_name.trim(),
      country: form.country.trim(),
      contact_name: form.contact_name.trim(),
      contact_email: form.contact_email.trim(),
      message: form.message.trim() || undefined,
    };
    try {
      await postApplication(payload);
      setStep('done');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  }

  const orgLabel = orgType === 'broadcaster' ? 'broadcaster' : 'production company';
  // Emem's split: broadcasters are vetted (apply → manual review after checks);
  // production companies self-serve (instant account) to keep supply-side
  // friction low. Backend follow-up: producer signup should create an ACTIVE
  // account, broadcaster signup a PENDING application for the admin queue.
  const isInstant = orgType === 'production_company';

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="mb-6 text-center">
          <span className="text-2xl font-bold tracking-tight" style={{ color: BRAND }}>
            Didactik
          </span>
          <p className="mt-1 text-sm text-gray-500">
            {step === 'done'
              ? isInstant
                ? 'Account created'
                : 'Application received'
              : isInstant
                ? 'Create your account'
                : 'Apply for access'}
          </p>
        </div>

        <div className="rounded-2xl bg-white p-8 shadow-md">
          {step === 'choose' && (
            <>
              <h1 id={orgTypeHeadingId} className="text-lg font-semibold text-gray-900">
                Who are you applying as?
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Didactik is the licensing marketplace for African audiovisual content.
              </p>
              {/* role="group", not radiogroup/radio — clicking a card
                  navigates immediately to the details step rather than
                  persisting a selection, so radio semantics (which imply
                  arrow-key nav between a lasting set of selected/unselected
                  options) would be a mismatched fit for this one-shot
                  choice, same lesson as the vanishing-trigger buttons
                  elsewhere in this pass. */}
              <div
                role="group"
                aria-labelledby={orgTypeHeadingId}
                className="mt-6 grid gap-3"
              >
                {ORG_OPTIONS.map((opt) => (
                  <button
                    key={opt.type}
                    type="button"
                    onClick={() => choose(opt.type)}
                    className="rounded-xl border border-gray-200 p-4 text-left shadow-sm transition-[transform,box-shadow,border-color] duration-150 ease-out hover:-translate-y-px hover:shadow-md motion-reduce:transform-none"
                  >
                    <div className="text-sm font-semibold text-gray-900">{opt.title}</div>
                    <div className="mt-0.5 text-sm text-gray-500">{opt.blurb}</div>
                  </button>
                ))}
              </div>
              <p className="mt-6 text-center text-sm text-gray-500">
                Already have an account?{' '}
                <Link to={loginPath()} className="font-medium" style={{ color: BRAND }}>
                  Sign in
                </Link>
              </p>
            </>
          )}

          {step === 'details' && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <h1 className="text-lg font-semibold text-gray-900">
                  Tell us about your {orgLabel}
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                  {isInstant
                    ? 'Set up your account — you can start listing straight away.'
                    : 'We review every broadcaster application and email you once your account is verified.'}
                </p>
              </div>

              {error && (
                <DkFormMessage tone="error" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </DkFormMessage>
              )}

              <Field
                id="org_name"
                label={orgType === 'broadcaster' ? 'Broadcaster name' : 'Company name'}
                value={form.org_name}
                onChange={(v) => update('org_name', v)}
                required
              />
              <Field
                id="country"
                label="Country"
                value={form.country}
                onChange={(v) => update('country', v)}
                required
              />
              <Field
                id="contact_name"
                label="Your name"
                value={form.contact_name}
                onChange={(v) => update('contact_name', v)}
                autoComplete="name"
                required
              />
              <Field
                id="contact_email"
                label="Work email"
                type="email"
                value={form.contact_email}
                onChange={(v) => update('contact_email', v)}
                autoComplete="email"
                required
              />
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                  Anything we should know? (optional)
                </label>
                <textarea
                  id="message"
                  rows={3}
                  value={form.message}
                  onChange={(e) => update('message', e.target.value)}
                  className="mt-1 block w-full resize-y rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                {/* No chooser to go back to on a dedicated audience subdomain
                    (the org type is fixed by the host). */}
                {!preset && (
                  <button
                    type="button"
                    onClick={() => setStep('choose')}
                    className="text-sm font-medium text-gray-500 hover:text-gray-800"
                  >
                    Back
                  </button>
                )}
                <button
                  type="submit"
                  disabled={submitting}
                  className="ml-auto rounded-lg px-5 py-2 text-sm font-semibold text-white transition-opacity disabled:opacity-60"
                  style={{ backgroundColor: BRAND }}
                >
                  {submitting
                    ? isInstant
                      ? 'Creating…'
                      : 'Submitting…'
                    : isInstant
                      ? 'Create account'
                      : 'Submit application'}
                </button>
              </div>
            </form>
          )}

          {step === 'done' && (
            <div className="text-center">
              <div
                className="mx-auto flex h-12 w-12 items-center justify-center rounded-full text-xl font-bold"
                style={{ background: '#ede9fe', color: BRAND }}
                aria-hidden
              >
                ✓
              </div>
              <h1 className="mt-4 text-lg font-semibold text-gray-900">
                {isInstant ? "You're all set" : 'Application received'}
              </h1>
              <p className="mt-2 text-sm text-gray-500">
                {isInstant ? (
                  <>
                    Welcome, {form.contact_name || 'there'}. Your account is ready — sign in to
                    start listing your catalogue.
                  </>
                ) : (
                  <>
                    Thanks, {form.contact_name || 'there'}. Our team reviews each broadcaster and we
                    will email{' '}
                    <span className="font-medium text-gray-700">{form.contact_email}</span> once your
                    account is verified.
                  </>
                )}
              </p>
              <Link
                to={loginPath()}
                className="mt-6 inline-block rounded-lg px-5 py-2 text-sm font-semibold text-white"
                style={{ backgroundColor: BRAND }}
              >
                Back to sign in
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  type = 'text',
  required,
  autoComplete,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  autoComplete?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <input
        id={id}
        type={type}
        required={required}
        autoComplete={autoComplete}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
    </div>
  );
}
