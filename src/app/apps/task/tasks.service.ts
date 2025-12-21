import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import {PersonalBookApiHttpClient} from "@/core/http/personal-book-api.http";
import { Task } from './task.types';
import {SearchFilter} from "@/core/pagination/personal-book.pagination";
import {CareerUtils} from "@/core/utils/career.utils";

@Injectable({
    providedIn: 'root'
})
export class TasksService {


    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient, private _apiClient: PersonalBookApiHttpClient) {
    }



    searchTasks(searchFilter : SearchFilter): Observable<Task[] | null> {
        return this._apiClient.post<Task[] | null>('api/apps/tasks/search',  searchFilter);
    }

    /**
     * Get task by id
     */
    getTaskById(id: string): Observable<Task> {
        return this._apiClient.get<Task>('api/apps/tasks/' + id);
    }


    /**
    * Create task
    *
    * @param request
    */
    createNewTask(request: any): Observable<any> {
        request.id = CareerUtils.guid();
        return this._apiClient.post<Task>('api/apps/tasks', request);
    }

    /**
     * Update task
     *
     * @param id
     * @param task
     */
    updateTask(id: string, task: any): Observable<Task> {
        return this._apiClient.put<Task>('api/apps/tasks/' + id, task);
    }

    /**
     * Delete the task
     *
     * @param id
     */
    deleteTask(id: string): Observable<boolean> {
        return this._apiClient.delete('api/apps/tasks/' + id);
    }
}
