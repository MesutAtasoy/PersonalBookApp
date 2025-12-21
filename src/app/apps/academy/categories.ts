import {Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, OnDestroy} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {Subject, takeUntil} from 'rxjs';

// PrimeNG
import {TableModule} from 'primeng/table';
import {ButtonModule} from 'primeng/button';
import {InputTextModule} from 'primeng/inputtext';
import {DialogModule} from 'primeng/dialog';
import {SkeletonModule} from 'primeng/skeleton';
import {ToastModule} from 'primeng/toast';
import {ConfirmDialogModule} from 'primeng/confirmdialog';
import {ColorPickerModule} from 'primeng/colorpicker'; // Added this
import {MessageService, ConfirmationService} from 'primeng/api';

import {AcademyService} from "@/apps/academy/academy.service";

export interface Category {
    id?: string;
    title?: string;
    slug?: string;
    color?: string;
}

@Component({
    selector: 'app-academy-categories',
    standalone: true,
    imports: [
        CommonModule, FormsModule, TableModule, ButtonModule,
        InputTextModule, DialogModule, SkeletonModule,
        ToastModule, ConfirmDialogModule, ColorPickerModule // Added ColorPickerModule
    ],
    providers: [MessageService, ConfirmationService],
    template: `
        <div class="p-6 max-w-4xl mx-auto">
            <p-toast></p-toast>
            <p-confirmDialog></p-confirmDialog>

            <div class="flex justify-between items-center mb-6">
                <div>
                    <h1 class="text-2xl font-bold text-slate-800">Academy Categories</h1>
                    <p class="text-slate-500">Manage classification for your courses</p>
                </div>
                <button pButton label="New Category" icon="pi pi-plus"
                        class="p-button-primary shadow-md" (click)="openNew()"></button>
            </div>

            <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <p-table [value]="loading ? skeletonItems : categories" [responsiveLayout]="'scroll'">
                    <ng-template pTemplate="header">
                        <tr>
                            <th class="bg-slate-50 text-slate-600 font-semibold py-4">Category Name</th>
                            <th class="bg-slate-50 text-slate-600 font-semibold py-4 w-32">Color</th>
                            <th class="bg-slate-50 text-slate-600 font-semibold py-4 w-32 text-center">Actions</th>
                        </tr>
                    </ng-template>

                    <ng-template pTemplate="body" let-category>
                        <tr *ngIf="!loading">
                            <td class="py-4 font-medium text-slate-700">{{ category.title }}</td>
                            <td class="py-4">
                                <div class="flex items-center gap-2">
                                    <div [style.background-color]="category.color"
                                         class="w-6 h-6 rounded-md border border-slate-200 shadow-sm"></div>
                                    <span class="text-xs font-mono text-slate-500 uppercase">{{ category.color }}</span>
                                </div>
                            </td>
                            <td class="py-4 text-center">
                                <div class="flex justify-center gap-2">
                                    <button pButton icon="pi pi-pencil"
                                            class="p-button-text p-button-secondary p-button-rounded"
                                            (click)="editCategory(category)"></button>
                                    <button pButton icon="pi pi-trash"
                                            class="p-button-text p-button-danger p-button-rounded"
                                            (click)="deleteCategory(category)"></button>
                                </div>
                            </td>
                        </tr>
                        <tr *ngIf="loading">
                            <td class="py-4"><p-skeleton width="70%" height="1.2rem"></p-skeleton></td>
                            <td class="py-4"><p-skeleton width="40%" height="1.2rem"></p-skeleton></td>
                            <td class="py-4"><p-skeleton width="100%" height="2rem"></p-skeleton></td>
                        </tr>
                    </ng-template>

                    <ng-template pTemplate="emptymessage">
                        <tr *ngIf="!loading">
                            <td colspan="3" class="text-center py-12 text-slate-400">
                                <i class="pi pi-folder-open text-4xl mb-3"></i>
                                <p>No categories found.</p>
                            </td>
                        </tr>
                    </ng-template>
                </p-table>
            </div>
        </div>

        <p-dialog [(visible)]="categoryDialog" [style]="{width: '400px'}"
                  header="Category Details" [modal]="true" class="p-fluid">
            <ng-template pTemplate="content">
                <div class="field mt-2">
                    <label for="name" class="font-bold block mb-2">Title</label>
                    <input type="text" pInputText id="name" [(ngModel)]="category.title"
                           required autofocus placeholder="e.g. Software Engineering"/>
                    <small class="text-red-500" *ngIf="submitted && !category.title">Title is required.</small>
                </div>

                <div class="field mt-4">
                    <label for="color" class="font-bold block mb-2">Theme Color</label>
                    <div class="flex items-center gap-3">
                        <p-colorPicker [(ngModel)]="category.color" appendTo="body"></p-colorPicker>
                        <div class="flex-1">
                            <input type="text" pInputText [(ngModel)]="category.color"
                                   placeholder="#000000" class="font-mono uppercase" maxlength="7"/>
                        </div>
                    </div>
                </div>
            </ng-template>

            <ng-template pTemplate="footer">
                <button pButton label="Cancel" icon="pi pi-times" class="p-button-text" (click)="hideDialog()"></button>
                <button pButton label="Save" icon="pi pi-check" class="p-button-primary"
                        (click)="saveCategory()"></button>
            </ng-template>
        </p-dialog>
    `,
    styles: [`
        :host ::ng-deep .p-datatable .p-datatable-tbody > tr > td {
            border-bottom: 1px solid #f1f5f9;
        }
        :host ::ng-deep .p-colorpicker-preview {
            width: 38px !important;
            height: 38px !important;
            border-radius: 6px;
        }
    `],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AcademyCategoriesComponent implements OnInit, OnDestroy {
    // ... logic remains same, but add a default color to openNew

    categories: Category[] = [];
    category: Category = {};
    skeletonItems = Array(5).fill({});
    loading: boolean = true;
    categoryDialog: boolean = false;
    submitted: boolean = false;
    private destroy$ = new Subject<void>();

    constructor(
        private academyService: AcademyService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private cdr: ChangeDetectorRef
    ) {}

    ngOnInit(): void { this.loadCategories(); }
    ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }

    loadCategories(): void {
        this.loading = true;
        this.academyService.getCategories()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (res: any) => {
                    this.categories = res.payload || res;
                    this.loading = false;
                    this.cdr.markForCheck();
                },
                error: () => { this.loading = false; this.cdr.markForCheck(); }
            });
    }

    openNew() {
        // Set a default color like Tailwind Blue 500
        this.category = { title: '', color: '#3b82f6' };
        this.submitted = false;
        this.categoryDialog = true;
    }

    editCategory(category: Category) {
        this.category = {...category};
        this.categoryDialog = true;
    }

    deleteCategory(category: Category) {
        this.confirmationService.confirm({
            message: `Are you sure you want to delete ${category.title}?`,
            header: 'Confirm Delete',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Delete',
            acceptButtonStyleClass: 'p-button-danger',
            accept: () => {
                this.academyService.deleteCategory(category.id ?? "").subscribe(() => {
                    this.messageService.add({severity: 'success', summary: 'Successful', detail: 'Category Deleted', life: 3000});
                    this.loadCategories();
                });
            }
        });
    }

    hideDialog() { this.categoryDialog = false; this.submitted = false; }

    saveCategory() {
        this.submitted = true;
        if (this.category.title?.trim()) {
            // Ensure color has # prefix if manually typed
            if (this.category.color && !this.category.color.startsWith('#')) {
                this.category.color = '#' + this.category.color;
            }

            if (this.category.id) {
                this.academyService.updateCategory(this.category.id ?? "", this.category as Category).subscribe(() => {
                    this.messageService.add({severity: 'success', summary: 'Updated', detail: 'Category Updated'});
                    this.categoryDialog = false;
                    this.loadCategories();
                });
            } else {
                this.academyService.addCategory(this.category as Category).subscribe(() => {
                    this.messageService.add({severity: 'success', summary: 'Created', detail: 'Category Created'});
                    this.categoryDialog = false;
                    this.loadCategories();
                });
            }
        }
    }
}
