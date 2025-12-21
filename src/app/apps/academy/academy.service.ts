import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {BehaviorSubject, Observable, of, throwError} from 'rxjs';
import {map, switchMap, take, tap} from 'rxjs/operators';
import {PersonalBookApiHttpClient} from "@/core/http/personal-book-api.http";
import {Category, Course, CourseStep} from "@/apps/academy/academy.types";
import {CareerUtils} from "@/core/utils/career.utils";
import {SearchFilter} from "@/core/pagination/personal-book.pagination";

@Injectable({
    providedIn: 'root'
})
export class AcademyService {
    // Private
    private _categories: BehaviorSubject<Category[] | null> = new BehaviorSubject<Category[] | null>(null);
    private _course: BehaviorSubject<Course | null> = new BehaviorSubject<Course | null>(null);
    private _courses: BehaviorSubject<Course[] | null> = new BehaviorSubject<Course[] | null>(null);
    private _coursePagination: BehaviorSubject<any | null> = new BehaviorSubject<any | null>(null);
    private _drawerOpen: BehaviorSubject<boolean | false>;

    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient, private _apiClient: PersonalBookApiHttpClient) {
        this._drawerOpen = new BehaviorSubject(false);
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Getter for categories
     */
    get categories$(): Observable<Category[] | null> {
        return this._categories.asObservable();
    }

    /**
     * Getter for courses
     */
    get courses$(): Observable<any> {
        return this._courses.asObservable();
    }

    get coursePagination$(): Observable<any> {
        return this._coursePagination.asObservable();
    }

    /**
     * Getter for course
     */
    get course$(): Observable<any> {
        return this._course.asObservable();
    }


    get drawerOpen$(): Observable<any> {
        return this._drawerOpen.asObservable();
    }


    setDrawerOpen(isOpen: boolean) {
        this._drawerOpen.next(isOpen);
    }


    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get categories
     */
    getCategories(): Observable<Category[]> {
        return this._apiClient.get<Category[]>('api/apps/academy/categories').pipe(
            tap((response: any) => {
                this._categories.next(response.payload);
            })
        );
    }

    addCategory(category: Category): Observable<Category> {
        category.id = CareerUtils.guid();

        return this.categories$.pipe(
            take(1),
            switchMap(categories => this._apiClient.post<Category>('api/apps/academy/categories', category).pipe(
                map((response: any) => {

                    // Add the calendar
                    categories?.push(response.payload);

                    // Update the calendars
                    this._categories.next(categories);

                    // Return the added calendar
                    return response.payload;
                })
            ))
        );
    }

    updateCategory(id: string, category: Category): Observable<Category> {
        return this.categories$.pipe(
            take(1),
            switchMap(categories => this._apiClient.put<Category>('api/apps/academy/categories/' + id, category).pipe(
                map((updatedCalendar: any) => {

                    // Find the index of the updated calendar
                    const index = categories!.findIndex(item => item.id === id);

                    // Update the calendar
                    categories![index] = updatedCalendar.payload;

                    // Update the calendars
                    this._categories.next(categories);

                    // Return the updated calendar
                    return updatedCalendar.payload;
                })
            ))
        );
    }

    deleteCategory(id: string): Observable<any> {
        return this.categories$.pipe(
            take(1),
            switchMap(calendars => this._apiClient.delete<Category>('api/apps/academy/categories/' + id).pipe(
                map((isDeleted) => {

                    // Find the index of the deleted calendar
                    const index = calendars!.findIndex(item => item.id === id);

                    // Delete the calendar
                    calendars!.splice(index, 1);

                    // Update the calendars
                    this._categories.next(calendars);


                    // Return the deleted status
                    return isDeleted;
                })
            ))
        );
    }

    addCourse(course: Course): Observable<Course> {
        course.id = CareerUtils.guid();
        return this._apiClient.post<Course>('api/apps/academy/courses', course);
    }

    updateCourse(id: string, course: Course): Observable<Course> {
        return this._apiClient.put<Course>('api/apps/academy/courses/' + id, course);
    }

    deleteCourse(id: string): Observable<any> {
        return  this._apiClient.delete<Course>('api/apps/academy/courses/' + id);
    }


    searchCourses(searchFilter: SearchFilter): Observable<Course[]> {
        return this._apiClient.post<Course[]>('api/apps/academy/courses/search', searchFilter);
    }

    /**
     * Get course by id
     */
    getCourseById(id: string): Observable<Course> {
        return this._apiClient.get<Course>('api/apps/academy/courses/' + id).pipe(
            map((course: any) => {

                // Update the course
                this._course.next(course.payload);

                // Return the course
                return course;
            }),
            switchMap((course) => {

                if (!course) {
                    return throwError('Could not found course with id of ' + id + '!');
                }

                return of(course);
            })
        );
    }

    addCourseStep(step: CourseStep): Observable<Course> {
        step.id = CareerUtils.guid();
        return this._apiClient.post<Course>('api/apps/academy/steps', step);
    }

    updateCourseStep(id: string, step: Course): Observable<Course> {
        return this._apiClient.put<Course>('api/apps/academy/steps/' + id, step);
    }

    deleteCourseStep(id: string): Observable<Course> {
        return this._apiClient.delete<Course>('api/apps/academy/steps/' + id);
    }
}
