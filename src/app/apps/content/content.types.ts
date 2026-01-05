export interface ContentProfile {
    id: string;
    key: string;
    name: string;
    enabled: boolean;
    schedule: string;
    topics: string[];
    keywords: string[];
    notificationSettings: ContentProfileNotificationSettings;
    ai: AISettings;
    createdDate?: string;
    modifiedDate?: string;
}


export interface AISettings {
    enabled: boolean;
    model: string;
    key: string;
    role: string;
}

export interface ContentProfileNotificationSettings{
    phoneNotification : boolean
    emailNotification : boolean
}

export interface ContentSource {
    id: string; // Guid -> string
    profileKey: string;
    name: string;
    type: string;
    endpoint: string;
    topic: string;
    enabled: boolean;
    settings: Record<string, any>; // Dictionary<string, object>
    createdDate: string; // DateTime -> ISO string
    modifiedDate?: string | null; // DateTime?
    isDeleted: boolean;
}

export interface ProcessedContent {
    id: string; // Guid
    profileKey: string;
    sourceId: string; // Guid
    sourceName: string;
    topic: string;
    externalId: string;
    title: string;
    content: string;
    summary: string;
    url: string;

    score: number;
    runId: string; // Guid

    publishedAt: string; // DateTime (ISO)

    tags: readonly string[];

    processedBy: ProcessedByInfo;

    processedAt: string; // DateTime
    createdDate: string; // DateTime
}

export interface ProcessedByInfo {
    aiUsed: boolean;
    model: string;
}

export interface ContentLog {
    id: string;          // Guid
    runId: string;       // Guid
    profileKey?: string; // nullable
    sourceName?: string; // nullable
    message?: string;    // nullable
    severity?: string;   // nullable
    createdDate: string; // DateTime (ISO)
}

export interface ContentDigestBlob {
    id: string;               // Guid
    contentDigestId: string;  // Guid
    title: string;
    profileKey: string;
    content: string;
    type: string;             // "markdown" | "html" | custom
}

export interface ContentDigest {
    id: string;              // Guid
    profileKey: string;
    title: string;
    digestDate: string;      // DateTime (ISO)
    stats?: DigestStats;     // FinalizeDigest sonrası set ediliyor
    createdDate: string;     // DateTime (ISO)
}

export interface DigestStats {
    totalFetched: number;
    totalScored: number;
    includedCount: number;
    rejectedCount: number;
    averageRelevanceScore: number;
    categoryBreakdown: Record<string, number>;
}


export interface ContentDigestItem {
    id: string;
    contentId: string;       // Guid
    contentDigestId : string;
    title: string;
    url: string;
    topic: string;
    relevanceScore: number;
    quality: string;
    included: boolean;
    decisionReason: string;
    summary: string;
    sourceId: string;
    sourceName : string;
}

