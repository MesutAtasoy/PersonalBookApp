import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, ReplaySubject } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { PersonalBookApiHttpClient } from '../http/personal-book-api.http';
import {User} from "@/types/user";

@Injectable({
    providedIn: 'root'
})
export class UserService
{
    private _user: ReplaySubject<User> = new ReplaySubject<User>(1);

    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient,
        private _apiClient : PersonalBookApiHttpClient)
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Setter & getter for user
     *
     * @param value
     */
    set user(value: User)
    {
        // Store the value
        this._user.next(value);
    }

    get user$(): Observable<User>
    {
        return this._user.asObservable();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get the current logged in user data
     */
    get(): Observable<User>
    {
        return this._apiClient.get<User>('api/profile/user-info').pipe(
            tap((userResponse : any) => {
                this._user.next(userResponse.payload);
            })
        );
    }

    /**
     * Update the user
     *
     * @param user
     */
    updateAccount(user: User): Observable<any>
    {
        return this._apiClient.put<User>('api/profile/account', user).pipe(
            map((response : any) => {
                this._user.next(response.payload);
            })
        );
    }

    /**
     * Update the security
     *
     * @param request
     */
     updateSecurity(request: any): Observable<any>
     {
         return this._apiClient.put<User>('api/profile/security', request).pipe(
             map((response : any) => {
                 this._user.next(response.payload);
             })
         );
     }
}
