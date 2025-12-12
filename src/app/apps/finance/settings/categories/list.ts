import {CommonModule} from '@angular/common';
import {ChangeDetectorRef, Component, OnInit, ViewChild} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {ButtonModule} from 'primeng/button';
import {InputTextModule} from 'primeng/inputtext';
import {DialogModule} from 'primeng/dialog';
import {Table, TableModule} from 'primeng/table';
import {SkeletonModule} from 'primeng/skeleton';
import {ToastModule} from 'primeng/toast';
// Use the correct PrimeNG LazyLoadEvent type (which is imported from 'primeng/api')
import {MessageService, ConfirmationService, LazyLoadEvent, MenuItem} from 'primeng/api';
import {ConfirmDialogModule} from 'primeng/confirmdialog';
import {ColorPickerModule} from 'primeng/colorpicker';
import {SelectModule} from 'primeng/select';
import {RippleModule} from 'primeng/ripple';
import {PersonalFinanceService} from "@/apps/finance/finance.service";
import {FinanceBank, FinanceCategory, FinanceTransaction} from "@/apps/finance/finance.types";
// Assuming the path is correct and models are structured like this:
import {OrderParameter, PaginationFilter, SearchFilter} from "@/core/pagination/personal-book.pagination";
import {Menu} from "primeng/menu";


interface Column {
    field: keyof FinanceCategory | 'actions'; // Use interface keys
    header: string;
    pipe?: 'currency' | 'date' | 'type' | 'category';
}

@Component({
    selector: 'app-finance-categories',
    standalone: true,
    providers: [MessageService, ConfirmationService],
    imports: [
        CommonModule, FormsModule, TableModule, ButtonModule, InputTextModule,
        DialogModule, SkeletonModule, ToastModule, ConfirmDialogModule,
        ColorPickerModule, SelectModule, RippleModule, Menu
    ],
    template: `
        <div class="card p-4">
            <p-toast></p-toast>
            <p-confirmDialog></p-confirmDialog>

            <h2 class="text-2xl font-semibold mb-4">📚 Category Management</h2>

            <div class="flex flex-column md:flex-row justify-end align-items-center mb-4 gap-3">

                <div class="p-inputgroup w-full md:w-30rem">
                    <input
                        type="text"
                        pInputText
                        placeholder="Search Categories..."
                        [(ngModel)]="searchQuery"
                        (ngModelChange)="onSearchChange()">

                    <button type="button" pButton icon="pi pi-search" (click)="loadCategories()"></button>
                </div>

                <!-- Action Buttons: Add Transaction, Filter, and Column Customization -->
                <div class="flex justify-end items-center gap-3 w-full">
                    <!-- NEW: Add Transaction Button -->
                    <div class="flex items-center gap-1">
                        <button pButton
                                icon="pi pi-plus"
                                label="Add Category"
                                class="p-button-primary p-button-sm"
                                (click)="openCreateDialog()">
                        </button>
                    </div>
                </div>
            </div>

            <p-table
                [value]="loading ? skeletonData : allCategories"
                [scrollable]="true"
                scrollHeight="1000px"
                [paginator]="true"
                [rows]="rows"
                [totalRecords]="totalRecords"
                [lazy]="true"
                (onLazyLoad)="onLazyLoad($event)">

                <ng-template pTemplate="header">
                    <tr>
                        <th *ngFor="let col of selectedColumns" [pSortableColumn]="col.field">
                            {{ col.header }}
                            <p-sortIcon [field]="col.field"></p-sortIcon>
                        </th>
                    </tr>
                </ng-template>

                <ng-template pTemplate="body" let-category>
                    <tr *ngIf="loading">
                        <td *ngFor="let col of selectedColumns">
                            <p-skeleton></p-skeleton>
                        </td>
                    </tr>
                    <tr *ngIf="!loading">
                        <td *ngFor="let col of selectedColumns">
                            <ng-container [ngSwitch]="col.field">


                                <span *ngSwitchCase="'name'">
                                    {{ category.name  }}
                                </span>

                                <span *ngSwitchCase="'slug'">
                                    {{ category.slug  }}
                                </span>

                                <span *ngSwitchCase="'icon'">
                                    {{ category.icon  }}
                                </span>

                                <span *ngSwitchCase="'color'">
                                    {{ category.color  }}
                                </span>

                                <span *ngSwitchCase="'actions'">
                                        <button pButton icon="pi pi-ellipsis-v" class="p-button-text p-button-rounded" (click)="setMenuTarget(category); menu.toggle($event)"></button>

                                </span>

                            </ng-container>
                        </td>
                    </tr>
                </ng-template>

                <p-menu #menu [model]="menuItems" [popup]="true" appendTo="body"></p-menu>

                <ng-template pTemplate="emptymessage" *ngIf="!loading">
                    <tr>
                        <td [attr.colspan]="selectedColumns.length" class="text-center p-4">
                            No transactions found for the current criteria.
                        </td>
                    </tr>
                </ng-template>

            </p-table>

            <p-dialog
                header="{{ isEdit ? 'Edit Category' : 'Create New Category' }}"
                [(visible)]="showCategoryDialog"
                [modal]="true"
                [style]="{ width: '450px' }">

                <form #categoryForm="ngForm" class="p-fluid">
                    <div class="field mb-4">
                        <label for="name" class="block text-sm font-medium mb-1">Name *</label>
                        <input id="name" type="text" pInputText [(ngModel)]="currentCategory.name" name="name"
                               required/>
                    </div>

                    <div class="field mb-4">
                        <label for="icon" class="block text-sm font-medium mb-1">Icon Class (e.g., pi pi-car)</label>
                        <input id="icon" type="text" pInputText [(ngModel)]="currentCategory.icon" name="icon"
                               placeholder="PrimeIcons class"/>
                    </div>

                    <div class="field mb-4">
                        <label for="color" class="block text-sm font-medium mb-1">Color</label>
                        <div class="flex items-center gap-2">
                            <p-colorPicker [(ngModel)]="currentCategory.color" name="color" inputId="color"
                                           appendTo="body"></p-colorPicker>
                            <span>#{{ currentCategory.color }}</span>
                        </div>
                    </div>

                    <div class="field mb-4">
                        <label for="parent" class="block text-sm font-medium mb-1">Parent Category (Optional)</label>
                        <p-select
                            [options]="parentCategoryOptions"
                            [(ngModel)]="currentCategory.parentId"
                            optionLabel="name"
                            optionValue="id"
                            placeholder="Select a Parent Category"
                            name="parent"
                            appendTo = "body"
                            [filter]="true"
                            [showClear]="true"
                            styleClass="w-full">
                        </p-select>
                        <small class="text-secondary">Leave blank to create a top-level category.</small>
                    </div>
                </form>

                <ng-template pTemplate="footer">
                    <p-button label="Cancel" icon="pi times" (onClick)="showCategoryDialog = false"
                              styleClass="p-button-text"></p-button>
                    <p-button
                        label="{{ isEdit ? 'Update' : 'Create' }}"
                        icon="pi check"
                        (onClick)="saveCategory(categoryForm.valid)"
                        [disabled]="!categoryForm.valid">
                    </p-button>
                </ng-template>
            </p-dialog>
        </div>
    `
})
export class FinanceCategoriesComponent implements OnInit {

    allCategories: FinanceCategory[] = [];
    totalRecords: number = 0;
    loading: boolean = true;

    // Pagination and Filter State
    rows: number = 50;
    first: number = 0;
    searchQuery: string = '';
    searchTimeout: any;
    menuItems: MenuItem[] = [];

    // Column Management
    allColumns: Column[] = [
        { field: 'name', header: 'Name' },
        { field: 'color', header: 'Color' },
        { field: 'slug', header: 'Slug' },
        { field: 'icon', header: 'Icon' },
        { field: 'actions', header: 'Actions' },
    ];
    selectedColumns: Column[] = [...this.allColumns.slice(0, 5)]; // Default visible columns

    // Skeleton Data (to match the rows being requested)
    skeletonData: any[] = new Array(this.rows).fill({});

    @ViewChild('dt') dt!: Table;

    categories: FinanceCategory[] = [];
    parentCategoryOptions: FinanceCategory[] = [];


    // Store last sort state for refresh
    sortField: string = 'name';
    sortOrder: number = 1; // 1 for ascending, -1 for descending

    showCategoryDialog: boolean = false;
    isEdit: boolean = false;
    currentCategory: FinanceCategory = this.getEmptyCategory();
    selectedCategory!: FinanceCategory;

    constructor(
        private _financeService: PersonalFinanceService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private _cdr: ChangeDetectorRef
    ) {
    }

    ngOnInit(): void {
        this.loadAllCategoriesForDropdowns();
        this.initMenu();
    }

    getEmptyCategory(): FinanceCategory {
        return {
            id: undefined,
            parentId: undefined,
            name: '',
            color: '607D8B',
            slug: '',
            icon: '',
        };
    }


    loadAllCategoriesForDropdowns(): void {
        this._financeService.getFinanceParentCategories()
            .subscribe({
                next: (response: any) => {
                    this.allCategories = response.payload || [];
                },
                error: (err) => {
                    console.error('Error loading all categories for dropdown:', err);
                }
            });
    }


    // -------------------------------------------------------------------------
    // C R E A T E / U P D A T E
    // -------------------------------------------------------------------------

    private prepareParentOptions(currentId?: string): void {
        this.parentCategoryOptions = this.allCategories.filter(c => c.id !== currentId);
    }

    openCreateDialog(): void {
        this.isEdit = false;
        this.currentCategory = this.getEmptyCategory();
        this.prepareParentOptions();
        this.showCategoryDialog = true;
    }

    openEditDialog(category: FinanceCategory): void {
        this.isEdit = true;
        this.currentCategory = {...category};
        this.prepareParentOptions(category.id);
        this.showCategoryDialog = true;
    }

    saveCategory(isValid: boolean | null): void {
        if (!isValid) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Invalid Form',
                detail: 'Please fill in the required field (Name).'
            });
            return;
        }

        const action = this.isEdit ? 'Updated' : 'Created';
        if (this.isEdit && !this.currentCategory.id) {
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Cannot update category without an ID.'
            });
            return;
        }

        // Ensure parentId is null/undefined if empty string for consistency, although the API might handle ''
        const parentIdValue = this.currentCategory.parentId === '' ? undefined : this.currentCategory.parentId;

        const payload: FinanceCategory = {
            ...this.currentCategory,
            parentId: parentIdValue
        };

        if (!this.isEdit) {
            delete payload.id;
        }

        const serviceCall = this.isEdit
            ? this._financeService.updateFinanceCategory(payload.id!, payload)
            : this._financeService.addFinanceCategory(payload);

        serviceCall.subscribe({
            next: () => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Success',
                    detail: `Category ${this.currentCategory.name} ${action} successfully.`
                });
                this.showCategoryDialog = false;
                this.loadAllCategoriesForDropdowns();
                // Refresh table by emitting a lazy load event with current state
                this.loadCategories();
            },
            error: (err) => {
                const message = err.error?.message || `Failed to ${action.toLowerCase()} category.`;
                this.messageService.add({severity: 'error', summary: 'Error', detail: message});
            }
        });
    }

    // -------------------------------------------------------------------------
    // D E L E T E
    // -------------------------------------------------------------------------

    confirmDelete(category: FinanceCategory): void {
        if (!category.id) {
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Cannot delete category without an ID.'
            });
            return;
        }

        const hasChildren = this.allCategories.some(c => c.parentId === category.id);
        let message = `Are you sure you want to delete the category **${category.name}**? This action cannot be undone.`;

        if (hasChildren) {
            message = `**WARNING:** This category has sub-categories. Deleting this will orphaned those children. Are you sure you want to proceed?`;
        }


        this.confirmationService.confirm({
            message: message,
            header: 'Delete Confirmation',
            icon: hasChildren ? 'pi pi-exclamation-triangle' : 'pi pi-trash',
            accept: () => {
                this.deleteCategory(category.id!);
            }
        });
    }

    deleteCategory(categoryId: string): void {
        this._financeService.deleteFinanceCategory(categoryId).subscribe({
            next: () => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Deleted',
                    detail: 'Category deleted successfully.'
                });
                this.loadAllCategoriesForDropdowns();
                // Refresh table by emitting a lazy load event with current state
                this.loadCategories();
            },
            error: (err) => {
                const message = err.error?.message || 'Failed to delete category.';
                this.messageService.add({severity: 'error', summary: 'Error', detail: message});
            }
        });
    }


    onLazyLoad(event: any) {
        this.first = event.first;
        this.rows = event.rows;
        // PrimeNG sorts are not fully implemented here, so we only pass basic info
        this.loadCategories(event.sortField, event.sortOrder);
    }

    onSearchChange() {
        if (this.searchTimeout) {
            clearTimeout(this.searchTimeout);
        }
        this.searchTimeout = setTimeout(() => {
            this.first = 0; // Reset pagination on new search
            this.loadCategories(); // Trigger load after search change
        }, 500);
    }

    loadCategories(sortField: string = '', sortOrder: number = 1): void {
        this.loading = true;
        this.skeletonData = new Array(this.rows).fill({});

        const pageNumber = Math.floor(this.first / this.rows) + 1;

        // Construct the filters array based on currentFilters state
        const filters: any[] = [];

        const filter =   {
            query:  this.searchQuery,
            pageNumber: pageNumber,
            pageSize: this.rows,
            filters: filters,
            sorts: [
                // Add sort logic here if needed
            ]
        };

        this._financeService.getFinanceCategories(pageNumber, this.rows).subscribe({
            next: (response: any) => {
                this.allCategories = response.data;
                this.totalRecords = response.totalRecords;
                this.loading = false;
                this._cdr.detectChanges();
            },
            error: (err: any) => {
                this.allCategories = [];
                this.totalRecords = 0;
                this.loading = false;
                this._cdr.detectChanges();
            }
        });
    }

    setMenuTarget(category: FinanceCategory) {
        this.selectedCategory = category;
    }

    initMenu() {
        this.menuItems = [
            {
                label: 'Options',
                items: [
                    { label: 'Detail', icon: 'pi pi-eye', command: () => this.openEditDialog(this.selectedCategory) },
                    { label: 'Delete', icon: 'pi pi-trash', styleClass: 'text-red-500', command: () => this.confirmDelete(this.selectedCategory) }
                ]
            }
        ];
    }
}
