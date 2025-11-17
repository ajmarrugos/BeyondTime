// A curated list of common IANA timezones for a user-friendly dropdown.
// Full list is very long, so we select the most common ones.

export const timezones = [
    {
        "group": "US/Canada",
        "zones": [
            { "value": "America/New_York", "name": "Eastern Time (ET)" },
            { "value": "America/Chicago", "name": "Central Time (CT)" },
            { "value": "America/Denver", "name": "Mountain Time (MT)" },
            { "value": "America/Los_Angeles", "name": "Pacific Time (PT)" },
            { "value": "America/Anchorage", "name": "Alaska Time (AKT)" },
            { "value": "Pacific/Honolulu", "name": "Hawaii Time (HT)" }
        ]
    },
    {
        "group": "Europe",
        "zones": [
            { "value": "Europe/London", "name": "London (GMT/BST)" },
            { "value": "Europe/Paris", "name": "Paris, Berlin (CET/CEST)" },
            { "value": "Europe/Helsinki", "name": "Helsinki (EET/EEST)" },
            { "value": "Europe/Moscow", "name": "Moscow (MSK)" }
        ]
    },
    {
        "group": "Asia",
        "zones": [
            { "value": "Asia/Dubai", "name": "Dubai (GST)" },
            { "value": "Asia/Kolkata", "name": "India (IST)" },
            { "value": "Asia/Bangkok", "name": "Bangkok (ICT)" },
            { "value": "Asia/Shanghai", "name": "Shanghai, Hong Kong (CST)" },
            { "value": "Asia/Tokyo", "name": "Tokyo (JST)" },
            { "value": "Asia/Seoul", "name": "Seoul (KST)" }
        ]
    },
    {
        "group": "Australia",
        "zones": [
            { "value": "Australia/Perth", "name": "Perth (AWST)" },
            { "value": "Australia/Darwin", "name": "Darwin (ACST)" },
            { "value": "Australia/Adelaide", "name": "Adelaide (ACDT)" },
            { "value": "Australia/Brisbane", "name": "Brisbane (AEST)" },
            { "value": "Australia/Sydney", "name": "Sydney, Melbourne (AEDT)" }
        ]
    },
    {
        "group": "South America",
        "zones": [
            { "value": "America/Sao_Paulo", "name": "São Paulo (BRT)" },
            { "value": "America/Argentina/Buenos_Aires", "name": "Buenos Aires (ART)" },
            { "value": "America/Bogota", "name": "Bogota (COT)" }
        ]
    },
    {
        "group": "Other",
        "zones": [
            { "value": "UTC", "name": "Coordinated Universal Time (UTC)" },
            { "value": "Africa/Johannesburg", "name": "Johannesburg (SAST)" },
            { "value": "Pacific/Auckland", "name": "Auckland (NZDT)" }
        ]
    }
];
