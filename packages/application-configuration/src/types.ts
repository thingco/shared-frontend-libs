export type DistanceUnitPreference = "mi" | "km";

export type TimeDisplayPreference = "12" | "24";

export type DistancePrecisionPreference = number;

// prettier-ignore
export type LocalePreference = undefined | "af" | "af-NA" | "am" | "ar" | "ar-AE" | "ar-BH" | "ar-DJ" | "ar-DZ" | "ar-EG" | "ar-EH" | "ar-ER" | "ar-IL" | "ar-IQ" | "ar-JO" | "ar-KM" | "ar-KW" | "ar-LB" | "ar-LY" | "ar-MA" | "ar-MR" | "ar-OM" | "ar-PS" | "ar-QA" | "ar-SA" | "ar-SD" | "ar-SO" | "ar-SS" | "ar-SY" | "ar-TD" | "ar-TN" | "ar-YE" | "as" | "az" | "az-Latn" | "be" | "bg" | "bn" | "bn-IN" | "bs" | "bs-Latn" | "ca" | "ca-AD" | "ca-ES-VALENCIA" | "ca-FR" | "ca-IT" | "cs" | "cy" | "da" | "da-GL" | "de" | "de-AT" | "de-BE" | "de-CH" | "de-IT" | "de-LI" | "de-LU" | "el" | "el-CY" | "en" | "en-001" | "en-150" | "en-AE" | "en-AG" | "en-AI" | "en-AS" | "en-AT" | "en-AU" | "en-BB" | "en-BE" | "en-BI" | "en-BM" | "en-BS" | "en-BW" | "en-BZ" | "en-CA" | "en-CC" | "en-CH" | "en-CK" | "en-CM" | "en-CX" | "en-CY" | "en-DE" | "en-DG" | "en-DK" | "en-DM" | "en-ER" | "en-FI" | "en-FJ" | "en-FK" | "en-FM" | "en-GB" | "en-GD" | "en-GG" | "en-GH" | "en-GI" | "en-GM" | "en-GU" | "en-GY" | "en-HK" | "en-IE" | "en-IL" | "en-IM" | "en-IN" | "en-IO" | "en-JE" | "en-JM" | "en-KE" | "en-KI" | "en-KN" | "en-KY" | "en-LC" | "en-LR" | "en-LS" | "en-MG" | "en-MH" | "en-MO" | "en-MP" | "en-MS" | "en-MT" | "en-MU" | "en-MW" | "en-MY" | "en-NA" | "en-NF" | "en-NG" | "en-NL" | "en-NR" | "en-NU" | "en-NZ" | "en-PG" | "en-PH" | "en-PK" | "en-PN" | "en-PR" | "en-PW" | "en-RW" | "en-SB" | "en-SC" | "en-SD" | "en-SE" | "en-SG" | "en-SH" | "en-SI" | "en-SL" | "en-SS" | "en-SX" | "en-SZ" | "en-TC" | "en-TK" | "en-TO" | "en-TT" | "en-TV" | "en-TZ" | "en-UG" | "en-UM" | "en-US-POSIX" | "en-VC" | "en-VG" | "en-VI" | "en-VU" | "en-WS" | "en-ZA" | "en-ZM" | "en-ZW" | "es" | "es-419" | "es-AR" | "es-BO" | "es-BR" | "es-BZ" | "es-CL" | "es-CO" | "es-CR" | "es-CU" | "es-DO" | "es-EA" | "es-EC" | "es-GQ" | "es-GT" | "es-HN" | "es-IC" | "es-MX" | "es-NI" | "es-PA" | "es-PE" | "es-PH" | "es-PR" | "es-PY" | "es-SV" | "es-US" | "es-UY" | "es-VE" | "et" | "eu" | "fa" | "fa-AF" | "fi" | "fil" | "fr" | "fr-BE" | "fr-BF" | "fr-BI" | "fr-BJ" | "fr-BL" | "fr-CA" | "fr-CD" | "fr-CF" | "fr-CG" | "fr-CH" | "fr-CI" | "fr-CM" | "fr-DJ" | "fr-DZ" | "fr-GA" | "fr-GF" | "fr-GN" | "fr-GP" | "fr-GQ" | "fr-HT" | "fr-KM" | "fr-LU" | "fr-MA" | "fr-MC" | "fr-MF" | "fr-MG" | "fr-ML" | "fr-MQ" | "fr-MR" | "fr-MU" | "fr-NC" | "fr-NE" | "fr-PF" | "fr-PM" | "fr-RE" | "fr-RW" | "fr-SC" | "fr-SN" | "fr-SY" | "fr-TD" | "fr-TG" | "fr-TN" | "fr-VU" | "fr-WF" | "fr-YT" | "ga" | "ga-GB" | "gl" | "gu" | "he" | "hi" | "hr" | "hr-BA" | "hu" | "hy" | "id" | "is" | "it" | "it-CH" | "it-SM" | "it-VA" | "ja" | "jv" | "ka" | "kk" | "km" | "kn" | "ko" | "ko-KP" | "ky" | "lo" | "lt" | "lv" | "mk" | "ml" | "mn" | "mr" | "ms" | "ms-BN" | "ms-ID" | "ms-SG" | "my" | "nb" | "nb-SJ" | "ne" | "ne-IN" | "nl" | "nl-AW" | "nl-BE" | "nl-BQ" | "nl-CW" | "nl-SR" | "nl-SX" | "nn" | "no" | "or" | "pa" | "pa-Guru" | "pl" | "ps" | "ps-PK" | "pt" | "pt-AO" | "pt-CH" | "pt-CV" | "pt-GQ" | "pt-GW" | "pt-LU" | "pt-MO" | "pt-MZ" | "pt-PT" | "pt-ST" | "pt-TL" | "ro" | "ro-MD" | "root" | "ru" | "ru-BY" | "ru-KG" | "ru-KZ" | "ru-MD" | "ru-UA" | "sd" | "sd-Arab" | "si" | "sk" | "sl" | "so" | "so-DJ" | "so-ET" | "so-KE" | "sq" | "sq-MK" | "sq-XK" | "sr" | "sr-Cyrl" | "sr-Cyrl-BA" | "sr-Cyrl-ME" | "sr-Cyrl-XK" | "sr-Latn" | "sr-Latn-BA" | "sr-Latn-ME" | "sr-Latn-XK" | "sv" | "sv-AX" | "sv-FI" | "sw" | "sw-CD" | "sw-KE" | "sw-UG" | "ta" | "ta-LK" | "ta-MY" | "ta-SG" | "te" | "th" | "tk" | "tr" | "tr-CY" | "uk" | "ur" | "ur-IN" | "uz" | "uz-Latn" | "vi" | "yue" | "yue-Hant" | "zh" | "zh-Hans" | "zh-Hans-HK" | "zh-Hans-MO" | "zh-Hans-SG" | "zh-Hant" | "zh-Hant-HK" | "zh-Hant-MO" | "zu"

export interface UserPreferences {
	/**
	 * Whether to show time in 12 or 24 hour format.
	 */
	timeDisplay: TimeDisplayPreference;
	/**
	 * Imperial or Si, so miles or kilometres (`"mi"` or `"km"`)
	 */
	distanceUnit: DistanceUnitPreference;
	/**
	 * The precision used to display distance units
	 */
	distanceUnitPrecision: DistancePrecisionPreference;
	/**
	 * The locale used for formatting. Note that this is currently set as the Unicode
	 * organisation's BCP 47 scheme of language tags, using the "modern" set.
	 *
	 * Taken from https://github.com/unicode-org/cldr-json/blob/master/cldr-json/cldr-core/availableLocales.json
	 */
	locale: LocalePreference;
}

export interface ApplicationConfiguration {
	/**
	 * A distance (in metres) that represents the distance travelled will trigger
	 * creation of a new block. By default this will be 160934, _ie_ one mile in metres
	 */
	distanceUntilScored: number;
}

/**
 * Literal type for key under which user preferences are persisted.
 */
export type UserPreferencesStorageKey = "@user_preferences";

/**
 * Interface for storage of user preferences. Used as a facade for an underlying API, either
 * localStorage in a web context or AsyncStorage in a native context.
 */
export interface UserPreferencesStorage {
	getPreferences(): Promise<UserPreferences>;
	getPreference<P extends keyof UserPreferences>(key: P): Promise<UserPreferences[P]>;
	setPreference<P extends keyof UserPreferences>(key: P, value: UserPreferences[P]): Promise<void>;

	// clearPreferences(): Promise<null>;
}
