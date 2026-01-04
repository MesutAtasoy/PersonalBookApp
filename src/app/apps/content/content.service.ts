import {HttpClient} from "@angular/common/http";
import {PersonalBookApiHttpClient} from "@/core/http/personal-book-api.http";
import {BehaviorSubject, Observable} from "rxjs";
import {SearchFilter} from "@/core/pagination/personal-book.pagination";
import {
    ContentDigest,
    ContentDigestBlob,
    ContentLog,
    ContentProfile,
    ContentSource
} from "@/apps/content/content.types";
import {Injectable} from "@angular/core";

@Injectable({
    providedIn: 'root'
})
export class PersonalContentService {
    constructor(private _httpClient: HttpClient, private _apiClient: PersonalBookApiHttpClient) {
    }

    searchContentProfiles(searchFilter: SearchFilter): Observable<ContentProfile[]> {
        return this._apiClient.post<ContentProfile[]>('api/apps/content/profiles/search', searchFilter);
    }

    getContentProfile(id: string): Observable<ContentProfile> {
        return this._apiClient.get<ContentProfile>('api/apps/content/profiles/' + id);
    }

    addContentProfile(contentProfile: ContentProfile): Observable<ContentProfile> {
        return this._apiClient.post<ContentProfile>('api/apps/content/profiles', contentProfile);
    }

    updateContentProfile(id: string, contentProfile: ContentProfile): Observable<ContentProfile> {
        return this._apiClient.put<ContentProfile>('api/apps/content/profiles/' + id, contentProfile);
    }

    ingestManuallyContentProfile(id: string): Observable<boolean> {
        return this._apiClient.post<boolean>('api/apps/content/profiles/' + id + '/ingest/manually' , null);
    }

    deleteContentProfile(id: string): Observable<boolean> {
        return this._apiClient.delete<boolean>('api/apps/content/profiles/' + id);
    }

    searchContentSources(searchFilter: SearchFilter): Observable<ContentSource[]> {
        return this._apiClient.post<ContentSource[]>('api/apps/content/sources/search', searchFilter);
    }

    getContentSources(id: string): Observable<ContentSource> {
        return this._apiClient.get<ContentSource>('api/apps/content/sources/' + id);
    }

    addContentSources(contentSource: ContentSource): Observable<ContentSource> {
        return this._apiClient.post<ContentSource>('api/apps/content/sources', contentSource);
    }

    updateContentSources(id: string, contentSource: ContentSource): Observable<ContentSource> {
        return this._apiClient.put<ContentSource>('api/apps/content/sources/' + id, contentSource);
    }

    deleteContentSources(id: string): Observable<boolean> {
        return this._apiClient.delete<boolean>('api/apps/content/sources/' + id);
    }

    searchContentLogs(searchFilter: SearchFilter): Observable<ContentLog[]> {
        return this._apiClient.post<ContentLog[]>('api/apps/content/logs/search', searchFilter);
    }

    searchContentDigest(searchFilter: SearchFilter): Observable<ContentDigest[]> {
        return this._apiClient.post<ContentDigest[]>('api/apps/content/digest/search', searchFilter);
    }

    getContentDigest(id: string): Observable<ContentDigest> {
        return this._apiClient.get<ContentDigest>('api/apps/content/digest/' + id);
    }

    getContentDigestBlob(id: string): Observable<ContentDigestBlob> {
        return this._apiClient.get<ContentDigestBlob>('api/apps/content/digest/' + id + '/blob');
    }

    searchContentDigestItems(searchFilter: SearchFilter): Observable<ContentDigestBlob> {
        return this._apiClient.post<ContentDigestBlob>('api/apps/content/digest/items/search', searchFilter);
    }
}
