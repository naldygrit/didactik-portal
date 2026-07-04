import { useId } from 'react';
import { PRIVACY_POLICY, PRIVACY_POLICY_DATE, PRIVACY_POLICY_VERSION } from '../../lib/privacyPolicy';

interface Props {
  isOpen: boolean;
  /** From the toggling button's useDkDisclosure().panelProps, so aria-controls resolves. */
  id?: string;
}

export function PrivacyPolicyDrawer({ isOpen, id }: Props) {
  const headingId = useId();
  if (!isOpen) return null;

  return (
    <div
      id={id}
      role="region"
      aria-labelledby={headingId}
      className="mt-3 border border-gray-200 rounded-lg bg-gray-50 max-h-96 overflow-y-auto"
    >
      <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-gray-50 z-10">
        <h3 id={headingId} className="text-sm font-semibold text-gray-900">
          Privacy Policy
        </h3>
        <span className="text-xs text-gray-400">
          {PRIVACY_POLICY_DATE} · {PRIVACY_POLICY_VERSION}
        </span>
      </div>
      <div className="px-4 pb-4 pt-3 space-y-4">
        {PRIVACY_POLICY.map((section) => (
          <div key={section.heading}>
            <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1">
              {section.heading}
            </h4>
            <p className="text-xs text-gray-600 whitespace-pre-wrap leading-relaxed">
              {section.body}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
