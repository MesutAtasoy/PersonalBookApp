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
import { TextareaModule } from 'primeng/textarea';
import { ColorPickerModule } from 'primeng/colorpicker';

// Assuming this path is correct and uses the new type (or we define it internally)
import { PersonalFinanceService } from "@/apps/finance/finance.service";
import {Bank} from "@/apps/finance/finance.types";

@Component({
    selector: 'app-banks',
    standalone: true,
    providers: [MessageService, ConfirmationService],
    imports: [
        CommonModule, FormsModule, TableModule, ButtonModule, InputTextModule,
        DialogModule, SkeletonModule, ToastModule, ConfirmDialogModule,
        TextareaModule, ColorPickerModule
    ],
    template: `
        <div class="card p-4">
            <p-toast></p-toast>
            <p-confirmDialog></p-confirmDialog>

            <h2 class="text-2xl font-semibold mb-4">🏦 Bank Management</h2>

            <div class="flex justify-content-end mb-4">
                <p-button
                    label="Add New Bank"
                    icon="pi pi-plus"
                    (onClick)="openCreateDialog()"
                    styleClass="p-button-sm">
                </p-button>
            </div>

            <p-table
                [value]="loading ? skeletonRows : banks"
                [paginator]="!loading && banks.length > 10"
                [rows]="10"
                [tableStyle]="{'min-width': '60rem'}"
                responsiveLayout="scroll">

                <ng-template pTemplate="header">
                    <tr>
                        <th style="width:10%">Logo</th>
                        <th style="width:15%">Name</th>
                        <th style="width:10%">Code</th>
                        <th style="width:25%">Website</th>
                        <th style="width:10%">Phone</th>
                        <th style="width:10%">Color</th>
                        <th style="width:10%">Actions</th>
                    </tr>
                </ng-template>

                <ng-template pTemplate="body" let-bank>
                    <tr *ngIf="!loading; else skeletonRow">
                        <td>
                            <img *ngIf="bank.logo" [src]="bank.logo" alt="Bank Logo" style="width: 40px; height: 40px; object-fit: contain; border-radius: 4px;" class="shadow-1" />
                            <span *ngIf="!bank.logo" class="text-400">N/A</span>
                        </td>
                        <td>{{ bank.name }}</td>
                        <td>{{ bank.code }}</td>
                        <td>
                            <a *ngIf="bank.website" [href]="bank.website" target="_blank" class="text-primary-500 hover:underline">{{ bank.website }}</a>
                            <span *ngIf="!bank.website" class="text-400">N/A</span>
                        </td>
                        <td>{{ bank.phoneNumber }}</td>
                        <td>
                            <div [style.background-color]="bank.color" style="width: 20px; height: 20px; border-radius: 50%; border: 1px solid #ccc; margin: auto;"></div>
                        </td>
                        <td>
                            <p-button
                                icon="pi pi-pencil"
                                (onClick)="openEditDialog(bank)"
                                styleClass="p-button-text p-button-sm mr-2">
                            </p-button>
                            <p-button
                                icon="pi pi-trash"
                                (onClick)="confirmDelete(bank)"
                                styleClass="p-button-text p-button-danger p-button-sm">
                            </p-button>
                        </td>
                    </tr>
                    <ng-template #skeletonRow>
                        <tr>
                            <td><p-skeleton shape="circle" size="2.5rem"></p-skeleton></td>
                            <td><p-skeleton height="1rem" styleClass="w-8"></p-skeleton></td>
                            <td><p-skeleton height="1rem" styleClass="w-6"></p-skeleton></td>
                            <td><p-skeleton height="1rem" styleClass="w-10"></p-skeleton></td>
                            <td><p-skeleton height="1rem" styleClass="w-7"></p-skeleton></td>
                            <td><p-skeleton shape="circle" size="1.5rem"></p-skeleton></td>
                            <td><p-skeleton height="1rem" styleClass="w-8"></p-skeleton></td>
                        </tr>
                    </ng-template>
                </ng-template>

                <ng-template pTemplate="emptymessage" *ngIf="!loading">
                    <tr>
                        <td colspan="7" class="text-center">No banks found.</td>
                    </tr>
                </ng-template>

            </p-table>

            <p-dialog
                header="{{ isEdit ? 'Edit Bank' : 'Create New Bank' }}"
                [(visible)]="showBankDialog"
                [modal]="true"
                [style]="{ width: '500px' }">

                <form #bankForm="ngForm" class="row">
                    <div class="field col-12 mb-4">
                        <label for="name" class="block text-sm font-medium mb-1">Name *</label>
                        <input id="name" type="text" class="w-full" pInputText [(ngModel)]="currentBank.name" name="name" required />
                    </div>

                    <div class="field col-6 mb-4">
                        <label for="code" class="block text-sm font-medium mb-1">Code (e.g., ABC) *</label>
                        <input id="code" class="w-full" type="text" pInputText [(ngModel)]="currentBank.code" name="code" required maxlength="5" [disabled]="isEdit" />
                    </div>

                    <div class="field col-6 mb-4">
                        <label for="phoneNumber" class="block text-sm font-medium mb-1">Phone Number</label>
                        <input id="phoneNumber" class="w-full" type="text" pInputText [(ngModel)]="currentBank.phoneNumber" name="phoneNumber" />
                    </div>

                    <div class="field col-12 mb-4">
                        <label for="website" class="block text-sm font-medium mb-1">Website</label>
                        <input id="website" class="w-full" type="text" pInputText [(ngModel)]="currentBank.website" name="website" placeholder="e.g., https://www.bank.com" />
                    </div>

                    <div class="field col-12 mb-4">
                        <label for="logo" class="block text-sm font-medium mb-1">Logo URL</label>
                        <input id="logo" class="w-full" type="text" pInputText [(ngModel)]="currentBank.logo" name="logo" placeholder="URL of the bank logo" />
                    </div>

                    <div class="field col-6 mb-4">
                        <label for="color" class="block text-sm font-medium mb-1">Theme Color</label>
                        <div class="flex items-center gap-2">
                            <p-colorPicker [(ngModel)]="currentBank.color" name="color" inputId="color" appendTo="body"></p-colorPicker>
                            <span>#{{ currentBank.color }}</span>
                        </div>
                    </div>

                    <div class="field col-12 mb-4">
                        <label for="description" class="block text-sm font-medium mb-1">Description</label>
                        <textarea id="description" pInputTextarea class="w-full" [(ngModel)]="currentBank.description" name="description" rows="3"></textarea>
                    </div>

                </form>

                <ng-template pTemplate="footer">
                    <p-button label="Cancel" icon="pi pi-times" (onClick)="showBankDialog = false" styleClass="p-button-text"></p-button>
                    <p-button
                        label="{{ isEdit ? 'Update' : 'Create' }}"
                        icon="pi pi-check"
                        (onClick)="saveBank(bankForm.valid)"
                        [disabled]="!bankForm.valid">
                    </p-button>
                </ng-template>
            </p-dialog>
        </div>
    `
})
export class FinanceBanksComponent implements OnInit {

    // --- State Variables ---
    banks: Bank[] = [];
    loading: boolean = true;
    skeletonRows: any[] = new Array(5).fill({});

    showBankDialog: boolean = false;
    isEdit: boolean = false;
    currentBank: Bank = this.getEmptyBank();

    constructor(
        private _financeService: PersonalFinanceService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService
    ) {}

    ngOnInit(): void {
        this.loadBanks();
    }

    /**
     * Helper to create an empty bank object for the form.
     */
    getEmptyBank(): Bank {
        return {
            id: undefined,
            name: '',
            code: '',
            description: '',
            logo: '',
            color: '1976D2', // Default Blue Color
            phoneNumber: '',
            website: '',
        };
    }

    // -------------------------------------------------------------------------
    // R E A D (List)
    // -------------------------------------------------------------------------

    /**
     * Loads all banks and handles skeleton loading state.
     */
    loadBanks(): void {
        this.loading = true;
        // Assuming your service's getBanks() returns an observable of { payload: Bank[] }
        this._financeService.getBanks().subscribe({
            next: (response: any) => {
                this.banks = response || [];
                this.loading = false;
            },
            error: (err) => {
                console.error('Error loading banks:', err);
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load banks.' });
                this.loading = false;
            }
        });
    }

    // -------------------------------------------------------------------------
    // C R E A T E / U P D A T E (Form)
    // -------------------------------------------------------------------------

    /**
     * Opens the dialog for creating a new bank.
     */
    openCreateDialog(): void {
        this.isEdit = false;
        this.currentBank = this.getEmptyBank();
        this.showBankDialog = true;
    }

    /**
     * Opens the dialog for editing an existing bank.
     * @param bank The bank to edit.
     */
    openEditDialog(bank: Bank): void {
        this.isEdit = true;
        // Create a deep copy using object spread
        this.currentBank = { ...bank };
        // Ensure color is a string (ColorPicker uses hex string, e.g., '1976D2')
        if (typeof this.currentBank.color !== 'string') {
            this.currentBank.color = '1976D2';
        }
        this.showBankDialog = true;
    }

    /**
     * Calls the appropriate service method (create or update).
     * @param isValid Whether the form is valid.
     */
    saveBank(isValid: boolean | null): void {
        if (!isValid) {
            this.messageService.add({ severity: 'warn', summary: 'Invalid Form', detail: 'Please fill in required fields (Name and Code).' });
            return;
        }

        const action = this.isEdit ? 'Updated' : 'Created';

        if (this.isEdit && !this.currentBank.id) {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Cannot update bank without an ID.' });
            return;
        }

        const serviceCall = this.isEdit
            ? this._financeService.updateBank(this.currentBank.id!, this.currentBank) // Assuming service requires ID for update
            : this._financeService.addBank(this.currentBank);

        serviceCall.subscribe({
            next: () => {
                this.messageService.add({ severity: 'success', summary: 'Success', detail: `Bank ${this.currentBank.name} ${action} successfully.` });
                this.showBankDialog = false;
                this.loadBanks(); // Reload the list
            },
            error: (err) => {
                const message = err.error?.message || `Failed to ${action.toLowerCase()} bank.`;
                this.messageService.add({ severity: 'error', summary: 'Error', detail: message });
            }
        });
    }

    // -------------------------------------------------------------------------
    // D E L E T E
    // -------------------------------------------------------------------------

    /**
     * Confirms and deletes a bank.
     * @param bank The bank to delete.
     */
    confirmDelete(bank: Bank): void {
        if (!bank.id) {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Cannot delete bank without an ID.' });
            return;
        }

        this.confirmationService.confirm({
            message: `Are you sure you want to delete the bank **${bank.name}**? This action cannot be undone.`,
            header: 'Delete Confirmation',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.deleteBank(bank.id!);
            }
        });
    }

    /**
     * Calls the service to delete the bank.
     * @param bankId The ID of the bank to delete.
     */
    deleteBank(bankId: string): void {
        this._financeService.deleteBank(bankId).subscribe({
            next: () => {
                this.messageService.add({ severity: 'success', summary: 'Deleted', detail: 'Bank deleted successfully.' });
                this.loadBanks(); // Reload the list
            },
            error: (err) => {
                const message = err.error?.message || 'Failed to delete bank.';
                this.messageService.add({ severity: 'error', summary: 'Error', detail: message });
            }
        });
    }
}
