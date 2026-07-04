import { useFormContext } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '../../../shared/apiHelpers';
import { jurisdictionalBasisForCountry } from '../../lib/jurisdiction';
import { CONSENT_TEXTS, INTERNATIONAL_LICENSEE_ADDENDUM } from '../../consentTexts';
import { RIGHTS_WARRANTY_DIMENSIONS, RIGHTS_WARRANTY_FOOTER } from '../../attestationTexts';
import { PrivacyPolicyDrawer } from './PrivacyPolicyDrawer';
import type { MeResponse, ProductionCompanyDetail } from '../../../shared/types';
import type { WizardFormData } from '../../pages/SubmitPage';
import { useDkDisclosure } from '../../../../components/dk/useDkDisclosure';
import { DkFieldError } from '../../../../components/dk/DkFieldError';

export function Step3Consent() {
  const consentTerms = useDkDisclosure();
  const privacyPolicy = useDkDisclosure();
  const { register, watch, formState: { errors } } = useFormContext<WizardFormData>();

  // Fetch /auth/me/ to get the production company ID
  const { data: me } = useQuery<MeResponse>({
    queryKey: ['me'],
    queryFn: () => apiGet<MeResponse>('/api/v1/auth/me/'),
  });

  const pcId = me?.profile?.production_company?.id;

  // Fetch the production company record to get country code
  const { data: pc, isLoading: pcLoading } = useQuery<ProductionCompanyDetail>({
    queryKey: ['production-company', pcId],
    queryFn: () => apiGet<ProductionCompanyDetail>(`/api/v1/production-companies/${pcId}/`),
    enabled: pcId != null,
  });

  const basis = jurisdictionalBasisForCountry(pc?.country?.code);
  const consent = CONSENT_TEXTS[basis];

  // When the filmmaker chose international licensing, the consent they read (and
  // the backend snapshots) gains the international-licensee clause.
  const licensing = watch('licensing_preference');
  const showInternational = licensing === 'international_streaming' || licensing === 'both';
  const consentText = showInternational
    ? `${consent.text}\n\n${INTERNATIONAL_LICENSEE_ADDENDUM}`
    : consent.text;

  if (pcLoading || !pc) {
    return <p className="text-sm text-gray-500">Loading consent terms…</p>;
  }

  return (
    <div className="space-y-4">
      {/* Rights warranty (Q2 — content provenance). Distinct from the data-transfer
          consent below (Q1). Required by the backend; submission cannot proceed
          without it. */}
      <p className="text-sm font-medium text-gray-700">Rights warranty</p>
      <p className="text-sm text-gray-500">
        Before this title can be offered to broadcasters, you must confirm you hold
        the rights to license it — including each of the following.
      </p>
      <ul className="space-y-2">
        {RIGHTS_WARRANTY_DIMENSIONS.map((d) => (
          <li key={d.title} className="flex gap-2 text-sm">
            <span className="mt-0.5 text-indigo-600">•</span>
            <span>
              <span className="font-medium text-gray-800">{d.title}.</span>{' '}
              <span className="text-gray-600">{d.body}</span>
            </span>
          </li>
        ))}
      </ul>
      <p className="text-xs text-gray-500">{RIGHTS_WARRANTY_FOOTER}</p>

      <div className="flex items-start gap-3 pt-1">
        <input
          id="rights_attested"
          type="checkbox"
          {...register('rights_attested')}
          className="mt-0.5 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
        />
        <label htmlFor="rights_attested" className="text-sm text-gray-700 cursor-pointer">
          I warrant that I hold all rights necessary to license this title, including
          the title, music, personality/property, and co-production rights described above.
        </label>
      </div>
      {errors.rights_attested && (
        <DkFieldError className="text-xs text-red-600">
          {errors.rights_attested.message as string}
        </DkFieldError>
      )}

      <div className="border-t border-gray-100" />

      <p className="text-sm text-gray-700 font-medium">Data transfer consent</p>
      <p className="text-sm text-gray-500">
        Before your content can be stored, you must consent to the transfer of your
        personal data to Backblaze, Inc. in the United States. The specific terms
        depend on the data protection laws applicable to your jurisdiction.
      </p>

      {showInternational && (
        <p className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-900">
          You chose international licensing, so your contact details may also be shared with
          licensees outside Nigeria when we negotiate deals. The full terms are below.
        </p>
      )}

      {/* Collapsible consent text — per consent_texts.py UX contract */}
      <div className="border border-gray-200 rounded-md">
        <button
          type="button"
          onClick={consentTerms.toggle}
          {...consentTerms.triggerProps}
          className="w-full flex items-center justify-between px-4 py-3 text-sm text-indigo-600 hover:text-indigo-800 font-medium text-left"
        >
          <span>{consentTerms.open ? 'Hide consent terms' : 'View full consent terms'}</span>
          <span aria-hidden="true" className="text-gray-400">
            {consentTerms.open ? '▲' : '▼'}
          </span>
        </button>
        {consentTerms.open && (
          <div {...consentTerms.panelProps} className="px-4 pb-4 border-t border-gray-100">
            <pre className="text-xs text-gray-700 whitespace-pre-wrap font-sans leading-relaxed mt-3">
              {consentText}
            </pre>
          </div>
        )}
      </div>

      {/* Acknowledgment checkbox */}
      <div className="flex items-start gap-3 pt-1">
        <input
          id="consented"
          type="checkbox"
          {...register('consented')}
          className="mt-0.5 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
        />
        <label htmlFor="consented" className="text-sm text-gray-700 cursor-pointer">
          I have read the consent terms above and explicitly consent to the transfer
          of my personal data as described.{' '}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); privacyPolicy.toggle(); }}
            {...privacyPolicy.triggerProps}
            className="text-indigo-600 hover:text-indigo-800 font-medium whitespace-nowrap"
          >
            Privacy Policy {privacyPolicy.open ? '↑' : '↓'}
          </button>
        </label>
      </div>
      {errors.consented && (
        <DkFieldError className="text-xs text-red-600">
          {errors.consented.message as string}
        </DkFieldError>
      )}
      <PrivacyPolicyDrawer isOpen={privacyPolicy.open} id={privacyPolicy.panelProps.id} />
    </div>
  );
}
