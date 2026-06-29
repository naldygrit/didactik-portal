import { useFormContext } from 'react-hook-form';
import type { WizardFormData } from '../../pages/SubmitPage';

const BRAND = '#5343fd';

const OPTIONS: {
  value: 'nigerian_broadcasters' | 'international_streaming' | 'both';
  label: string;
  hint: string;
  recommended?: boolean;
}[] = [
  {
    value: 'nigerian_broadcasters',
    label: 'Nigerian broadcasters',
    hint: 'Offer this title to Nigerian TV and broadcast networks.',
  },
  {
    value: 'international_streaming',
    label: 'International streaming services',
    hint: 'Offer it to streamers and broadcasters outside Nigeria.',
  },
  {
    value: 'both',
    label: 'Both',
    hint: 'Reach Nigerian broadcast and international streaming. Most titles earn across both.',
    recommended: true,
  },
];

// Where the filmmaker wants the title licensed. The choice is stored on the
// Asset and, when it includes international, adds the international-licensee
// clause to the cross-border data-transfer consent (see Step3Consent).
export function LicensingPreference() {
  const { register, watch } = useFormContext<WizardFormData>();
  const selected = watch('licensing_preference');

  return (
    <div className="space-y-3">
      <div>
        <p className="text-sm font-medium text-gray-700">Where would you like this title licensed?</p>
        <p className="mt-0.5 text-sm text-gray-500">
          This sets who we offer the title to. You can change it later.
        </p>
      </div>

      <div className="space-y-2">
        {OPTIONS.map((o) => {
          const active = selected === o.value;
          return (
            <label
              key={o.value}
              className="flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors"
              style={
                active
                  ? { borderColor: BRAND, background: 'rgba(83,67,253,0.04)' }
                  : { borderColor: '#e5e7eb' }
              }
            >
              <input
                type="radio"
                value={o.value}
                {...register('licensing_preference')}
                className="mt-0.5 h-4 w-4 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="min-w-0">
                <span className="flex items-center gap-2 text-sm font-medium text-gray-900">
                  {o.label}
                  {o.recommended && (
                    <span
                      className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
                      style={{ background: 'rgba(83,67,253,0.1)', color: BRAND }}
                    >
                      Recommended
                    </span>
                  )}
                </span>
                <span className="mt-0.5 block text-xs text-gray-500">{o.hint}</span>
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
