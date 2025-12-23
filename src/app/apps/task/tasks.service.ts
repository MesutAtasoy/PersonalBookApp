import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import {PersonalBookApiHttpClient} from "@/core/http/personal-book-api.http";
import {Tag, Task} from './task.types';
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

    /**
     * Get tags
     */
    getTags(): Observable<Tag[]> {
        return this._apiClient.get<Tag[]>('api/apps/tasks/tags');
    }

    /**
     * Crate tag
     *
     * @param tag
     */
    createTag(tag: Tag): Observable<Tag> {
        return this._apiClient.post<Tag>('api/apps/tasks/tag', tag);
    }

    /**
     * Update the tag
     *
     * @param id
     * @param tag
     */
    updateTag(id: string, tag: Tag): Observable<Tag> {
        return this._apiClient.put<Tag>('api/apps/tasks/tag/' + id, tag)
    }

    /**
     * Delete the tag
     *
     * @param id
     */
    deleteTag(id: string): Observable<any> {
        return this._apiClient.delete('api/apps/tasks/tag/' + id);
    }

}
