export interface SpeciesDto {
  genieId: string;
  upovCode: string;
  botanicalName?: string;
  commonName?: string;
  type: 'species' | 'authority';
  imageUrl?: string;
  family?: string;
  genus?: string;
  region?: string;
  updated?: boolean;
}

export const MOCK_SPECIES_DATA: SpeciesDto[] = [
  // Species
  { genieId: 'ANANA', upovCode: 'ANANA', botanicalName: 'Ananas Mill.', commonName: 'Pineapple', type: 'species', family: 'Bromeliaceae', genus: 'Ananas', region: 'Tropical', imageUrl: 'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=400', updated: true },
  { genieId: 'MALUS', upovCode: 'MALUS', botanicalName: 'Malus Mill.', commonName: 'Apple', type: 'species', family: 'Rosaceae', genus: 'Malus', region: 'Temperate', imageUrl: '', updated: false },
  { genieId: 'BOUVA_LTE', upovCode: 'BOUVA_LTE', botanicalName: 'Bouvardia longiflora x Bouvardia ternifolia', commonName: '', type: 'species', family: 'Rubiaceae', genus: 'Bouvardia', region: 'Tropical', imageUrl: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=400', updated: true },
  { genieId: 'ABELM_MOS', upovCode: 'ABELM_MOS', botanicalName: 'Abelmoschus moschatus Medik. subsp. tuberosus...', commonName: '', type: 'species', family: 'Malvaceae', genus: 'Abelmoschus', region: 'Tropical', imageUrl: 'https://images.unsplash.com/photo-1516205651411-aef33a44f7c2?w=400', updated: true },
  { genieId: 'CAMPA_LTL', upovCode: 'CAMPA_LTL', botanicalName: 'Campanula latiloba A. DC.', commonName: '', type: 'species', family: 'Campanulaceae', genus: 'Campanula', region: 'Temperate', imageUrl: 'https://images.unsplash.com/photo-1469259943454-aa100abba749?w=400', updated: true },
  { genieId: 'CALCN_FLO', upovCode: 'CALCN_FLO', botanicalName: 'Calycanthus floridus L.', commonName: 'Carolina-allspice; pineapple-...', type: 'species', family: 'Calycanthaceae', genus: 'Calycanthus', region: 'Temperate', imageUrl: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=400', updated: true },
  { genieId: 'AGAPA', upovCode: 'AGAPA', botanicalName: "Agapanthus L'Hér.", commonName: 'African Lily', type: 'species', family: 'Agapanthaceae', genus: 'Agapanthus', region: 'Subtropical', imageUrl: '', updated: true },
  { genieId: 'ABELI', upovCode: 'ABELI', botanicalName: 'Abelia R. Br.', commonName: 'Abelia', type: 'species', family: 'Linnaeaceae', genus: 'Abelia', region: 'Temperate', imageUrl: 'https://images.unsplash.com/photo-1455659817273-f96807779a8a?w=400', updated: false },
  { genieId: 'ABELI_CHI', upovCode: 'ABELI_CHI', botanicalName: 'Abelia chinensis R. Br.', commonName: '', type: 'species', family: 'Linnaeaceae', genus: 'Abelia', region: 'Asia', imageUrl: '', updated: false },
  { genieId: 'ABELI_ENG', upovCode: 'ABELI_ENG', botanicalName: 'Abelia engleriana (Graebn.) Rehder', commonName: '', type: 'species', family: 'Linnaeaceae', genus: 'Abelia', region: 'Asia', imageUrl: '', updated: false },
  { genieId: 'ABELI_FLO', upovCode: 'ABELI_FLO', botanicalName: 'Abelia floribunda (M. Martens & Galeotti) Decne.', commonName: '', type: 'species', family: 'Linnaeaceae', genus: 'Abelia', region: 'Central America', imageUrl: '', updated: false },
  { genieId: 'ABELI_GRA', upovCode: 'ABELI_GRA', botanicalName: 'Abelia ×grandiflora x Abelia parviflora', commonName: '', type: 'species', family: 'Linnaeaceae', genus: 'Abelia', region: 'Hybrid', imageUrl: '', updated: false },
  { genieId: 'ABELI_GRA2', upovCode: 'ABELI_GRA2', botanicalName: 'Abelia ×grandiflora Rehder', commonName: '', type: 'species', family: 'Linnaeaceae', genus: 'Abelia', region: 'Hybrid', imageUrl: '', updated: false },
  
  // Brassica species
  { genieId: 'BRASS', upovCode: 'BRASS', botanicalName: 'Brassica L.', commonName: '', type: 'species', family: 'Brassicaceae', genus: 'Brassica', region: 'Global', imageUrl: 'https://images.unsplash.com/photo-1510627489930-0c1b0bfb6785?w=400', updated: true },
  { genieId: 'BRASS_CAR', upovCode: 'BRASS_CAR', botanicalName: 'Brassica carinata A. Braun', commonName: 'Abyssinian cabbage; chou E...', type: 'species', family: 'Brassicaceae', genus: 'Brassica', region: 'Africa', imageUrl: 'https://images.unsplash.com/photo-1568584711271-6c0f67f6a22b?w=400', updated: false },
  { genieId: 'BRASS_HAR', upovCode: 'BRASS_HAR', botanicalName: 'Brassica ×harmsiana O.E. Schulz', commonName: '', type: 'species', family: 'Brassicaceae', genus: 'Brassica', region: 'Hybrid', imageUrl: 'https://images.unsplash.com/photo-1590165482129-1b8b27698780?w=400', updated: false },
  { genieId: 'BRASS_JUN', upovCode: 'BRASS_JUN', botanicalName: 'Brassica juncea (L.) Czern.', commonName: 'Brown mustard; Moutarde b...', type: 'species', family: 'Brassicaceae', genus: 'Brassica', region: 'Asia', imageUrl: 'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=400', updated: true },
  { genieId: 'BRASS_JUN_INT', upovCode: 'BRASS_JUN_INT', botanicalName: 'Brassica juncea (L.) Czern. subsp. integrifolia (H. W...', commonName: '', type: 'species', family: 'Brassicaceae', genus: 'Brassica', region: 'Asia', imageUrl: '', updated: false },
  { genieId: 'BRASS_NAP', upovCode: 'BRASS_NAP', botanicalName: 'Brassica napus L.', commonName: '', type: 'species', family: 'Brassicaceae', genus: 'Brassica', region: 'Europe', imageUrl: 'https://images.unsplash.com/photo-1588416936097-41850ab3d86d?w=400', updated: true },
  { genieId: 'BRASS_NAP_NAR', upovCode: 'BRASS_NAP_NAR', botanicalName: 'Brassica napus (L.) Rchb.', commonName: 'Swede-rave; Swede-rave; Knol...', type: 'species', family: 'Brassicaceae', genus: 'Brassica', region: 'Europe', imageUrl: '', updated: false },
  { genieId: 'BRASS_NAP_NUS', upovCode: 'BRASS_NAP_NUS', botanicalName: 'Brassica napus L. var. napus', commonName: 'Oilseed Rape; Colza; Raps-...', type: 'species', family: 'Brassicaceae', genus: 'Brassica', region: 'Europe', imageUrl: 'https://images.unsplash.com/photo-1568584711271-6c0f67f6a22b?w=400', updated: true },
  { genieId: 'BRASS_NAP_PAB', upovCode: 'BRASS_NAP_PAB', botanicalName: 'Brassica napus L. subsp. napus var. pabularia (D...', commonName: 'Hanover-salad; chou a fauch...', type: 'species', family: 'Brassicaceae', genus: 'Brassica', region: 'Europe', imageUrl: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400', updated: true },
  { genieId: 'BRASS_NIG', upovCode: 'BRASS_NIG', botanicalName: 'Brassica nigra (L.) W. D. J. Koch', commonName: 'Black Mustard; Moutarde no...', type: 'species', family: 'Brassicaceae', genus: 'Brassica', region: 'Mediterranean', imageUrl: 'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=400', updated: true },
  { genieId: 'BRASS_OLE', upovCode: 'BRASS_OLE', botanicalName: 'Brassica oleracea L.', commonName: '', type: 'species', family: 'Brassicaceae', genus: 'Brassica', region: 'Europe', imageUrl: 'https://images.unsplash.com/photo-1568584711271-6c0f67f6a22b?w=400', updated: true },
  { genieId: 'BRASS_OLE_ALB', upovCode: 'BRASS_OLE_ALB', botanicalName: 'Brassica oleracea L. (Chinese Kale or Kailaan...', commonName: '', type: 'species', family: 'Brassicaceae', genus: 'Brassica', region: 'Asia', imageUrl: 'https://images.unsplash.com/photo-1590165482129-1b8b27698780?w=400', updated: true },
  { genieId: 'BRASS_OLE_COS', upovCode: 'BRASS_OLE_COS', botanicalName: 'Brassica oleracea L. (Tronchuda Group)', commonName: 'Beefroot cabbage; Chou tr...', type: 'species', family: 'Brassicaceae', genus: 'Brassica', region: 'Europe', imageUrl: '', updated: false },
  { genieId: 'BRASS_OLE_GA', upovCode: 'BRASS_OLE_GA', botanicalName: 'Brassica oleracea L. (Kale Group)', commonName: 'Kale', type: 'species', family: 'Brassicaceae', genus: 'Brassica', region: 'Europe', imageUrl: 'https://images.unsplash.com/photo-1567360425618-1594206637d2?w=400', updated: true },
  { genieId: 'BRASS_OLE_GAM', upovCode: 'BRASS_OLE_GAM', botanicalName: 'Brassica oleracea L. (Marrowstem Kale Group)', commonName: 'Morrow-stem Kale; Chou mo...', type: 'species', family: 'Brassicaceae', genus: 'Brassica', region: 'Europe', imageUrl: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400', updated: true },
  { genieId: 'BRODI', upovCode: 'BRODI', botanicalName: 'Brassica x Diplotaxis', commonName: '', type: 'species', family: 'Brassicaceae', genus: 'Brassica', region: 'Hybrid', imageUrl: 'https://images.unsplash.com/photo-1510627489930-0c1b0bfb6785?w=400', updated: false },
  
  
];


export interface AuthorityDto extends SpeciesDto {
  contactPerson?: string;
  organization?: string;
  phone?: string;
  email?: string;
  address?: string;
  website?: string;
  protectionScope?: string;   // “Protects whole plant kingdom…”
  dusGuidance?: boolean;      // DUS Guidance & Cooperation
}

export const MOCK_AUTHORITIES_DATA: AuthorityDto[] = [

  {
    genieId: 'AUTH001',
    upovCode: 'AU',
    botanicalName: 'Australia (AU)',
    commonName: 'Plant Breeder’s Rights',
    type: 'authority',
    imageUrl: 'https://flagcdn.com/w80/au.png',
    region: 'Oceania',
    organization: 'IP Australia',
    contactPerson: 'James Donovan',
    phone: '+61 2 6283 2999',
    email: 'pbr@ipaustralia.gov.au',
    address: 'PO Box 200, Woden ACT 2606, Australia',
    website: 'https://www.ipaustralia.gov.au/plant-breeders-rights',
    protectionScope: 'Protects the whole or essentially the whole plant kingdom.',
    dusGuidance: true,
    updated: false
  },

  {
    genieId: 'AUTH002',
    upovCode: 'BG',
    botanicalName: 'Authoririi (ISO code)',
    commonName: 'State Patent Office of the Republic of Bulgaria',
    type: 'authority',
    imageUrl: 'https://flagcdn.com/w80/bg.png',
    region: 'Europe',
    organization: 'Patent Office of Bulgaria',
    contactPerson: 'Ivan Petrov',
    phone: '+359 2 873 5175',
    email: 'bpo@bpo.bg',
    address: '52B Dr. G.M. Dimitrov Blvd., Sofia 1040, Bulgaria',
    website: 'https://www.bpo.bg',
    protectionScope: 'Protects plant varieties under national legislation.',
    dusGuidance: true,
    updated: false
  },

  {
    genieId: 'AUTH003',
    upovCode: 'US',
    botanicalName: 'United States (US)',
    commonName: 'Plant Variety Protection Office',
    type: 'authority',
    imageUrl: 'https://flagcdn.com/w80/us.png',
    region: 'North America',
    organization: 'USDA – PVPO',
    contactPerson: 'Sarah Collins',
    phone: '+1 202 720 6500',
    email: 'pvpo@usda.gov',
    address: '1400 Independence Ave SW, Washington, DC 20250, USA',
    website: 'https://www.ams.usda.gov/services/plant-variety-protection',
    protectionScope: 'Protects sexually reproduced and tuber-propagated varieties.',
    dusGuidance: true,
    updated: false
  },

  {
    genieId: 'AUTH004',
    upovCode: 'JP',
    botanicalName: 'Japan (JP)',
    commonName: 'Plant Variety Protection Office',
    type: 'authority',
    imageUrl: 'https://flagcdn.com/w80/jp.png',
    region: 'Asia',
    organization: 'MAFF – Japan',
    contactPerson: 'Hiroshi Tanaka',
    phone: '+81 3 3502 8111',
    email: 'pvp@maff.go.jp',
    address: '1-2-1 Kasumigaseki, Chiyoda-ku, Tokyo, Japan',
    website: 'https://www.maff.go.jp',
    protectionScope: 'Protects plant varieties under Seeds and Seedlings Law.',
    dusGuidance: true,
    updated: false
  },

  {
    genieId: 'AUTH005',
    upovCode: 'FR',
    botanicalName: 'France (FR)',
    commonName: 'Plant Variety Office',
    type: 'authority',
    imageUrl: 'https://flagcdn.com/w80/fr.png',
    region: 'Europe',
    organization: 'INOV',
    contactPerson: 'Marie Dupont',
    phone: '+33 1 53 94 25 00',
    email: 'contact@inov.fr',
    address: '7 Rue de Prony, 75017 Paris, France',
    website: 'https://www.inov.fr',
    protectionScope: 'Protects plant varieties under French IP law.',
    dusGuidance: true,
    updated: false
  },

  {
    genieId: 'AUTH006',
    upovCode: 'DE',
    botanicalName: 'Germany (DE)',
    commonName: 'Federal Plant Variety Office',
    type: 'authority',
    imageUrl: 'https://flagcdn.com/w80/de.png',
    region: 'Europe',
    organization: 'Bundessortenamt',
    contactPerson: 'Thomas Müller',
    phone: '+49 531 299 400',
    email: 'info@bundessortenamt.de',
    address: 'Osterfelddamm 80, 30627 Hannover, Germany',
    website: 'https://www.bundessortenamt.de',
    protectionScope: 'Protects varieties registered in Germany.',
    dusGuidance: true,
    updated: false
  },

  {
    genieId: 'AUTH007',
    upovCode: 'CN',
    botanicalName: 'China (CN)',
    commonName: 'Plant Variety Protection Office',
    type: 'authority',
    imageUrl: 'https://flagcdn.com/w80/cn.png',
    region: 'Asia',
    organization: 'Ministry of Agriculture and Rural Affairs',
    contactPerson: 'Li Wei',
    phone: '+86 10 5919 0000',
    email: 'pvpchina@agri.gov.cn',
    address: '11 Nongzhan Guan Nanli, Beijing, China',
    website: 'http://www.moa.gov.cn',
    protectionScope: 'Protects agricultural and forestry plant varieties.',
    dusGuidance: false,
    updated: false
  },

  {
    genieId: 'AUTH008',
    upovCode: 'IN',
    botanicalName: 'India (IN)',
    commonName: 'Plant Variety Protection Authority',
    type: 'authority',
    imageUrl: 'https://flagcdn.com/w80/in.png',
    region: 'Asia',
    organization: 'PPV&FRA',
    contactPerson: 'R. K. Sharma',
    phone: '+91 11 2584 2750',
    email: 'registrar.ppvfra@gov.in',
    address: 'NASC Complex, DPS Marg, New Delhi, India',
    website: 'https://www.plantauthority.gov.in',
    protectionScope: 'Protects farmers, breeders and researchers rights.',
    dusGuidance: true,
    updated: false
  },

  {
    genieId: 'AUTH009',
    upovCode: 'ZA',
    botanicalName: 'South Africa (ZA)',
    commonName: 'Plant Breeders’ Rights Office',
    type: 'authority',
    imageUrl: 'https://flagcdn.com/w80/za.png',
    region: 'Africa',
    organization: 'Department of Agriculture',
    contactPerson: 'Nomsa Dlamini',
    phone: '+27 12 319 6000',
    email: 'pbr@dalrrd.gov.za',
    address: 'Pretoria, South Africa',
    website: 'https://www.dalrrd.gov.za',
    protectionScope: 'Protects plant breeders’ rights nationally.',
    dusGuidance: false,
    updated: false
  },

  {
    genieId: 'AUTH010',
    upovCode: 'BR',
    botanicalName: 'Brazil (BR)',
    commonName: 'National Plant Variety Protection Service',
    type: 'authority',
    imageUrl: 'https://flagcdn.com/w80/br.png',
    region: 'South America',
    organization: 'Ministry of Agriculture – SNPC',
    contactPerson: 'Carlos Silva',
    phone: '+55 61 3218 2500',
    email: 'snpc@agro.gov.br',
    address: 'Brasília, DF, Brazil',
    website: 'https://www.gov.br/agricultura',
    protectionScope: 'Protects plant varieties under Brazilian law.',
    dusGuidance: true,
    updated: false
  }

];
