import {CommonModule} from '@angular/common';
import {Component, OnInit, ViewChild} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {ButtonModule} from 'primeng/button';
import {InputTextModule} from 'primeng/inputtext';
import {DialogModule} from 'primeng/dialog';
import {Table, TableModule} from 'primeng/table';
import {SkeletonModule} from 'primeng/skeleton';
import {ToastModule} from 'primeng/toast';
// Use the correct PrimeNG LazyLoadEvent type (which is imported from 'primeng/api')
import {MessageService, ConfirmationService, LazyLoadEvent} from 'primeng/api';
import {ConfirmDialogModule} from 'primeng/confirmdialog';
import {ColorPickerModule} from 'primeng/colorpicker';
import {SelectModule} from 'primeng/select';
import {RippleModule} from 'primeng/ripple';
import {PersonalFinanceService} from "@/apps/finance/finance.service";
import {FinanceCategory} from "@/apps/finance/finance.types";
// Assuming the path is correct and models are structured like this:
import {OrderParameter, PaginationFilter, SearchFilter} from "@/core/pagination/personal-book.pagination";


@Component({
    selector: 'app-finance-categories',
    standalone: true,
    providers: [MessageService, ConfirmationService],
    imports: [
        CommonModule, FormsModule, TableModule, ButtonModule, InputTextModule,
        DialogModule, SkeletonModule, ToastModule, ConfirmDialogModule,
        ColorPickerModule, SelectModule, RippleModule
    ],
    template: `
        <div class="card p-4">
            <p-toast></p-toast>
            <p-confirmDialog></p-confirmDialog>

            <h2 class="text-2xl font-semibold mb-4">📚 Category Management</h2>

            <div class="flex justify-content-between flex-wrap mb-4">
                <div class="p-inputgroup w-full md:w-30rem">
                    <span class="p-inputgroup-addon"><i class="pi pi-search"></i></span>
                    <input
                        type="text"
                        pInputText
                        placeholder="Search categories..."
                        [(ngModel)]="globalFilter"
                        (input)="filterTable($event)"> </div>

                <p-button
                    label="Add New Category"
                    icon="pi pi-plus"
                    (onClick)="openCreateDialog()"
                    styleClass="p-button-sm mt-3 md:mt-0">
                </p-button>
            </div>

            <p-table
                #dt
                [value]="loading ? skeletonRows : categories"
                [paginator]="true"
                [rows]="rowsPerPage"
                [lazy]="true"
                (onLazyLoad)="loadCategories($event)"
                [totalRecords]="totalRecords"
                [loading]="loading"
                [tableStyle]="{'min-width': '50rem'}"
                responsiveLayout="scroll"
                dataKey="id"
                [globalFilterFields]="['name', 'slug']"
                [sortField]="sortField"
                [sortOrder]="sortOrder">

                <ng-template pTemplate="header">
                    <tr>
                        <th style="width:30%" pSortableColumn="name">Name
                            <p-sortIcon field="name"></p-sortIcon>
                        </th>
                        <th style="width:20%" pSortableColumn="parentId">Parent ID
                            <p-sortIcon field="parentId"></p-sortIcon>
                        </th>
                        <th style="width:15%">Icon</th>
                        <th style="width:15%">Color</th>
                        <th style="width:20%">Actions</th>
                    </tr>
                </ng-template>

                <ng-template pTemplate="body" let-category>
                    <tr *ngIf="!loading; else skeletonRow">
                        <td>{{ category.name }}</td>
                        <td>
                            <span *ngIf="category.parentId"
                                  class="font-mono text-xs text-400">{{ category.parentId | slice:0:8 }}...</span>
                            <span *ngIf="!category.parentId" class="text-500">Top Level</span>
                        </td>
                        <td>
                            <i *ngIf="category.icon" [class]="category.icon" [style.color]="'#' + category.color"
                               class="text-xl"></i>
                            <span *ngIf="!category.icon" class="text-400">N/A</span>
                        </td>
                        <td>
                            <div [style.background-color]="'#' + category.color"
                                 style="width: 20px; height: 20px; border-radius: 4px; border: 1px solid #ccc; margin: auto;"></div>
                        </td>
                        <td>
                            <p-button
                                icon="pi pi-pencil"
                                (onClick)="openEditDialog(category)"
                                styleClass="p-button-text p-button-sm mr-2">
                            </p-button>
                            <p-button
                                icon="pi pi-trash"
                                (onClick)="confirmDelete(category)"
                                styleClass="p-button-text p-button-danger p-button-sm">
                            </p-button>
                        </td>
                    </tr>
                    <ng-template #skeletonRow>
                        <tr>
                            <td>
                                <p-skeleton height="1rem" styleClass="w-9"></p-skeleton>
                            </td>
                            <td>
                                <p-skeleton height="1rem" styleClass="w-7"></p-skeleton>
                            </td>
                            <td>
                                <p-skeleton height="1rem" styleClass="w-4"></p-skeleton>
                            </td>
                            <td>
                                <p-skeleton shape="circle" size="1.5rem"></p-skeleton>
                            </td>
                            <td>
                                <p-skeleton height="1rem" styleClass="w-8"></p-skeleton>
                            </td>
                        </tr>
                    </ng-template>
                </ng-template>

                <ng-template pTemplate="emptymessage" *ngIf="!loading">
                    <tr>
                        <td colspan="5" class="text-center">No categories found.</td>
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

    @ViewChild('dt') dt!: Table;

    categories: FinanceCategory[] = [];
    allCategories: FinanceCategory[] = [];
    parentCategoryOptions: FinanceCategory[] = [];

    loading: boolean = false;
    skeletonRows: any[] = new Array(8).fill({});

    totalRecords: number = 0;
    rowsPerPage: number = 10;
    globalFilter: string = '';

    // Store last sort state for refresh
    sortField: string = 'name';
    sortOrder: number = 1; // 1 for ascending, -1 for descending

    showCategoryDialog: boolean = false;
    isEdit: boolean = false;
    currentCategory: FinanceCategory = this.getEmptyCategory();

    constructor(
        private _financeService: PersonalFinanceService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService
    ) {
    }

    ngOnInit(): void {
        this.loadAllCategoriesForDropdowns();
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

    // -------------------------------------------------------------------------
    // D A T A L O A D I N G & F I L T E R I N G
    // -------------------------------------------------------------------------

    /**
     * Helper to safely call filterGlobal on the PrimeNG table.
     * @param event The input event from the search box.
     */
    filterTable(event: Event): void {
        const inputElement = event.target as HTMLInputElement;
        if (this.dt) {
            this.dt.filterGlobal(inputElement.value, 'contains');
        }
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

    /**
     * Converts the PrimeNG LazyLoadEvent into the SearchFilter model and fetches data.
     * @param event LazyLoadEvent from p-table
     */
    loadCategories(event: any): void {
        this.loading = true;

        // --- 1. Construct SearchFilter ---

        // SAFELY extract event properties, falling back to 0, rowsPerPage, or 1.
        // This handles null/undefined values emitted by the p-table event.
        const first = event.first ?? 0;
        const rows = event.rows ?? this.rowsPerPage;
        const sortOrder = event.sortOrder ?? 1;

        // Pagination
        const pageNumber = (first / rows) + 1;
        const pageSize = rows;

        const paginationFilter: PaginationFilter = {pageNumber, pageSize};

        // Sorting
        const order: OrderParameter = {
            column: event.sortField || this.sortField,
            direction: sortOrder === 1 ? 'asc' : 'desc'
        };
        this.sortField = order.column ?? '';
        this.sortOrder = sortOrder;

        // Searching (Global Filter)
        const globalSearchValue = event.globalFilter || this.globalFilter;
        const searchParameter = globalSearchValue
            ? {value: globalSearchValue}
            : undefined;

        const searchFilter: SearchFilter = {
            paginationFilter,
            order,
            search: searchParameter
        };

        // --- 2. Call Service ---
        this._financeService.searchFinanceCategories(searchFilter).subscribe({
            next: (response: any) => {
                this.categories = response.data || [];
                this.totalRecords = response.totalCount || 0;
                this.loading = false;
            },
            error: (err) => {
                console.error('Error loading categories:', err);
                this.messageService.add({severity: 'error', summary: 'Error', detail: 'Failed to load categories.'});
                this.loading = false;
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
                this.dt.onLazyLoad.emit(this.dt.createLazyLoadMetadata());
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
                this.dt.onLazyLoad.emit(this.dt.createLazyLoadMetadata());
            },
            error: (err) => {
                const message = err.error?.message || 'Failed to delete category.';
                this.messageService.add({severity: 'error', summary: 'Error', detail: message});
            }
        });
    }
}
