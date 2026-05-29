export const CA_PROVINCE_CODES = [
  'AB', 'BC', 'MB', 'NB', 'NL', 'NS', 'NT', 'NU', 'ON', 'PE', 'QC', 'SK', 'YT',
] as const

export type CaProvinceCode = (typeof CA_PROVINCE_CODES)[number]

const ALIASES: Record<string, CaProvinceCode> = {
  alberta: 'AB',
  ab: 'AB',
  'british columbia': 'BC',
  bc: 'BC',
  manitoba: 'MB',
  mb: 'MB',
  'new brunswick': 'NB',
  nb: 'NB',
  'newfoundland and labrador': 'NL',
  'newfoundland & labrador': 'NL',
  nl: 'NL',
  'nova scotia': 'NS',
  ns: 'NS',
  'northwest territories': 'NT',
  nt: 'NT',
  nunavut: 'NU',
  nu: 'NU',
  ontario: 'ON',
  on: 'ON',
  'prince edward island': 'PE',
  pe: 'PE',
  pei: 'PE',
  quebec: 'QC',
  québec: 'QC',
  qc: 'QC',
  saskatchewan: 'SK',
  sk: 'SK',
  yukon: 'YT',
  yt: 'YT',
}

export function normalizeProvinceCode(input?: string | null): CaProvinceCode | null {
  if (!input) return null
  const key = input
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
  return ALIASES[key] ?? null
}

export function provinceCodeToName(code: CaProvinceCode): string {
  const names: Record<CaProvinceCode, string> = {
    AB: 'Alberta',
    BC: 'British Columbia',
    MB: 'Manitoba',
    NB: 'New Brunswick',
    NL: 'Newfoundland and Labrador',
    NS: 'Nova Scotia',
    NT: 'Northwest Territories',
    NU: 'Nunavut',
    ON: 'Ontario',
    PE: 'Prince Edward Island',
    QC: 'Quebec',
    SK: 'Saskatchewan',
    YT: 'Yukon',
  }
  return names[code]
}

export function resolveCanadianProvince(
  provinceCode?: string | null,
  state?: string | null,
): CaProvinceCode | null {
  return normalizeProvinceCode(provinceCode) ?? normalizeProvinceCode(state)
}
