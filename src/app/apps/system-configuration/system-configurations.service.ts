import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import {SystemConfiguration} from "./system-configurations.types";
import {CareerUtils} from "@/core/utils/career.utils";
import {PersonalBookApiHttpClient} from "@/core/http/personal-book-api.http";
import {SearchFilter} from "@/core/pagination/personal-book.pagination";

@Injectable({
    providedIn: 'root'
})
export class SystemConfigurationService {


    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient, private _apiClient: PersonalBookApiHttpClient) {
    }


    searchSystemConfiguration(searchFilter : SearchFilter): Observable<SystemConfiguration[]> {
        return this._apiClient.post<SystemConfiguration[]>('api/apps/system-configuration/search', searchFilter);
    }

    addSystemConfiguration(systemConfiguration: SystemConfiguration): Observable<SystemConfiguration> {
        systemConfiguration.id = CareerUtils.guid();
        return this._apiClient.post<SystemConfiguration>('api/apps/system-configuration', systemConfiguration);
    }

    updateSystemConfiguration(id: string, systemConfiguration: SystemConfiguration): Observable<SystemConfiguration> {
        return this._apiClient.put<SystemConfiguration>('api/apps/system-configuration/' + id, systemConfiguration);
    }
}
