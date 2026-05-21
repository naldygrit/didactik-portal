// Mirrors archive/consent_texts.py jurisdictional_basis_for_country().
// Must be kept in sync with the backend when new jurisdictions are added.

const EU_EEA_UK = new Set([
  // EU member states (27)
  'AT','BE','BG','CY','CZ','DE','DK','EE','ES','FI',
  'FR','GR','HR','HU','IE','IT','LT','LU','LV','MT',
  'NL','PL','PT','RO','SE','SI','SK',
  // EEA non-EU (3)
  'IS','LI','NO',
  // United Kingdom
  'GB',
]);

export type JurisdictionalBasis =
  | 'ndpa_section_43'
  | 'popia_section_72'
  | 'kenya_dpa'
  | 'gdpr_article_49'
  | 'other';

export function jurisdictionalBasisForCountry(
  countryCode: string | null | undefined,
): JurisdictionalBasis {
  if (!countryCode) return 'other';
  if (countryCode === 'NG') return 'ndpa_section_43';
  if (countryCode === 'ZA') return 'popia_section_72';
  if (countryCode === 'KE') return 'kenya_dpa';
  if (EU_EEA_UK.has(countryCode)) return 'gdpr_article_49';
  return 'other';
}
