import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '../../../shared/apiHelpers';
import { jurisdictionalBasisForCountry } from '../../lib/jurisdiction';
import { CONSENT_TEXTS, INTERNATIONAL_LICENSEE_ADDENDUM } from '../../consentTexts';
import { PrivacyPolicyDrawer } from './PrivacyPolicyDrawer';
import type { MeResponse, ProductionCompanyDetail } from '../../../shared/types';
import type { WizardFormData } from '../../pages/SubmitPage';

export function Step3Consent() {
  const [expanded, setExpanded] = useState(false);
  const [isPolicyOpen, setIsPolicyOpen] = useState(false);
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
          onClick={() => setExpanded((v) => !v)}
          className="w-full flex items-center justify-between px-4 py-3 text-sm text-indigo-600 hover:text-indigo-800 font-medium text-left"
        >
          <span>{expanded ? 'Hide consent terms' : 'View full consent terms'}</span>
          <span className="text-gray-400">{expanded ? '▲' : '▼'}</span>
        </button>
        {expanded && (
          <div className="px-4 pb-4 border-t border-gray-100">
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
            onClick={(e) => { e.stopPropagation(); setIsPolicyOpen((v) => !v); }}
            className="text-indigo-600 hover:text-indigo-800 font-medium whitespace-nowrap"
          >
            Privacy Policy {isPolicyOpen ? '↑' : '↓'}
          </button>
        </label>
      </div>
      {errors.consented && (
        <p className="text-xs text-red-600">{errors.consented.message as string}</p>
      )}
      <PrivacyPolicyDrawer isOpen={isPolicyOpen} />
    </div>
  );
}
