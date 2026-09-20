/** Shared entity + manifest types for the UnoAnalyzer CLI. */

export interface UserProfile {
  uid: string;
  email: string;
  fullName?: string;
  role: string;
  isVerified?: boolean;
  isModuleLeader?: boolean;
  isCourseStaff?: boolean;
  language?: string;
  studentOnboardingCompleted?: boolean;
  facultyOnboardingCompleted?: boolean;
  [k: string]: unknown;
}

/** Persisted, long-lived session. `login once` relies on the refresh token. */
export interface Session {
  accessToken: string;
  refreshToken: string;
  /** Epoch milliseconds when the access token expires. */
  expiresAt: number;
  user: UserProfile;
  savedAt: string;
}

/** Result of the Supabase password / refresh_token grant. */
export interface TokenGrant {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

// ---------------------------------------------------------------------------
// Endpoint manifest (drives dynamic commands + the agent skill)
// ---------------------------------------------------------------------------

export interface EndpointParam {
  /** Path/query parameter name, e.g. "courseId". */
  name: string;
  in: "path" | "query";
  required: boolean;
}

export interface Endpoint {
  /** Stable id, e.g. "courses.detail" or an auto slug like "get_courses__id". */
  id: string;
  method: string; // GET | POST | PUT | PATCH | DELETE
  /** Path template with :params, e.g. /api/cn/courses/:id/groups */
  path: string;
  /** Source chunk it was discovered in, used for grouping. */
  category: string;
  params: EndpointParam[];
  /** true when the request sends multipart/form-data (file upload). */
  multipart?: boolean;
  /** Short human description (curated when known). */
  description?: string;
  /** How this entry was produced. */
  source: "curated" | "discovered";
}

export interface Manifest {
  /** ISO timestamp of the last successful sync. */
  syncedAt: string;
  /** Hash of the SPA entry bundle we discovered from (staleness signal). */
  bundleHash: string;
  /** The app URL discovery ran against. */
  appUrl: string;
  /** Discovered platform config snapshot. */
  platform: {
    backendUrl: string;
    supabaseUrl: string;
    supabasePublishableKey: string;
    apiPrefixes: string[];
  };
  /** All SPA route paths (useful reference for the agent skill). */
  routes: string[];
  endpoints: Endpoint[];
}
