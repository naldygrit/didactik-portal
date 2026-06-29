// Pre-auth onboarding ("Apply for access"). A visitor submits an organisation
// application that lands in the admin verification queue (orgs are created
// unverified; an admin verifies before access). Minimal friction by design:
// org type, org name, country, and a contact. Profile detail is enriched after
// verification, not here.

export type OrgType = 'broadcaster' | 'production_company';

export interface OnboardingApplicationInput {
  org_type: OrgType;
  org_name: string;
  country: string;
  contact_name: string;
  contact_email: string;
  message?: string;
}

export interface OnboardingApplicationResult {
  status: string; // 'received'
  reference?: string;
}

export async function postApplication(
  input: OnboardingApplicationInput,
): Promise<OnboardingApplicationResult> {
  let response: Response;
  try {
    response = await fetch('/api/v1/onboarding/applications/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
  } catch {
    throw new Error('Cannot reach the server. Please try again in a moment.');
  }
  if (!response.ok) {
    throw new Error('Something went wrong submitting your application. Please try again.');
  }
  return (await response.json()) as OnboardingApplicationResult;
}
