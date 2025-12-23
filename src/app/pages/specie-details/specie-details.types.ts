// Species Details Types
export interface SpeciesDetailsDto {
  genieId: number;
  upovCode: string;
  botanicalName: string;
  otherBotanicalNames: string;
  denominationClass: string;
  family: string;
  cropType: string;
  twp: string;
  denomClass: string;
  testGuideline: string;
  names: {
    defaultName: string;
    commonNames: {
      other?: string;
      en?: string;
    };
  };
  protection: ProtectionAuthority[];
  dusGuidance: DUSGuidance;
}

export interface ProtectionAuthority {
  authorityCode: string;
  protectionType: string;
  notes: string;
  authorityName: string;
  administrativeWebsite: string | null;
  lawWebsite: string | null;
  derived: boolean;
}

export interface DUSGuidance {
  testGuideline: string;
  draftingAuthority: string;
  practicalExperience: DUSAuthority[];
  offerings: any[];
  utilizations: any[];
}

export interface DUSAuthority {
  authorityCode: string;
  noteSequence: string;
  authorityName: string;
  administrativeWebsite: string | null;
  lawWebsite: string | null;
  derived: boolean;
}

export interface AuthorityContact {
  name: string;
  email: string;
  phone: string;
  office: string;
}

export interface AuthorityCardData {
  country: string;
  code: string;
  tag: string;
  flag: string;
  contacts: AuthorityContact[];
  administrativeWebsite: string | null;
  lawWebsite: string | null;
  authorityId?: number;
  protectionType?: string;
  notes?: string;
}