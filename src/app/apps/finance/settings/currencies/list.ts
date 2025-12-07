import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { SkeletonModule } from 'primeng/skeleton';
import { ToastModule } from 'primeng/toast';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TagModule } from 'primeng/tag';

// Assuming this path is correct and uses the new type (or we define it internally)
import { PersonalFinanceService } from "@/apps/finance/finance.service";
import {CurrencyCode} from "@/apps/finance/finance.types";

@Component({
    selector: 'app-finance-currencies',
    standalone: true,
    providers: [MessageService, ConfirmationService],
    imports: [
        CommonModule, FormsModule, TableModule, ButtonModule, InputTextModule,
        DialogModule, SkeletonModule, ToastModule, ConfirmDialogModule, TagModule
    ],
    template: `
        <div class="card p-4">
            <p-toast></p-toast>
            <p-confirmDialog></p-confirmDialog>

            <h2 class="text-2xl font-semibold mb-4">💵 Currency Management</h2>

            <div class="flex justify-content-end mb-4">
                <p-button
                    label="New Currency"
                    icon="pi pi-plus"
                    (onClick)="openCreateDialog()"
                    styleClass="p-button-sm">
                </p-button>
            </div>

            <p-table
                [value]="loading ? skeletonRows : currencies"
                [paginator]="!loading && currencies.length > 10"
                [rows]="10"
                [tableStyle]="{'min-width': '50rem'}"
                responsiveLayout="scroll">

                <ng-template pTemplate="header">
                    <tr>
                        <th style="width:20%">Code</th>
                        <th style="width:40%">Name</th>
                        <th style="width:20%">Icon</th>
                        <th style="width:20%">Actions</th>
                    </tr>
                </ng-template>

                <ng-template pTemplate="body" let-currency>
                    <tr *ngIf="!loading; else skeletonRow">
                        <td>{{ currency.code }}</td>
                        <td>{{ currency.name }}</td>
                        <td>
                            <i *ngIf="currency.icon" [class]="currency.icon" class="text-xl"></i>
                            <span *ngIf="!currency.icon" class="text-400">N/A</span>
                        </td>
                        <td>
                            <p-button
                                icon="pi pi-pencil"
                                (onClick)="openEditDialog(currency)"
                                styleClass="p-button-text p-button-sm mr-2">
                            </p-button>
                            <p-button
                                icon="pi pi-trash"
                                (onClick)="confirmDelete(currency)"
                                styleClass="p-button-text p-button-danger p-button-sm">
                            </p-button>
                        </td>
                    </tr>
                    <ng-template #skeletonRow>
                        <tr>
                            <td><p-skeleton height="1rem" styleClass="w-6"></p-skeleton></td>
                            <td><p-skeleton height="1rem" styleClass="w-9"></p-skeleton></td>
                            <td><p-skeleton height="1rem" styleClass="w-4"></p-skeleton></td>
                            <td><p-skeleton height="1rem" styleClass="w-8"></p-skeleton></td>
                        </tr>
                    </ng-template>
                </ng-template>

                <ng-template pTemplate="emptymessage" *ngIf="!loading">
                    <tr>
                        <td colspan="4" class="text-center">No currencies found.</td>
                    </tr>
                </ng-template>

            </p-table>

            <p-dialog
                header="{{ isEdit ? 'Edit Currency' : 'Create New Currency' }}"
                [(visible)]="showCurrencyDialog"
                [modal]="true"
                [style]="{ width: '400px' }">

                <form #currencyForm="ngForm" class="p-fluid">
                    <div class="field mb-4">
                        <label for="code" class="block text-sm font-medium mb-1">Code (e.g., USD) *</label>
                        <input id="code" type="text" pInputText [(ngModel)]="currentCurrency.code" name="code" required maxlength="3" minlength="3"  [disabled]="isEdit" />
                    </div>

                    <div class="field mb-4">
                        <label for="name" class="block text-sm font-medium mb-1">Name *</label>
                        <input id="name" type="text" pInputText [(ngModel)]="currentCurrency.name" name="name" required />
                    </div>

                    <div class="field mb-4">
                        <label for="icon" class="block text-sm font-medium mb-1">Icon (e.g., pi pi-dollar) *</label>
                        <input id="icon" type="text" pInputText [(ngModel)]="currentCurrency.icon" name="icon" required />
                    </div>

                </form>

                <ng-template pTemplate="footer">
                    <p-button label="Cancel" icon="pi pi-times" (onClick)="showCurrencyDialog = false" styleClass="p-button-text"></p-button>
                    <p-button
                        label="{{ isEdit ? 'Update' : 'Create' }}"
                        icon="pi pi-check"
                        (onClick)="saveCurrency(currencyForm.valid)"
                        [disabled]="!currencyForm.valid">
                    </p-button>
                </ng-template>
            </p-dialog>
        </div>
    `
})
export class FinanceCurrenciesComponent implements OnInit {

    // --- State Variables ---
    currencies: CurrencyCode[] = [];
    loading: boolean = true;
    skeletonRows: any[] = new Array(5).fill({});

    showCurrencyDialog: boolean = false;
    isEdit: boolean = false;
    currentCurrency: CurrencyCode = this.getEmptyCurrency();

    constructor(
        private _financeService: PersonalFinanceService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService
    ) {}

    ngOnInit(): void {
        this.loadCurrencies();
    }

    /**
     * Helper to create an empty currency object for the form.
     */
    getEmptyCurrency(): CurrencyCode {
        return {
            id: undefined, // Must be undefined for creation based on interface
            code: '',
            name: '',
            icon: '',
        };
    }

    // -------------------------------------------------------------------------
    // R E A D (List)
    // -------------------------------------------------------------------------

    /**
     * Loads all currencies and handles skeleton loading state.
     */
    loadCurrencies(): void {
        this.loading = true;
        // Assuming your service's getCurrencies() returns an observable of { payload: CurrencyCode[] }
        this._financeService.getCurrencyCodes().subscribe({
            next: (response: any) => {
                this.currencies = response.payload || [];
                this.loading = false;
            },
            error: (err) => {
                console.error('Error loading currencies:', err);
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load currencies.' });
                this.loading = false;
            }
        });
    }

    // -------------------------------------------------------------------------
    // C R E A T E / U P D A T E (Form)
    // -------------------------------------------------------------------------

    /**
     * Opens the dialog for creating a new currency.
     */
    openCreateDialog(): void {
        this.isEdit = false;
        this.currentCurrency = this.getEmptyCurrency();
        this.showCurrencyDialog = true;
    }

    /**
     * Opens the dialog for editing an existing currency.
     * @param currency The currency to edit.
     */
    openEditDialog(currency: CurrencyCode): void {
        this.isEdit = true;
        // Create a deep copy using object spread
        this.currentCurrency = { ...currency };
        this.showCurrencyDialog = true;
    }

    /**
     * Calls the appropriate service method (create or update).
     * @param isValid Whether the form is valid.
     */
    saveCurrency(isValid: boolean | null): void {
        if (!isValid) {
            this.messageService.add({ severity: 'warn', summary: 'Invalid Form', detail: 'Please fill in all required fields.' });
            return;
        }

        const action = this.isEdit ? 'Updated' : 'Created';

        // Ensure ID is present for update
        if (this.isEdit && !this.currentCurrency.id) {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Cannot update currency without an ID.' });
            return;
        }

        const serviceCall = this.isEdit
            ? this._financeService.updateCurrencyCode(this.currentCurrency.id!, this.currentCurrency) // Assuming service requires ID for update
            : this._financeService.addCurrencyCode(this.currentCurrency);

        serviceCall.subscribe({
            next: () => {
                this.messageService.add({ severity: 'success', summary: 'Success', detail: `Currency ${this.currentCurrency.code} ${action} successfully.` });
                this.showCurrencyDialog = false;
                this.loadCurrencies(); // Reload the list
            },
            error: (err) => {
                const message = err.error?.message || `Failed to ${action.toLowerCase()} currency.`;
                this.messageService.add({ severity: 'error', summary: 'Error', detail: message });
            }
        });
    }

    // -------------------------------------------------------------------------
    // D E L E T E
    // -------------------------------------------------------------------------

    /**
     * Confirms and deletes a currency.
     * @param currency The currency to delete.
     */
    confirmDelete(currency: CurrencyCode): void {
        if (!currency.id) {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Cannot delete currency without an ID.' });
            return;
        }

        this.confirmationService.confirm({
            message: `Are you sure you want to delete the currency **${currency.code}**?`,
            header: 'Delete Confirmation',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.deleteCurrency(currency.id!);
            }
        });
    }

    /**
     * Calls the service to delete the currency.
     * @param currencyId The ID of the currency to delete.
     */
    deleteCurrency(currencyId: string): void {
        this._financeService.deleteCurrencyCode(currencyId).subscribe({
            next: () => {
                this.messageService.add({ severity: 'success', summary: 'Deleted', detail: 'Currency deleted successfully.' });
                this.loadCurrencies(); // Reload the list
            },
            error: (err) => {
                const message = err.error?.message || 'Failed to delete currency.';
                this.messageService.add({ severity: 'error', summary: 'Error', detail: message });
            }
        });
    }
}
