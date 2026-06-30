// Rights-warranty copy shown at intake. Mirrors didactik-archive
// archive/attestation_texts.py (RIGHTS_ATTESTATION_TEXT / _VERSION) so the
// producer reads what the backend records. The backend snapshots its own copy;
// the portal sends only `rights_attested: true`. Keep in sync with the backend.

export const RIGHTS_ATTESTATION_VERSION = 'rights_attestation_v1_2026_06';

// The four warranted dimensions, rendered as a checklist the producer reads
// before affirming. Title/ownership and co-production have document slots in the
// backend; music and personality/property are attestation-only at this layer.
export const RIGHTS_WARRANTY_DIMENSIONS: { title: string; body: string }[] = [
  {
    title: 'Title and ownership',
    body: 'You own or control the underlying work and its full chain of title.',
  },
  {
    title: 'Music clearance',
    body: 'All music, including synchronisation rights for embedded recordings and compositions, is cleared for onward licensing.',
  },
  {
    title: 'Personality and property releases',
    body: 'You hold the necessary releases for identifiable people, locations, trademarks, and property shown in the work.',
  },
  {
    title: 'Co-production and third-party rights',
    body: 'Any co-production interests or third-party ownership are accurately disclosed, and you are authorised to license the work on their behalf.',
  },
];

export const RIGHTS_WARRANTY_FOOTER =
  'Didactik relies on this warranty when representing the title to broadcasters. ' +
  'Providing a false warranty may expose you to liability and removal of the title ' +
  'and your account from the platform.';
