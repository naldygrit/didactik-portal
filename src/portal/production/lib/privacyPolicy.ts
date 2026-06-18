// Privacy policy content for the submission wizard drawer.
// Update PRIVACY_POLICY_VERSION and PRIVACY_POLICY_DATE whenever the text changes.
// Each section maps to a <heading> + <body> rendered by the PrivacyPolicyDrawer component.
//
// Requires legal review before pilot launch.
// Registered office address placeholder must be confirmed before pilot launch.
// NOTE: The gdpr_article_49 entry in consentTexts.ts incorrectly states Backblaze is not
// DPF-certified. Backblaze has self-certified under the EU-US DPF and UK-US DataBridge.
// That consent text requires a version bump and update in a separate task.

export interface PolicySection {
  heading: string;
  body: string;
}

export const PRIVACY_POLICY_VERSION = "v1_2026_06";
export const PRIVACY_POLICY_DATE = "June 2026";

// ⚠️ Legal disclaimer: this document is informational and was produced with AI assistance.
// It does not constitute legal advice. Obtain qualified legal review before publication.
export const PRIVACY_POLICY: PolicySection[] = [
  {
    heading: "Who we are",
    body: `Didactik Media Limited ("Didactik", "we", "us") is the data controller of personal data you provide when submitting audiovisual content through this platform.

Registered office: [REGISTERED OFFICE ADDRESS — confirm before pilot launch]

Data protection contact: privacy@didactikmedia.com`,
  },

  {
    heading: "Personal data we collect",
    body: `When you submit content through the Didactik platform, we collect:

• Your name (provided as "submitter name")
• Your contact details — email address or telephone number (provided as "contact information")
• Your IP address at the time of submission, recorded automatically as part of the consent audit trail
• The date, time, and version of the consent terms you agreed to, stored as an immutable consent record
• Details of the content submitted (title, asset type, production year, description)

We do not collect health data, biometric data, or other special category personal data about you.`,
  },

  {
    heading: "Why we collect it and the lawful basis",
    body: `We collect your personal data solely to create an asset record in our archive linked to your submitted content, and to comply with our data protection obligations — including recording your informed consent to any cross-border transfer of your personal data.

The lawful basis depends on where your production company is based:

Nigeria — NDPA Section 43(1)(a): explicit informed consent to cross-border transfer to a country without an NDPC adequacy determination.

South Africa — POPIA Section 72(1)(b): explicit consent to transfer to a country without an adequacy determination from the Information Regulator.

Kenya — Kenya Data Protection Act 2019 Section 48 safeguards, supplemented by your explicit consent during Didactik's ODPC registration period.

EU, EEA, and UK — Transfers to our storage processor (Backblaze) benefit from the EU-US Data Privacy Framework adequacy decision (GDPR Article 45) and the UK-US DataBridge (for UK submitters). Didactik also collects explicit consent under GDPR Article 49(1)(a) as a supplementary measure given the DPF's current legal status (see Section 5).

Other countries — Provisional consent, pending individual review of the applicable data protection framework by Didactik admin staff within seven business days.`,
  },

  {
    heading: "Our storage processor: Backblaze",
    body: `Your submitted content and associated metadata are stored on infrastructure operated by Backblaze, Inc., our storage processor, at 500 Ben Franklin Court, San Mateo, CA 94402, United States of America. Backblaze processes your personal data solely on our instructions and for no other purpose.

We have entered into (or are in the process of entering into) a Data Processing Agreement with Backblaze governing how they handle your data.`,
  },

  {
    heading: "International transfers and CLOUD Act disclosure",
    body: `Regardless of where you are based, your personal data will be transferred to and stored in the United States of America, where Backblaze operates.

CLOUD Act disclosure: Backblaze, Inc. is subject to the Clarifying Lawful Overseas Use of Data Act (CLOUD Act), 18 U.S.C. § 2713. Under this law, US government agencies may compel Backblaze to disclose data stored on its servers, potentially without prior notice to you and without a mutual legal assistance treaty (MLAT) process. This is a material risk you are entitled to be informed of before consenting.

EU and EEA submitters: Backblaze has self-certified under the EU-US Data Privacy Framework (EU-US DPF) with the US Department of Commerce. Transfers therefore have the benefit of the European Commission's adequacy decision for the DPF (GDPR Article 45). However, the EU-US DPF is currently subject to a legal challenge before the Court of Justice of the EU (Case C-703/25 P) and PCLOB oversight is suspended. Didactik also collects explicit consent under GDPR Article 49(1)(a) as a supplementary measure, and intends to execute Standard Contractual Clauses with Backblaze as the primary transfer mechanism when EU operations scale beyond the pilot phase.

UK submitters: Backblaze is certified under the UK-US DataBridge (the UK extension of the EU-US DPF), which provides the transfer mechanism for UK-to-US transfers under UK GDPR.

Nigerian submitters: The EU-US DPF does not apply to transfers governed by Nigerian law. The United States does not hold an NDPC adequacy determination. Transfers rely on your explicit consent under NDPA Section 43(1)(a).

South African submitters: The EU-US DPF does not apply to transfers governed by POPIA. The Information Regulator has not issued an adequacy determination for the United States. Transfers rely on your explicit consent under POPIA Section 72(1)(b).

Kenyan submitters: Didactik's ODPC registration of cross-border transfer safeguards is currently pending. Transfers are supplemented by your explicit consent.`,
  },

  {
    heading: "Retention",
    body: `We retain your personal data (name, contact details, IP address, and consent record) for as long as your submitted content remains in the Didactik archive, or until you request deletion — whichever comes first.

When a submission is permanently removed from the archive, we delete or anonymise the associated personal data, except where retention is required by law — for example, to demonstrate the lawfulness of processing under a prior consent record.

To request deletion: privacy@didactikmedia.com. We respond within the timeframe required by applicable law (30 days under GDPR; 21 days for access requests under NDPA).`,
  },

  {
    heading: "Your rights",
    body: `Your rights depend on the data protection law applicable to your jurisdiction.

Nigeria (NDPA): Right to access (s.34), correction (s.35), deletion (s.37), and withdrawal of consent (s.38). Lodge a complaint with the Nigeria Data Protection Commission (NDPC) at ndpc.gov.ng.

South Africa (POPIA): Right to access (s.23), correction or deletion (s.24), and to object to processing (s.11(3)). Lodge a complaint with the Information Regulator of South Africa at justice.gov.za/inforeg.

Kenya (Kenya DPA): Right to access, correct, delete, restrict, port, and object to processing, and to withdraw consent. Lodge a complaint with the Office of the Data Protection Commissioner (ODPC) at odpc.go.ke.

EU, EEA, and UK (GDPR / UK GDPR): Right of access (Art. 15), rectification (Art. 16), erasure (Art. 17), restriction of processing (Art. 18), data portability (Art. 20), and to object (Art. 21). Lodge a complaint with your Member State data protection authority (EU/EEA) or the Information Commissioner's Office (UK) at ico.org.uk.

To exercise any right: privacy@didactikmedia.com`,
  },

  {
    heading: "Withdrawing consent",
    body: `Where processing or transfer relies on your consent, you may withdraw it at any time by contacting privacy@didactikmedia.com. Withdrawal does not affect the lawfulness of any processing carried out before withdrawal. If you withdraw consent, you will no longer be able to submit content through this platform.`,
  },

  {
    heading: "Automated decision-making",
    body: `We do not make automated decisions about you that produce legal or similarly significant effects (GDPR Art. 22). All submission approvals involve review by Didactik admin staff.`,
  },

  {
    heading: "Changes to this policy",
    body: `We may update this policy as our operations develop or applicable law changes. The version date at the top of this policy records when it was last updated. For material changes affecting EU/EEA/UK submitters, we will provide advance notice where required by applicable law.`,
  },

  {
    heading: "Contact",
    body: `Didactik Media Limited
Data protection: privacy@didactikmedia.com
Onboarding enquiries: onboarding@didactikmedia.com
Registered office: [REGISTERED OFFICE ADDRESS — confirm before pilot launch]`,
  },
];
