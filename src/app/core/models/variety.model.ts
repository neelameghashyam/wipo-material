export interface Variety {
  // ────────────────────────────────────────────────────────────────────────
  // Core fields – **required** (present in every record)
  // ────────────────────────────────────────────────────────────────────────
  application_number: string;
  countryCode: string;
  fileId: string;
  recType: string;
  remarks: string;
  speciesLatinName: string;
  speciesUpovCode: string;
  variety_denomination_class: string;
  variety_identifier: string;
  submission_date: string;

  // ────────────────────────────────────────────────────────────────────────
  // Fields that are **optional** in the real data
  // ────────────────────────────────────────────────────────────────────────
  grantPublicationDate?: string;
  grantStartDate?: string;
  latest_denomination?: string;          // <-- the one that caused most errors

  // ────────────────────────────────────────────────────────────────────────
  // All the extra fields from the new sample (still optional)
  // ────────────────────────────────────────────────────────────────────────
  application_date?: string;
  application_publication_date?: string;
  breederReference?: string;
  grantNumber?: string;
  expirationDate?: string;
  endDate?: string;
  endType?: string;
  speciesCommonName?: string;
  speciesCommonNameOthers?: string;

  // Nested arrays – optional (some records are empty)
  denominations?: Denomination[];
  partiesConcerned?: Party[];
  equivalentApplications?: EquivalentApplication[];
  commercialization?: Commercialization[];
}

/* ──────────────────────────────────────────────────────────────────────── */
/* Nested interfaces (unchanged)                                           */
/* ──────────────────────────────────────────────────────────────────────── */
export interface Denomination {
  denominationType: string;
  denominationInfo?: string;
  denominationDate?: string;
}
export interface Party { nameType: string; nameInfo: string; }
export interface EquivalentApplication { infoType: string; informationText?: string; recordType?: string; }
export interface Commercialization {}

/* ──────────────────────────────────────────────────────────────────────── */
export interface Country { code: string; name: string; }
export interface Species { latinName: string; upovCode: string; }