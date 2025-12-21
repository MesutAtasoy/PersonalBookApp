import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, OnDestroy } from '@angular/core';
import {CommonModule, DatePipe} from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';

// PrimeNG Imports
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SkeletonModule } from 'primeng/skeleton';
import { PaginatorModule } from 'primeng/paginator';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { DividerModule } from 'primeng/divider';
import { MenuModule } from 'primeng/menu';
import {Confirmation, ConfirmationService, MenuItem, MessageService} from 'primeng/api';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select'; // PrimeNG 18+ Select component

// Internal Types
import { SearchFilter } from "@/core/pagination/personal-book.pagination";
import { AcademyService } from "@/apps/academy/academy.service";
import {ConfirmDialog} from "primeng/confirmdialog";
import {Toast} from "primeng/toast";
import {FinanceBank} from "@/apps/finance/finance.types";

export interface Course {
    id: string;
    title: string;
    description: string;
    catalog: string | null;
    duration: number;
}

export interface Category {
    id: string;
    title: string;
    color: string;
}

@Component({
    selector: 'app-academy-list',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        CardModule,
        ButtonModule,
        InputTextModule,
        SkeletonModule,
        PaginatorModule,
        IconFieldModule,
        InputIconModule,
        DividerModule,
        MenuModule,
        DialogModule,
        InputNumberModule,
        TextareaModule,
        SelectModule,
        ConfirmDialog,
        Toast
    ],
    template: `
        <p-toast></p-toast>
        <p-confirmDialog [style]="{width: '50vw'}" [baseZIndex]="1000"></p-confirmDialog>
        <div class="min-h-screen">
            <div class="bg-[#1a2332] text-white py-12 px-4 text-center">
                <p class="text-xs font-bold uppercase tracking-widest mb-2 opacity-80">Personal Book ACADEMY</p>
                <h1 class="text-4xl md:text-5xl font-bold mb-4">What do you want to learn today?</h1>
                <p class="text-lg opacity-70">Our courses will improve yourself technical skills and soft skills.</p>
            </div>

            <div class="px-4 -mt-8">
                <div class="flex flex-col md:flex-row justify-between items-center gap-4 mb-12">
                    <div class="flex gap-2">
                        <button pButton label="Categories" icon="pi pi-th-large" class="p-button-secondary shadow-lg h-full" (click)="goToCategories()"></button>
                        <button pButton label="Add New Course" icon="pi pi-plus"
                                class="p-button-primary shadow-lg h-full"
                                (click)="openAddDialog()">
                        </button>
                    </div>

                    <p-iconField iconPosition="left" class="w-full max-w-md shadow-lg rounded-lg">
                        <p-inputIcon class="pi pi-search text-slate-400"></p-inputIcon>
                        <input type="text" pInputText placeholder="Search by title or description" class="w-full border-none py-3 px-10 rounded-lg text-slate-600"
                               [(ngModel)]="searchQuery" (ngModelChange)="onSearchChange($event)" />
                    </p-iconField>
                    <div class="hidden md:block w-32"></div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-12">
                    <ng-container *ngIf="loading">
                        <div *ngFor="let i of [1,2,3,4,5,6]" class="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
                            <p-skeleton width="4rem" height="1rem" styleClass="mb-6"></p-skeleton>
                            <p-skeleton width="60%" height="1.5rem" styleClass="mb-2"></p-skeleton>
                            <p-skeleton width="80%" height="1rem" styleClass="mb-4"></p-skeleton>
                            <p-divider></p-divider>
                            <p-skeleton width="100px" height="1.2rem" styleClass="mt-6"></p-skeleton>
                        </div>
                    </ng-container>

                    <ng-container *ngIf="!loading">
                        <div *ngFor="let course of courses" class="group h-full">
                            <div class="bg-white rounded-xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-all duration-300 h-full flex flex-col relative overflow-hidden">

                                <div class="absolute top-0 left-0 w-full h-1"
                                     [style.background-color]="getCatalog(course.catalog)?.color || '#cbd5e1'">
                                </div>

                                <div class="flex justify-between items-center mb-6 pt-2">
                                    <span class="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
                                          [style.background-color]="(getCatalog(course.catalog)?.color || '#64748b') + '20'"
                                          [style.color]="getCatalog(course.catalog)?.color || '#64748b'">
                                        {{ getCatalog(course.catalog)?.title || 'Other' }}
                                    </span>

                                    <button pButton icon="pi pi-ellipsis-v"
                                            class="p-button-text p-button-secondary p-button-rounded h-8 w-8"
                                            (click)="selectedCourse = course; menu.toggle($event)">
                                    </button>
                                </div>

                                <div class="flex-grow mb-6">
                                    <h3 class="text-xl font-bold text-slate-800 mb-2 group-hover:text-blue-600 transition-colors">{{ course.title }}</h3>
                                    <p class="text-slate-500 text-sm leading-relaxed line-clamp-3">{{ course.description }}</p>
                                </div>

                                <p-divider styleClass="my-4"></p-divider>

                                <div class="flex justify-between items-center mt-2">
                                    <div class="flex items-center gap-6 text-slate-400">
                                        <div class="flex items-center gap-2">
                                            <i class="pi pi-clock"></i>
                                            <span class="text-sm font-medium">{{ course.duration }} minutes</span>
                                        </div>
                                    </div>
                                    <button pButton icon="pi pi-arrow-right"
                                            class="p-button-rounded p-button-outlined p-button-secondary h-10 w-10 border-slate-200 hover:bg-slate-50"
                                            (click)="goToCourse(course.id)">
                                    </button>
                                </div>
                            </div>
                        </div>
                    </ng-container>
                </div>

                <div class="flex justify-end pb-12">
                    <p-paginator [rows]="rows" [totalRecords]="totalRecords" [rowsPerPageOptions]="[9, 18, 27]" (onPageChange)="onPageChange($event)"></p-paginator>
                </div>
            </div>
        </div>

        <p-dialog [header]="isEditMode ? 'Edit Course' : 'Add New Course'"
                  [(visible)]="showAddCourseDialog"
                  [modal]="true"
                  [style]="{width: '500px'}">

            <ng-template pTemplate="content">
                <div class="flex flex-col gap-4 py-2">
                    <div class="field">
                        <label class="font-bold block mb-2 block">Course Title</label>
                        <input type="text" pInputText [(ngModel)]="newCourse.title" class="w-full" placeholder="Enter course title" />
                    </div>

                    <div class="field">
                        <label class="font-bold block mb-2  block">Category</label>
                        <p-select
                            [options]="categories"
                            [(ngModel)]="newCourse.catalog"
                            optionLabel="title"
                            optionValue="id"
                            placeholder="Select a Category"
                            class="w-full"
                            appendTo="body">
                        </p-select>
                    </div>

                    <div class="field">
                        <label class="font-bold block mb-2  block">Description</label>
                        <textarea pTextarea [(ngModel)]="newCourse.description" class="w-full" rows="4" placeholder="Briefly describe the course content"></textarea>
                    </div>

                    <div class="field">
                        <label class="font-bold block mb-2  block">Duration (minutes)</label>
                        <p-inputNumber class="w-full" [(ngModel)]="newCourse.duration" [showButtons]="true" suffix=" mins" [min]="1"></p-inputNumber>
                    </div>
                </div>
            </ng-template>

            <ng-template pTemplate="footer">
                <button pButton label="Discard" icon="pi pi-times"
                        class="p-button-text" (click)="showAddCourseDialog = false">
                </button>
                <button pButton [label]="isEditMode ? 'Update Course' : 'Create Course'"
                        icon="pi pi-check" class="p-button-primary"
                        (click)="saveCourse()">
                </button>
            </ng-template>
        </p-dialog>

        <p-menu #menu [model]="actionItems" [popup]="true" appendTo="body"></p-menu>
    `,
    styles: [`
        :host ::ng-deep {
            .p-dialog-content { padding-top: 0 !important; }
            .p-select { width: 100%; }
        }
    `],
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [MessageService, DatePipe, ConfirmationService],
})
export class AcademyListComponent implements OnInit, OnDestroy {
    courses: Course[] = [];
    categories: Category[] = [];
    totalRecords: number = 0;
    loading: boolean = true;
    selectedCourse: Course | null = null;

    // Search & Pagination
    rows: number = 9;
    first: number = 0;
    searchQuery: string = '';

    // Dialog State
    showAddCourseDialog: boolean = false;
    newCourse: Partial<Course> = {
        title: '',
        description: '',
        duration: 0,
        catalog: null
    };

    private destroy$ = new Subject<void>();
    private searchSubject = new Subject<string>();

    isEditMode: boolean = false;

    actionItems: MenuItem[] = [
        {
            label: 'View Details',
            icon: 'pi pi-eye',
            command: () => this.goToCourse(this.selectedCourse?.id!)
        },
        {
            label: 'Edit Course',
            icon: 'pi pi-pencil',
            command: () => this.openEditDialog(this.selectedCourse) // Added this
        },
        {
            label: 'Delete',
            icon: 'pi pi-trash',
            styleClass: 'text-red-500',
            command: () => this.delete(this.selectedCourse)
        }
    ];

    constructor(
        private academyService: AcademyService,
        private cdr: ChangeDetectorRef,
        private router: Router,
        private confirmationService : ConfirmationService,
        private messageService: MessageService
    ) {}

    ngOnInit(): void {
        this.initSearchDebounce();
        this.loadCategories();
        this.loadCourses();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    private initSearchDebounce(): void {
        this.searchSubject.pipe(
            debounceTime(400),
            distinctUntilChanged(),
            takeUntil(this.destroy$)
        ).subscribe(() => {
            this.first = 0;
            this.loadCourses();
        });
    }

    loadCategories(): void {
        this.academyService.getCategories()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (res: any) => {
                    // response.payload is handled by tap in service,
                    // but we can also use the returned value here.
                    this.categories = res.payload || res;
                    this.cdr.markForCheck();
                }
            });
    }

    loadCourses(): void {
        this.loading = true;
        this.cdr.markForCheck();

        const filter: SearchFilter = {
            search: { value: this.searchQuery },
            paginationFilter: {
                pageNumber: Math.floor(this.first / this.rows) + 1,
                pageSize: this.rows
            }
        };

        this.academyService.searchCourses(filter)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (response: any) => {
                    this.courses = response.payload.data || [];
                    this.totalRecords = response.payload.totalRecords || 0;
                    this.loading = false;
                    this.cdr.markForCheck();
                },
                error: () => {
                    this.loading = false;
                    this.cdr.markForCheck();
                }
            });
    }

    onSearchChange(query: string): void {
        this.searchSubject.next(query);
    }

    onPageChange(event: any): void {
        this.first = event.first;
        this.rows = event.rows;
        this.loadCourses();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    saveCourse(): void {
        if (!this.newCourse.title || !this.newCourse.catalog) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Validation Error',
                detail: 'Please fill in the title and category.'
            });
            return;
        }

        this.loading = true;
        this.cdr.markForCheck();

        // Logic Switch: Update vs Create
        const request$ = this.isEditMode
            ? this.academyService.updateCourse(this.newCourse.id!, this.newCourse as Course)
            : this.academyService.addCourse(this.newCourse as Course);

        request$.pipe(takeUntil(this.destroy$)).subscribe({
            next: (response) => {
                this.messageService.add({
                    severity: 'success',
                    summary: this.isEditMode ? 'Course Updated' : 'Course Created',
                    detail: `${this.newCourse.title} has been saved successfully.`
                });

                this.showAddCourseDialog = false;
                this.loadCourses(); // Refresh the list
            },
            error: (err) => {
                this.loading = false;
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Operation failed. Please try again.'
                });
                this.cdr.markForCheck();
            }
        });
    }

    private resetNewCourseForm(): void {
        this.newCourse = {
            title: '',
            description: '',
            duration: 0,
            catalog: null
        };
    }

    goToCourse(courseId: string): void { this.router.navigate(['apps/academy/courses', courseId]); }


    goToCategories(): void { this.router.navigate(['apps/academy/categories']); }

    delete(course: Course | null) {
        this.confirmationService.confirm({
            message: `Are you sure you want to delete the course whose name is ${course?.title}?`,
            header: 'Confirm course',
            icon: 'pi pi-exclamation-triangle',
            acceptButtonStyleClass: 'p-button-danger',
            rejectButtonStyleClass: 'p-button-text',
            accept: () => {
                this.deleteCourse(course);
            },
            reject: () => {
                this.messageService.add({severity: 'info', summary: 'Cancelled', detail: 'Deletion cancelled'});
            }
        } as Confirmation);
    }

    deleteCourse(financeBank: Course | null){
        this.academyService.deleteCourse(financeBank?.id ?? "")
            .subscribe({
                next: () => {
                    this.messageService.add({severity: 'success', summary: 'Deleted', detail: `The course has been successfully deleted.`});
                    this.loadCourses();

                },
                error: (err) => {
                    console.error('Deletion failed:', err);
                    this.messageService.add({severity: 'error', summary: 'Error', detail: `Failed to delete course.`});
                }
            });
    }

    getCatalog(id : any){
        return this.categories.find(x=>x.id == id);
    }

    // Method to open dialog in Edit mode
    openEditDialog(course: Course | null): void {
        if (!course) return;

        this.isEditMode = true;
        // Clone the object so changes in the dialog don't reflect in the list immediately
        this.newCourse = { ...course };
        this.showAddCourseDialog = true;
    }

    openAddDialog(): void {
        this.isEditMode = false;
        this.resetNewCourseForm();
        this.showAddCourseDialog = true;
    }
}
