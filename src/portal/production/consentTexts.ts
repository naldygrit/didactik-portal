// Versioned consent texts — mirror of archive/consent_texts.py.
// When the backend consent text changes (new version suffix), update this file
// to match. The version string is NOT used by the frontend — the backend
// snapshots the authoritative text into the Consent record at submission time.
// This copy exists solely to display the correct text to the user before they
// consent so they see exactly what the backend will record.

import type { JurisdictionalBasis } from './lib/jurisdiction';

interface ConsentEntry {
  version: string;
  text: string;
}

export const CONSENT_TEXTS: Record<JurisdictionalBasis, ConsentEntry> = {
  ndpa_section_43: {
    version: 'data_transfer_ndpa_v1_2026_05',
    text: `DATA TRANSFER CONSENT NOTICE
Nigeria Data Protection Act 2023 — Section 43(1)(a) Derogation

Didactik Media Limited ("Didactik") is a data controller under the Nigeria Data Protection Act 2023 (NDPA). When you submit content through this platform, personal data — including your name, contact details, and submission metadata — will be transferred to and stored on servers operated by Backblaze, Inc., a company incorporated in the United States of America.

Section 41 of the NDPA restricts cross-border transfer of personal data from Nigeria unless the receiving country provides an adequate level of protection, or a derogation under Section 43 applies. The United States does not currently hold an adequacy decision from the Nigeria Data Protection Commission (NDPC) — either under an approved-country list (none has been published as of the date of this notice) or under any other NDPC adequacy determination. This transfer therefore relies on your explicit informed consent under Section 43(1)(a) of the NDPA.

STATUTORY RISK DISCLOSURE (required by NDPA Section 43): By consenting, you acknowledge that your personal data is being transferred to a country that has not received an NDPC adequacy decision, and that your personal data may not receive the same level of protection in the United States as it would under Nigerian law. You have the right to withdraw this consent at any time by contacting privacy@didactikmedia.com. Withdrawal does not affect the lawfulness of any transfer made before the withdrawal, but you will no longer be able to submit content through this platform if you withdraw.

Data transferred: your name, contact details, and submission metadata.
Recipient: Backblaze, Inc., 500 Ben Franklin Court, San Mateo, CA 94402, USA.
Purpose: archival storage of your submitted audiovisual content.
Retention: until you request deletion or your submission is removed from the archive. Contact privacy@didactikmedia.com to exercise your data subject rights.
Full privacy policy: didactikmedia.com/privacy

By checking the box below, you explicitly and freely consent to the transfer of your personal data outside Nigeria on the basis of Section 43(1)(a) of the Nigeria Data Protection Act 2023. This consent is voluntary — you may decline without penalty other than being unable to submit content through this platform.`,
  },

  popia_section_72: {
    version: 'data_transfer_popia_v1_2026_05',
    text: `DATA TRANSFER CONSENT NOTICE
Protection of Personal Information Act 4 of 2013 (POPIA) — Section 72(1)(b)

Didactik Media Limited ("Didactik") processes your personal information as a responsible party under the Protection of Personal Information Act 4 of 2013 (POPIA). When you submit content through this platform, personal information — including your name, contact details, and submission metadata — will be transferred to and stored on servers operated by Backblaze, Inc., a company incorporated in the United States of America.

Section 72(1) of POPIA prohibits transfer of personal information to a third party in a foreign country unless one of the specified conditions is met. The Information Regulator of South Africa has not issued an adequacy determination for the United States. This transfer therefore relies on your explicit consent under Section 72(1)(b) of POPIA, which permits transfer where the data subject consents to the transfer.

Please note: Didactik's operations for South Africa–based submitters are currently in a pilot phase. Each submission is reviewed by Didactik admin staff before your upload is processed. You will be contacted at the details you provide once your submission is approved.

Data transferred: your name, contact details, and submission metadata.
Recipient: Backblaze, Inc., 500 Ben Franklin Court, San Mateo, CA 94402, USA.
Purpose: archival storage of your submitted audiovisual content.
Your rights under POPIA: you have the right to access, correct, and request deletion of your personal information, and to object to processing. Contact privacy@didactikmedia.com to exercise these rights.
Retention: until you request deletion or your submission is removed from the archive.
Full privacy policy: didactikmedia.com/privacy

By checking the box below, you explicitly consent to the transfer of your personal information to the United States of America on the basis of Section 72(1)(b) of the Protection of Personal Information Act 4 of 2013. This consent is voluntary and may be withdrawn at any time by contacting privacy@didactikmedia.com.`,
  },

  kenya_dpa: {
    version: 'data_transfer_kenya_dpa_v1_2026_05',
    text: `DATA TRANSFER CONSENT NOTICE
Kenya Data Protection Act 2019 — Section 48 Safeguards and Supplementary Consent

Didactik Media Limited ("Didactik") processes your personal data as a data controller. When you submit content through this platform, personal data — including your name, contact details, and submission metadata — will be transferred to and stored on servers operated by Backblaze, Inc., a company incorporated in the United States of America.

Section 48 of the Kenya Data Protection Act 2019 (DPA) governs the transfer of personal data outside Kenya. Didactik is implementing appropriate safeguards for this transfer as required by Section 48. As a supplementary measure, and in the interest of full transparency, we are also requesting your explicit consent to this transfer.

Please note: Didactik's registration of cross-border transfer safeguards with the Office of the Data Protection Commissioner (ODPC) is currently pending. An admin staff member will review your submission within seven business days to confirm that the applicable data protection requirements are satisfied before your content is processed. You will be contacted at the details you provide if further information or documentation is required.

Data transferred: your name, contact details, and submission metadata.
Recipient: Backblaze, Inc., 500 Ben Franklin Court, San Mateo, CA 94402, USA.
Purpose: archival storage of your submitted audiovisual content.
Your rights under the Kenya DPA: you have the right to access, correct, and request deletion of your personal data. Contact privacy@didactikmedia.com.
Retention: until you request deletion or your submission is removed from the archive.
Full privacy policy: didactikmedia.com/privacy

By checking the box below, you acknowledge this disclosure and consent to the transfer of your personal data to the United States of America as a supplementary measure to Didactik's Section 48 safeguards under the Kenya Data Protection Act 2019.`,
  },

  gdpr_article_49: {
    version: 'data_transfer_gdpr_art49_v1_2026_05',
    text: `DATA TRANSFER CONSENT NOTICE
General Data Protection Regulation — Article 49(1)(a) Derogation
(Applies to submitters in the EU, EEA, and United Kingdom)

Didactik Media Limited ("Didactik") is the controller of your personal data for the purposes of this submission. When you submit content through this platform, personal data — including your name, contact details, and submission metadata — will be transferred to and stored on servers operated by Backblaze, Inc., a company incorporated in the United States of America.

The European Commission has not issued an adequacy decision covering Backblaze, Inc. Didactik does not currently have Standard Contractual Clauses (SCCs) or other Article 46 transfer mechanisms in place with Backblaze for submitters in your jurisdiction. This transfer therefore relies on your explicit consent under Article 49(1)(a) of the GDPR (or Article 49(1)(a) UK GDPR as applicable), which permits occasional, non-repetitive transfers to third countries lacking an adequacy decision where the data subject has explicitly consented.

CLOUD ACT DISCLOSURE: Backblaze, Inc. is a US company subject to the Clarifying Lawful Overseas Use of Data Act (CLOUD Act), 18 U.S.C. § 2713. Under the CLOUD Act, US government agencies may compel Backblaze to disclose your personal data stored on its servers, potentially without prior notice to you and without a mutual legal assistance treaty (MLAT) process. This is a material risk that GDPR Article 49 derogation guidance requires you to be informed of before consenting.

TRANSFER MECHANISM TRANSITION: Didactik intends to migrate EU/EEA/UK submitters to Standard Contractual Clauses under GDPR Article 46 as the primary transfer mechanism. Until those SCCs are executed, this Article 49(1)(a) consent is the applicable transfer basis.

Please note: Didactik's operations for EU/EEA/UK–based submitters are currently in a limited pilot phase. Each submission is reviewed by Didactik admin staff before your upload is processed.

Data transferred: your name, contact details, and submission metadata.
Recipient: Backblaze, Inc., 500 Ben Franklin Court, San Mateo, CA 94402, USA.
Purpose: archival storage of your submitted audiovisual content.
Legal basis for transfer: Article 49(1)(a) GDPR / UK GDPR — explicit consent.
Your rights: you have the right of access, rectification, erasure, restriction of processing, data portability, and to object to processing. You may also lodge a complaint with your local supervisory authority. Contact privacy@didactikmedia.com.
Retention: until you request deletion or your submission is removed from the archive.
Full privacy policy: didactikmedia.com/privacy

By checking the box below, you explicitly and freely consent to the transfer of your personal data to the United States of America on the basis of Article 49(1)(a) of the General Data Protection Regulation (or UK GDPR as applicable). This consent is voluntary. You may withdraw it at any time by contacting privacy@didactikmedia.com — withdrawal does not affect the lawfulness of any prior transfer, but you will no longer be able to submit content through this platform.`,
  },

  other: {
    version: 'data_transfer_other_v1_2026_05',
    text: `DATA TRANSFER CONSENT NOTICE
Provisional Cross-Border Data Transfer Disclosure

Didactik Media Limited ("Didactik") is the controller of your personal data. When you submit content through this platform, personal data — including your name, contact details, and submission metadata — will be transferred to and stored on servers operated by Backblaze, Inc., a company incorporated in the United States of America.

Didactik has identified that the data protection framework applicable to submitters in your country or jurisdiction requires individual review. An admin staff member will contact you within seven business days at the details you provide to confirm the applicable legal framework and any additional safeguards or documentation required for your jurisdiction. Your content will not be made available on the platform until that review is complete. For enquiries, contact onboarding@didactikmedia.com.

Data transferred: your name, contact details, and submission metadata.
Recipient: Backblaze, Inc., 500 Ben Franklin Court, San Mateo, CA 94402, USA.
Purpose: archival storage of your submitted audiovisual content.
Retention: until you request deletion or your submission is removed from the archive. Contact privacy@didactikmedia.com to exercise your data subject rights.
Full privacy policy: didactikmedia.com/privacy

By checking the box below, you acknowledge this disclosure and provide provisional consent to the transfer of your personal data as described above, pending Didactik's jurisdiction-specific compliance review.`,
  },
};
