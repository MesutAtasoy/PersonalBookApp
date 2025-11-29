import {ChangeDetectorRef, Component, OnInit, signal, WritableSignal} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
    FinanceInstallmentDetailDto,
    FinanceInstallmentPlanDto, FinanceInstallmentPlanSearchFilter,
} from "@/apps/finance/finance.types";
import {ActivatedRoute, Router} from "@angular/router";
import {PersonalFinanceService} from "@/apps/finance/finance.service";
import {ConfirmationService, MessageService, PrimeTemplate} from "primeng/api";
import {Button, ButtonDirective} from "primeng/button";
import {FormsModule} from "@angular/forms";
import {InputText} from "primeng/inputtext";
import {MultiSelect} from "primeng/multiselect";
import {Skeleton} from "primeng/skeleton";
import {TableModule} from "primeng/table";
import {Tag} from "primeng/tag";
import {Dialog} from "primeng/dialog";
import {Card} from "primeng/card";
import {InputNumber} from "primeng/inputnumber";
import {ToggleSwitch} from "primeng/toggleswitch";
import {ConfirmDialog} from "primeng/confirmdialog";
import {Toast} from "primeng/toast";

interface Column {
    field: keyof FinanceInstallmentPlanDto | 'actions'; // Use interface keys
    header: string;
    pipe?: 'currency' | 'date' | 'type' | 'category';
}

// Interface for the payment request payload
interface PaymentRequest {
    amount: number;
    transactionName: string;
    isCompleted: boolean;
}

@Component({
    selector: 'app-account-installment-plans',
    standalone: true,
    imports: [CommonModule, ButtonDirective, FormsModule, InputText, MultiSelect, PrimeTemplate, Skeleton, TableModule, Tag, Dialog, Card, InputNumber, ToggleSwitch, Button, ConfirmDialog, Toast],
    // PrimeNG's MessageService is typically provided at the module or root level, but we will assume it is available here.
    providers: [MessageService, ConfirmationService],
    template: `
        <p-toast></p-toast>
        <div class="p-4">
            <div class="flex flex-column md:flex-row justify-content-between align-items-center mb-4 gap-3">

                <div class="p-inputgroup w-full md:w-30rem">
                    <input
                        type="text"
                        pInputText
                        placeholder="Search Installment plans..."
                        [(ngModel)]="searchQuery"
                        (ngModelChange)="onSearchChange()">
                    <button type="button" pButton icon="pi pi-search" (click)="loadInstallmentPlans()"></button>
                </div>
                <div class="flex items-center gap-2">
                    <i class="pi pi-cog text-xl text-700 hidden md:block" title="Customize Columns"></i>

                    <p-multiSelect
                        [options]="allColumns"
                        [(ngModel)]="selectedColumns"
                        optionLabel="header"
                        display="chip"
                        placeholder="Select Columns"
                        styleClass="w-full md:w-20rem">
                    </p-multiSelect>
                </div>
            </div>

            <p-table
                [value]="loading ? skeletonData : installmentPlans"
                [scrollable]="true"
                scrollHeight="400px"
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

                <ng-template pTemplate="body" let-installmentPlan>
                    <tr *ngIf="loading">
                        <td *ngFor="let col of selectedColumns">
                            <p-skeleton></p-skeleton>
                        </td>
                    </tr>
                    <tr *ngIf="!loading">
                        <td *ngFor="let col of selectedColumns">
                            <ng-container [ngSwitch]="col.field">
                            <span *ngSwitchCase="'name'">
                                {{ installmentPlan?.name }}
                            </span>

                                <span *ngSwitchCase="'totalAmount'">
                                    {{ installmentPlan.totalAmount | currency: installmentPlan.currencyCode }}
                                </span>

                                <span *ngSwitchCase="'principalTotalAmount'">
                                    {{ installmentPlan.principalTotalAmount | currency: installmentPlan.currencyCode }}
                                </span>

                                <span *ngSwitchCase="'interestAmount'">
                                    {{ installmentPlan.interestAmount | currency: installmentPlan.currencyCode }}
                                </span>

                                <span *ngSwitchCase="'totalPaidAmount'">
                                    {{ installmentPlan.totalPaidAmount | currency: installmentPlan.currencyCode }}
                                </span>

                                <span *ngSwitchCase="'installmentCount'">
                                    {{ installmentPlan.installmentCount }}
                                </span>
                                <span *ngSwitchCase="'startDate'">
                                    {{ installmentPlan.startDate | date: 'mediumDate' }}
                                </span>
                                <span *ngSwitchCase="'endDate'">
                                    {{ installmentPlan.endDate | date: 'mediumDate' }}
                                </span>

                                <span *ngSwitchCase="'createdDate'">
                                    {{ installmentPlan.createdDate | date: 'mediumDate' }}
                                </span>

                                <span *ngSwitchCase="'modifiedDate'">
                                    {{ installmentPlan.modifiedDate | date: 'mediumDate' }}
                                </span>

                                <span *ngSwitchCase="'completeRate'">
                                     <div class="flex flex-col items-start w-full min-w-10rem">
                                        <div class="bg-surface-200 rounded-full h-2 w-full mb-1">
                                            <div
                                                class="h-2 rounded-full bg-primary-500 transition-all duration-500"
                                                [ngClass]="{'bg-green-500': installmentPlan.completeRate >= 1.0}"
                                                [style.width.%]="installmentPlan.completeRate">
                                            </div>
                                        </div>
                                        <span class="text-xs font-medium text-700">
                                            {{ installmentPlan.completeRate | number:'1.0-2'}} % Completed
                                        </span>
                                    </div>
                                </span>

                                <!-- Is Completed (New) -->
                                <span *ngSwitchCase="'isCompleted'">
                                    <p-tag
                                        [value]="installmentPlan.isCompleted ? 'Completed' : 'Pending'"
                                        [severity]="installmentPlan.isCompleted ? 'success' : 'warn'"
                                        class="text-xs"
                                    ></p-tag>
                                </span>

                                <span *ngSwitchCase="'actions'">
                                    <button
                                        pButton
                                        type="button"
                                        icon="pi pi-eye"
                                        label="View"
                                        class="p-button-sm p-button-text p-button-secondary"
                                        (click)="viewDetails(installmentPlan.id)">
                                    </button>
                                </span>

                            </ng-container>
                        </td>
                    </tr>
                </ng-template>

                <ng-template pTemplate="emptymessage" *ngIf="!loading">
                    <tr>
                        <td [attr.colspan]="selectedColumns.length" class="text-center p-4">
                            No installment plans found for the current criteria.
                        </td>
                    </tr>
                </ng-template>

            </p-table>

        </div>

        <p-dialog
            [(visible)]="displayModal"
            [header]="'Details: ' + (selectedPlanDetails?.name || (isDetailLoading ? 'Loading...' : 'Details'))"
            [modal]="true"
            [resizable]="false"
            [draggable]="false"
            [maximizable]="true"
            [style]="{width: '70vw', minHeight: '50vh'}"
            [breakpoints]="{'960px': '90vw', '640px': '100vw'}">

            <!-- Detailed Loading State (Skeleton) -->
            <div *ngIf="isDetailLoading" class="p-4">
                <!-- Plan Summary Skeleton -->
                <p-card header="Plan Summary" class="mb-4 shadow-none border-1 surface-border">
                    <div class="grid p-2">
                        <div *ngFor="let i of [1,2,3,4]" class="col-12 md:col-6 lg:col-3 mb-3">
                            <p-skeleton width="70%" height="1rem" class="mb-2"></p-skeleton>
                            <p-skeleton width="90%" height="1.5rem"></p-skeleton>
                        </div>
                    </div>
                </p-card>

                <!-- Installment Payments Skeleton Table -->
                <p-card header="Installment Payments" class="mb-4 shadow-none border-1 surface-border">
                    <p-table [value]="[1,2,3,4,5]" styleClass="p-datatable-sm p-datatable-gridlines">
                        <ng-template pTemplate="header">
                            <tr>
                                <th class="w-2rem"><p-skeleton></p-skeleton></th>
                                <th><p-skeleton></p-skeleton></th>
                                <th><p-skeleton></p-skeleton></th>
                                <th><p-skeleton></p-skeleton></th>
                                <th><p-skeleton></p-skeleton></th>
                                <th><p-skeleton></p-skeleton></th>
                                <th><p-skeleton></p-skeleton></th>
                            </tr>
                        </ng-template>
                        <ng-template pTemplate="body" let-i>
                            <tr>
                                <td><p-skeleton></p-skeleton></td>
                                <td><p-skeleton></p-skeleton></td>
                                <td><p-skeleton></p-skeleton></td>
                                <td><p-skeleton></p-skeleton></td>
                                <td><p-skeleton></p-skeleton></td>
                                <td><p-skeleton></p-skeleton></td>
                                <td><p-skeleton></p-skeleton></td>
                            </tr>
                        </ng-template>
                    </p-table>
                    <!-- Pagination Skeleton -->
                    <div class="flex justify-content-end mt-3">
                         <p-skeleton width="15rem" height="2rem"></p-skeleton>
                    </div>
                </p-card>

                <!-- Key Dates Skeleton -->
                <p-card header="Key Dates" class="mb-4 shadow-none border-1 surface-border">
                    <div class="grid p-2">
                        <div *ngFor="let i of [1,2,3]" class="col-12 md:col-4 mb-3">
                            <p-skeleton width="70%" height="1rem" class="mb-2"></p-skeleton>
                            <p-skeleton width="90%" height="1.5rem"></p-skeleton>
                        </div>
                    </div>
                </p-card>
            </div>

            <!-- Content when details are loaded -->
            <div *ngIf="selectedPlanDetails && !isDetailLoading" class="row">
                <!-- 1. Plan Summary -->
                <p-card header="Plan Summary" class="mb-4 shadow-none border-1 surface-border">
                    <div class="row p-2">
                        <div class="col-12 md:col-6 lg:col-3 mb-3">
                            <span class="text-700 font-medium block mb-2">Total Amount</span>
                            <div class="font-bold text-lg">
                                {{ selectedPlanDetails.totalAmount ?? "0" | currency: selectedPlanDetails.currencyCode }}
                            </div>
                        </div>
                        <div class="col-12 md:col-6 lg:col-3 mb-3">
                            <span class="text-700 font-medium block mb-2">Paid Amount</span>
                            <div class="font-bold text-lg">
                                {{ selectedPlanDetails.totalPaidAmount ?? "0"  | currency: selectedPlanDetails.currencyCode }}
                            </div>
                        </div>
                        <div class="col-12 md:col-6 lg:col-3 mb-3">
                            <span class="text-700 font-medium block mb-2">Completion Rate</span>
                            <div class="font-bold text-lg text-primary">
                                {{ selectedPlanDetails.completeRate | number:'1.0-2' }}%
                            </div>
                        </div>
                        <div class="col-12 md:col-6 lg:col-3 mb-3">
                            <span class="text-700 font-medium block mb-2">Interest Rate</span>
                            <div class="font-bold text-lg">
                                {{ selectedPlanDetails.interestRate }}
                            </div>
                        </div>
                    </div>
                </p-card>

                <!-- 2. Installment Details Table (Client-Side Pagination Added) -->
                <p-card header="Installment Payments" class="mb-4 shadow-none border-1 surface-border">
                    <div *ngIf="!installmentDetails || installmentDetails.length === 0"
                         class="text-center p-3 text-700">
                        No installment payment details found for this plan.
                    </div>

                    <p-table
                        *ngIf="installmentDetails && installmentDetails.length > 0"
                        [value]="installmentDetails"
                        [paginator]="true"
                        [rows]="10"
                        [tableStyle]="{'min-width': '50rem'}"
                        styleClass="p-datatable-sm p-datatable-gridlines">

                        <ng-template pTemplate="header">
                            <tr>
                                <th class="w-2rem">#</th>
                                <th>Due Date</th>
                                <th>Principal</th>
                                <th>Interest</th>
                                <th>Total Due</th>
                                <th>Paid Amount</th>
                                <th>Status</th>
                                <th class="text-center">Action</th> <!-- New Column -->
                            </tr>
                        </ng-template>
                        <ng-template pTemplate="body" let-detail>
                            <tr [class]="{'bg-green-50/50': detail.isPaid}">
                                <td>{{ detail.installmentNumber }}</td>
                                <td>{{ detail.dueDate | date: 'mediumDate' }}</td>
                                <td>{{ detail.principalAmount | currency: detail.currencyCode }}</td>
                                <td>{{ detail.interestAmount | currency: detail.currencyCode }}</td>
                                <td>
                                    <span class="font-bold">
                                        {{ detail.totalDueAmount | currency: detail.currencyCode }}
                                    </span>
                                </td>
                                <td>{{ detail.paidAmount | currency: detail.currencyCode }}</td>
                                <td>
                                    <p-tag
                                        [value]="detail.isPaid ? 'Paid' : 'Pending'"
                                        [severity]="detail.isPaid ? 'success' : 'warn'"
                                        class="text-xs">
                                    </p-tag>
                                </td>
                                <td class="text-center">
                                    <button
                                        pButton
                                        type="button"
                                        icon="pi pi-dollar"
                                        label="Pay"
                                        class="p-button-sm p-button-success p-button-outlined"
                                        [disabled]="detail.isPaid"
                                        (click)="showPaymentModal(detail)">
                                    </button>
                                </td>
                            </tr>
                        </ng-template>

                    </p-table>
                </p-card>

                <!-- 3. Key Dates (Updated Card) -->
                <p-card header="Key Dates" class="mb-4 shadow-none border-1 surface-border">
                    <div class="row p-2">
                        <div class="col-12 md:col-4 mb-3">
                            <span class="text-700 font-medium block mb-2">Start Date</span>
                            <div class="font-bold">
                                {{ selectedPlanDetails.startDate | date: 'fullDate' }}
                            </div>
                        </div>
                        <div class="col-12 md:col-4 mb-3">
                            <span class="text-700 font-medium block mb-2">End Date</span>
                            <div class="font-bold">
                                {{ selectedPlanDetails.endDate | date: 'fullDate' }}
                            </div>
                        </div>
                        <div class="col-12 md:col-4 mb-3">
                            <span class="text-700 font-medium block mb-2">Installments</span>
                            <div class="font-bold">
                                {{ selectedPlanDetails.installmentCount }}
                            </div>
                        </div>
                    </div>
                </p-card>
            </div>

            <ng-template pTemplate="footer">
                <div class="flex justify-content-end p-2 border-top-1 surface-border">
                    <button pButton label="Close" icon="pi pi-times" (click)="displayModal = false"
                            class="p-button-text p-button-secondary"></button>
                </div>
            </ng-template>

        </p-dialog>


        <!-- New Payment Modal -->
        <p-dialog
            [(visible)]="displayPaymentModal"
            [header]="paymentModalTitle"
            [modal]="true"
            [resizable]="false"
            [draggable]="false"
            [style]="{width: '400px'}"
            [breakpoints]="{'960px': '80vw', '640px': '90vw'}">

            <div class="row">
                <div class="field mb-4">
                    <label for="amount" class="font-medium block mb-2">Amount *</label>
                    <p-inputNumber
                        inputId="amount"
                        [ngModel]="paymentRequest.amount"
                        (ngModelChange)="paymentRequest.amount = $event || 0"
                        mode="currency"
                        [currency]="selectedPlanDetails?.currencyCode || 'USD'"
                        [locale]="'en-US'"
                        class="w-full"
                        [disabled]="isPaymentSubmitting"
                    ></p-inputNumber>
                </div>

                <div class="field mb-4">
                    <label for="transactionName" class="font-medium block mb-2">Transaction Name</label>
                    <input
                        id="transactionName"
                        type="text"
                        pInputText
                        [(ngModel)]="paymentRequest.transactionName"
                        placeholder="e.g., Monthly Installment Payment"
                        [disabled]="isPaymentSubmitting"
                    />
                </div>

                <div class="flex justify-content-between align-items-center mb-4">
                    <label for="completed" class="font-medium block">Completed?</label>
                    <p-toggle-switch
                        id="completed"
                        [(ngModel)]="paymentRequest.isCompleted"
                        [disabled]="isPaymentSubmitting"
                    ></p-toggle-switch>
                </div>
            </div>

            <ng-template pTemplate="footer">
                <div class="flex justify-content-end gap-3 p-2">
                    <p-button
                        label="Discard"
                        icon="pi pi-times"
                        class="p-button-secondary p-button-text"
                        (click)="displayPaymentModal = false"
                        [disabled]="isPaymentSubmitting">
                    </p-button>
                    <p-button
                        label="Save Changes"
                        icon="pi pi-save"
                        class="p-button-info"
                        (click)="submitPayment()"
                        [loading]="isPaymentSubmitting"
                        [disabled]="paymentRequest.amount <= 0 || !selectedDetailId">
                    </p-button>
                </div>
            </ng-template>

        </p-dialog>
    `
})
export class AccountInstallmentPlansComponent implements OnInit {

    account: any | null = null; // Corrected type
    bankId!: string;
    accountId!: string;

    installmentPlans: FinanceInstallmentPlanDto[] = [];
    totalRecords: number = 0;
    loading: boolean = true;
    isDetailLoading: boolean = false; // New state for dialog skeleton

    // Pagination and Filter State
    rows: number = 10;
    first: number = 0;
    searchQuery: string = '';
    searchTimeout: any;

    allColumns: Column[] = [
        { field: 'actions', header: 'Actions' },
        { field: 'name', header: 'Name' },
        { field: 'totalAmount', header: 'Total Amount' },
        { field: 'totalPaidAmount', header: 'Total Paid Amount' },
        { field: 'installmentCount', header: 'Installment Count' },
        { field: 'isCompleted', header: 'Completed' },
        { field: 'completeRate', header: 'Complete Rate' },
        { field: 'startDate', header: 'Start Date' },
        { field: 'endDate', header: 'End Date' },
        { field: 'principalTotalAmount', header: 'Principal Total Amount' },
        { field: 'interestRate', header: 'Interest Rate' },
        { field: 'interestAmount', header: 'Interest Amount' },
        { field: 'createdDate', header: 'Created Date' },
        { field: 'modifiedDate', header: 'Modified Date' },
    ];

    selectedColumns: Column[] = [...this.allColumns.slice(0, 7)]; // Default visible columns

    skeletonData: any[] = new Array(this.rows).fill({});

    // Main Details Modal State
    displayModal: boolean = false;
    selectedPlanDetails: FinanceInstallmentPlanDto | null = null;
    installmentDetails: FinanceInstallmentDetailDto[] = [];

    // Payment Modal State
    displayPaymentModal: boolean = false;
    isPaymentSubmitting: boolean = false;
    selectedDetailId: string | null = null;
    paymentModalTitle: string = '';

    paymentRequest: PaymentRequest = {
        amount: 0,
        transactionName: '',
        isCompleted: false,
    };

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        // The service and MessageService are assumed to be correctly provided via the dependency injection hierarchy
        private financeService: PersonalFinanceService ,
        private messageService : MessageService,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        var segments = this.router.url.split('/');
        // Assuming the URL structure is consistent for BankId and AccountId
        // e.g., /app/finance/banks/bankId/accounts/accountId/plans
        if (segments.length >= 8) {
            this.bankId = segments[5];
            this.accountId = segments[7];
        } else {
            // Fallback for development/testing if route is not fully set
            this.bankId = 'unknown-bank';
            this.accountId = 'unknown-account';
        }
    }

    onSearchChange() {
        if (this.searchTimeout) {
            clearTimeout(this.searchTimeout);
        }
        this.searchTimeout = setTimeout(() => {
            this.first = 0; // Reset pagination on new search
            this.loadInstallmentPlans();
        }, 500);
    }

    onLazyLoad(event: any) {
        this.first = event.first;
        this.rows = event.rows;
        this.loadInstallmentPlans(event.sortField, event.sortOrder);
    }

    loadInstallmentPlans(sortField: string = '', sortOrder: number = 1): void {
        this.loading = true;
        this.skeletonData = new Array(this.rows).fill({});

        const pageNumber = Math.floor(this.first / this.rows) + 1;

        const filter : FinanceInstallmentPlanSearchFilter =    {
            filter: {
                financeBankId: this.bankId,
                financeAccountId: this.accountId,
            },
            paginationFilter: {
                pageSize: this.rows,
                pageNumber: pageNumber
            },
            search:  {
                value: this.searchQuery
            },
            order: {
                direction: sortOrder === 1 ? "asc" :  "desc",
                column: sortField
            }
        };

        this.financeService.searchFinanceInstallmentPlans(filter).subscribe({
            next: (response: any) => {
                this.installmentPlans = response.payload.data;
                this.totalRecords = response.payload.totalRecords;
                this.loading = false;
                this.cdr.detectChanges();
            },
            error: (err: any) => {
                console.error('Error loading installment plans:', err);
                this.messageService.add({ severity: 'error', summary: 'Loading Error', detail: 'Failed to load installment plans.' });
                this.installmentPlans = [];
                this.totalRecords = 0;
                this.loading = false;
                this.cdr.detectChanges();
            }
        });
    }

    viewDetails(planId: string): void {
        this.selectedPlanDetails = this.installmentPlans.find(x=>x.id == planId) || null;
        this.installmentDetails = [];
        this.displayModal = true;
        this.isDetailLoading = true; // Start loading details skeleton

        this.fetchInstallmentDetails(planId);
    }

    fetchInstallmentDetails(planId: string): void {
        this.financeService.getInstallmentDetails(planId).subscribe({
            next: (details : any)  => {
                this.installmentDetails = details.payload;
                this.isDetailLoading = false; // Stop loading on success
                this.cdr.detectChanges();
            },
            error: (err) => {
                console.error('Error loading installment details:', err);
                this.messageService.add({ severity: 'error', summary: 'Details Error', detail: 'Could not load installment details.' });
                this.isDetailLoading = false; // Stop loading on error
                // Clear the main details on error, but keep the modal open to show the error message.
                this.selectedPlanDetails = null;
                this.cdr.detectChanges();
            }
        });
    }

    // Function to show the payment modal
    showPaymentModal(detail: FinanceInstallmentDetailDto): void {
        if (detail.isPaid) return;

        this.selectedDetailId = detail.id || null;
        this.paymentRequest.amount = detail.amount || 0;
        this.paymentRequest.transactionName = this.selectedPlanDetails?.name ? `${this.selectedPlanDetails.name} - ${detail.installmentNumber}/${this.selectedPlanDetails.installmentCount}` : '';
        this.paymentRequest.isCompleted = true;
        this.paymentModalTitle = `Pay ${detail.amount} ${detail.currencyCode} - ${detail.installmentNumber}/${this.selectedPlanDetails?.installmentCount}`;
        this.displayPaymentModal = true;
    }

    // Function to submit the payment
    submitPayment(): void {
        if (!this.selectedPlanDetails || !this.selectedDetailId || this.paymentRequest.amount <= 0) {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Invalid plan or installment details for payment.' });
            return;
        }

        this.isPaymentSubmitting = true;

        this.financeService.paymentInstallmentDetails(
            this.selectedPlanDetails.id ?? "",
            this.selectedDetailId,
            this.paymentRequest
        ).subscribe({
            next: (response: any) => {
                this.messageService.add({ severity: 'success', summary: 'Payment Success', detail: 'Installment payment recorded successfully.' });
                this.isPaymentSubmitting = false;
                this.displayPaymentModal = false;

                this.viewDetails(this.selectedPlanDetails?.id ?? "")

                // Optionally, reload the main plans table to update completion rate/status
                this.loadInstallmentPlans();

                this.cdr.detectChanges();

            },
            error: (err) => {
                this.messageService.add({ severity: 'error', summary: 'Payment Failed', detail: err?.error?.message || 'Could not process payment.' });
                this.isPaymentSubmitting = false;
            }
        });
    }
}
