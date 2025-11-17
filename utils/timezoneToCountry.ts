// A mapping from IANA timezone identifiers to ISO 3166-1 alpha-2 country codes.
// This is not exhaustive but covers common cases and the sample data.

const timezoneCountryMap: Record<string, string> = {
    // US/Canada
    "America/New_York": "US",
    "America/Chicago": "US",
    "America/Denver": "US",
    "America/Los_Angeles": "US",
    "America/Anchorage": "US",
    "Pacific/Honolulu": "US",
    "America/Toronto": "CA",
    "America/Vancouver": "CA",
    "America/Edmonton": "CA",
    "America/Winnipeg": "CA",

    // Europe
    "Europe/London": "GB",
    "Europe/Paris": "FR",
    "Europe/Berlin": "DE",
    "Europe/Helsinki": "FI",
    "Europe/Moscow": "RU",
    "Europe/Madrid": "ES",
    "Europe/Rome": "IT",

    // Asia
    "Asia/Dubai": "AE",
    "Asia/Kolkata": "IN",
    "Asia/Bangkok": "TH",
    "Asia/Shanghai": "CN",
    "Asia/Hong_Kong": "HK",
    "Asia/Tokyo": "JP",
    "Asia/Seoul": "KR",
    "Asia/Singapore": "SG",

    // Australia
    "Australia/Perth": "AU",
    "Australia/Darwin": "AU",
    "Australia/Adelaide": "AU",
    "Australia/Brisbane": "AU",
    "Australia/Sydney": "AU",
    "Australia/Melbourne": "AU",

    // South America
    "America/Sao_Paulo": "BR",
    "America/Argentina/Buenos_Aires": "AR",
    "America/Bogota": "CO",
    "America/Lima": "PE",
    "America/Caracas": "VE",

    // Other
    "UTC": "UN", // Placeholder for universal
    "Africa/Johannesburg": "ZA",
    "Pacific/Auckland": "NZ",
    "Africa/Cairo": "EG",
};

export const timezoneToCountry = (timezone: string): string | null => {
    if (timezoneCountryMap[timezone]) {
        return timezoneCountryMap[timezone];
    }
    return null;
};
