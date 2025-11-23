import {CommonModule, NgOptimizedImage} from '@angular/common';
import {ChangeDetectorRef, Component, OnInit, ViewChild} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { AvatarModule } from 'primeng/avatar';
import {PersonalFinanceService} from "@/apps/finance/finance.service";
import {FinanceAccount, FinanceAccountSearchFilter, FinanceBank} from "@/apps/finance/finance.types";
import {ButtonModule} from "primeng/button";
import {InputTextModule} from "primeng/inputtext";
import {TagModule} from "primeng/tag";
import {MenuModule} from "primeng/menu";
import {IconFieldModule} from "primeng/iconfield";
import {InputIconModule} from "primeng/inputicon";
import {Confirmation, ConfirmationService, MenuItem, MessageService} from "primeng/api";
import {SkeletonModule} from "primeng/skeleton";
import {CareerFilterRequest} from "@/core/components/career-filter/pagination.model";
import { DataViewModule, DataView as PrimeDataView } from 'primeng/dataview';
import {PaginatorModule} from "primeng/paginator";
import {CardModule} from "primeng/card";
import {SelectButtonModule} from "primeng/selectbutton";
import {SearchFilter} from "@/core/pagination/personal-book.pagination";
import {ActivatedRoute, Router, RouterLink} from "@angular/router";
import {ToastModule} from "primeng/toast";
import {ConfirmDialogModule} from "primeng/confirmdialog";


@Component({
    selector: 'app-bank-accounts',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        DataViewModule,
        SelectModule,
        AvatarModule,
        ButtonModule,
        InputTextModule,
        TagModule,
        MenuModule,
        IconFieldModule,
        InputIconModule,
        SkeletonModule,
        PaginatorModule,
        CardModule,
        SelectButtonModule,
        ToastModule,
        ConfirmDialogModule
    ],
    template: `
        <p-toast></p-toast>
        <p-confirmDialog [style]="{width: '50vw'}" [baseZIndex]="1000"></p-confirmDialog>
        <p-dataView
            #dv
            [value]="financeAccounts"
            [layout]="'grid'"
            [paginator]="true"
            [rows]="rows"
            [totalRecords]="totalRecords"
            [lazy]="true"
            (onLazyLoad)="onLazyLoad($event)">

            <ng-template #header>
                <div class="flex flex-column md:flex-row justify-between items-center gap-2">
                    <p-select-button [(ngModel)]="layout" [options]="options" [allowEmpty]="false">
                        <ng-template let-option>
                            <i [class]="option.icon"></i>
                        </ng-template>
                    </p-select-button>

                    <div class="flex flex-column md:flex-row gap-2">
                        <p-select
                            [options]="sortOptions"
                            placeholder="Sort by..."
                            (onChange)="onSortChange($event)"
                            styleClass="w-full md:w-15rem">
                        </p-select>
                        <p-icon-field iconPosition="left">
                            <p-inputicon class="pi pi-search"/>
                            <input
                                type="text"
                                pInputText
                                placeholder="Search..."
                                (input)="onSearch($any($event.target).value)"
                                class="w-full"/>
                        </p-icon-field>


                    </div>

                    <p-button
                        label="Create Account"
                        icon="pi pi-plus"
                        styleClass="p-button-success" (click)="addAccount()"> </p-button>

                </div>
            </ng-template>

            <ng-template #list let-items>
                <div class="flex flex-col">

                    <ng-container *ngIf="loading; else actualListContainer">
                        <div *ngFor="let i of counterArray(4); let first = first">
                            <div
                                class="flex flex-col xl:flex-row xl:items-start p-6 gap-6"
                                [ngClass]="{ 'border-t border-surface-200 dark:border-surface-700': !first }">
                                <p-skeleton class="!w-64 xl:!w-40 !h-24 mx-auto" />
                                <div class="flex flex-col sm:flex-row justify-between items-center xl:items-start flex-1 gap-6">
                                    <div class="flex flex-col items-center sm:items-start gap-4">
                                        <p-skeleton width="8rem" height="2rem" />
                                        <p-skeleton width="6rem" height="1rem" />
                                        <div class="flex items-center gap-4">
                                            <p-skeleton width="6rem" height="1rem" />
                                            <p-skeleton width="3rem" height="1rem" />
                                        </div>
                                    </div>
                                    <div class="flex sm:flex-col items-center sm:items-end gap-4 sm:gap-2">
                                        <p-skeleton width="4rem" height="2rem" />
                                        <p-skeleton size="3rem" shape="circle" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </ng-container>

                    <ng-template #actualListContainer>
                        <div *ngFor="let item of items; let first = first">
                            <div
                                class="flex flex-col xl:flex-row xl:items-start p-6 gap-6 border-t border-surface-200 dark:border-surface-700"
                                [ngClass]="{ 'border-t-0': first }">
                                <img
                                    [src]="item.financeBank?.bank?.logo || 'assets/default-bank.png'"
                                    [alt]="item.name"
                                    class="!w-64 xl:!w-40 !h-24 mx-auto object-cover"/>
                                <div class="flex flex-col sm:flex-row justify-between items-center xl:items-start flex-1 gap-6">
                                    <div class="flex flex-col items-center sm:items-start gap-2">
                                        <div class="text-xl font-medium text-900">{{ item.name }}</div>
                                        <div class="text-sm text-secondary">{{ item.bank?.description || 'No description available.' }}</div>
                                    </div>
                                    <div class="flex sm:flex-col items-center sm:items-end gap-4 sm:gap-2">
                                        <p-tag
                                            [value]="item.isActive ? 'Active' : 'Inactive'"
                                            [severity]="getSeverity(item)">
                                        </p-tag>
                                        <button pButton icon="pi pi-ellipsis-v" class="p-button-text p-button-rounded"></button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </ng-template>
                </div>
            </ng-template>


            <ng-template #grid let-items>
                <div class="grid grid-cols-12 gap-4">

                    <ng-container *ngIf="loading; else actualGridContainer">
                        <div *ngFor="let i of counterArray(6)" class="col-span-12 sm:col-span-6 xl:col-span-4 p-2">
                            <div class="p-6 border border-surface-200 dark:border-surface-700 bg-surface-0 dark:bg-surface-900 rounded h-full">
                                <div class="flex flex-col items-center gap-4 py-8">
                                    <p-skeleton shape="circle" size="5rem" />
                                    <p-skeleton width="8rem" height="2rem" />
                                    <p-skeleton width="6rem" height="1rem" />
                                </div>
                                <div class="flex items-center justify-between border-t pt-4">
                                    <p-skeleton width="4rem" height="2rem" />
                                    <p-skeleton size="3rem" shape="circle" />
                                </div>
                            </div>
                        </div>
                    </ng-container>

                    <ng-template #actualGridContainer>
                        <div *ngFor="let item of items" class="col-span-12 sm:col-span-6 xl:col-span-4 p-2">
                            <div class="p-6 border border-surface-200 dark:border-surface-700 bg-surface-0 dark:bg-surface-900 rounded h-full">
                                <div class="flex flex-col items-center gap-4 py-4">
                                    <img
                                        [src]="item?.financeBank?.bank?.logo || 'assets/default-bank.png'"
                                        [alt]="item.name"
                                        class="w-20 h-20 object-cover border-circle shadow-3"/>
                                    <div class="text-xl font-medium text-900">{{ item.name }}</div>
                                    <div class="text-sm text-secondary text-center">{{ item.description || 'Not Provided' }}</div>
                                    <div class="text-sm text-secondary text-center">{{ item.modifiedDate ?? item.createdDate |  date:'medium' }}</div>
                                </div>

                                <div class="flex items-center justify-between border-t pt-4">
                                    <p-tag
                                        [value]="item.isActive ? 'Active' : 'Inactive'"
                                        [severity]="getSeverity(item)">
                                    </p-tag>
                                    <button pButton icon="pi pi-ellipsis-v" class="p-button-text p-button-rounded" (click)="setMenuTarget(item); menu.toggle($event)"></button>
                                </div>
                            </div>
                        </div>
                    </ng-template>
                </div>
            </ng-template>

            <ng-template pTemplate="empty">
                <div class="text-center p-6 text-500">
                    <i class="pi pi-info-circle text-2xl mb-2"></i>
                    <div>No bank accounts found matching the current criteria.</div>
                </div>
            </ng-template>

        </p-dataView>

        <p-menu #menu [model]="menuItems" [popup]="true" appendTo="body"></p-menu>
  `,
    providers: [ConfirmationService, MessageService], // Provide services here
})
export class BankAccountsComponent implements OnInit {
    dummySkeletons = new Array(5); // For loading template
    loading: boolean = true;

    // Pagination
    totalRecords: number = 0;
    first: number = 0;
    rows: number = 10;
    financeAccounts: FinanceAccount[] = [];

    sortField: string = '';
    sortOrder: number = 1;
    searchQuery: string = '';

    sortOptions: any[] = [
        { label: 'Name (A-Z)', value: 'name' },
        { label: 'Name (Z-A)', value: '!name' },
        { label: 'Date (Newest)', value: '!createdDate' },
        { label: 'Date (Oldest)', value: 'createdDate' }
    ];

    // Menu
    menuItems: MenuItem[] = [];
    selectedAccount: FinanceAccount | null = null;
    private searchTimeout: any;

    @ViewChild('dv') dataView!: PrimeDataView;

    bankId!: string;
    bank: FinanceBank | undefined;


    constructor(public _financeService : PersonalFinanceService,
                public _changeDetectorRef : ChangeDetectorRef,
                public _router: Router,
                private _activatedRoute: ActivatedRoute,
                private _messageService: MessageService,
                private _confirmationService : ConfirmationService)
    {
    }

    ngOnInit() {
        this.bankId = this._activatedRoute.parent!.snapshot.paramMap.get('id')!;
        this.loadBankDetails(this.bankId);
        this.initMenu();
    }

    loadBankDetails(id: string): void {
        this.loading = true;
        this._financeService.getFinanceBank(id)
            .subscribe({
                next: (response: any) => {
                    this.bank = response;
                    this.loadAccountsData();

                },
                error: (err: any) => {
                    console.error('Error loading bank details:', err);
                    this.loading = false;
                }
            });
    }

    loadAccountsData() {


        this.loading = true;

        const pageNumber = Math.floor(this.first / this.rows) + 1; // <-- FIX: Convert 0-based index to 1-based page number

        const request : FinanceAccountSearchFilter =  {
            paginationFilter: {
                pageNumber : pageNumber,
                pageSize : this.rows,
            },
            search: {
                value: this.searchQuery
            },
            filter: {
                financeBankId: this.bankId
            }
        };


        this._financeService.searchAccount(request).subscribe({
            next: (response: any) => {
                this.financeAccounts = response.payload.data;
                this.totalRecords = response.payload.totalRecords;
                this.loading = false;
                this._changeDetectorRef.markForCheck();
            },
            error: (err) => {
                console.error('Error loading banks', err);
                this.loading = false;
            }
        });
    }

    // --- EVENTS ---

    // Triggered by Paginator or Sort
    onLazyLoad(event: any) {
        this.first = event.first;
        this.rows = event.rows;
        this.loadAccountsData();
    }

    onSortChange(event: any) {
        if (this.dataView) {
            this.dataView.first = 0;
        }
        this.first = 0;

        this.loadAccountsData();
    }

    onSearch(value: string) {
        this.searchQuery = value;

        if (this.searchTimeout) clearTimeout(this.searchTimeout);

        this.searchTimeout = setTimeout(() => {
            // Manually reset the Paginator to page 1
            if (this.dataView) {
                this.dataView.first = 0;
            }

            // Also reset local variable just in case
            this.first = 0;

            this.loadAccountsData();
        }, 500);
    }

    // --- UTILS ---

    setMenuTarget(account: FinanceAccount) {
        this.selectedAccount = account;
    }

    getSeverity(bank: FinanceBank) {
        return bank.isActive ? 'success' : 'danger';
    }

    initMenu() {
        this.menuItems = [
            {
                label: 'Options',
                items: [
                    { label: 'Detail', icon: 'pi pi-eye', command: () => this.viewDetail(this.selectedAccount) },
                    { label: 'Edit', icon: 'pi pi-file-edit', command: () => this.edit(this.selectedAccount) },
                    { label: 'Delete', icon: 'pi pi-trash', styleClass: 'text-red-500', command: () => this.delete(this.selectedAccount) }
                ]
            }
        ];
    }

    viewDetail(account: FinanceAccount | null) {
        if (account && account.id) {
            this._router.navigate(['apps/finance/finance-banks/banks/' + this.bankId + '/accounts/' + account.id + '/overview']);
        } else {
            console.warn("Cannot view detail: Bank ID is missing.");
        }
    }
    edit(bank: FinanceAccount | null) { console.log('Edit', bank); }
    delete(account: FinanceAccount | null) {
        this._confirmationService.confirm({
            message: `Are you sure you want to delete the account: **${account?.name}** (${account?.type})? This action cannot be undone.`,
            header: 'Confirm Account Deletion',
            icon: 'pi pi-exclamation-triangle',
            acceptButtonStyleClass: 'p-button-danger',
            rejectButtonStyleClass: 'p-button-text',
            accept: () => {
                this.deleteAccount(account?.id?.toString() ?? '');
            },
            reject: () => {
                this._messageService.add({severity: 'info', summary: 'Cancelled', detail: 'Deletion cancelled'});
            }
        } as Confirmation); // Cast to Confirmation type if needed, though Angular often infers this.
    }

    layout: string = 'grid'; // Default view mode
    options: any[] = [
        { value: 'list', icon: 'pi pi-bars' },
        { value: 'grid', icon: 'pi pi-table' }
    ];

    counterArray(count: number): number[] {
        return Array(count).fill(0).map((x, i) => i);
    }

    addAccount(){
        this._router.navigate(['apps/finance/finance-banks/' + this.bankId + '/detail/accounts/create']);
    }


    // --- Deletion Service Call ---

    deleteAccount(accountId: string): void {
        // Assume the service method is called deleteAccount(accountId)
        this._financeService.deleteFinanceAccount(accountId).subscribe({
            next: () => {
                this._messageService.add({severity: 'success', summary: 'Deleted', detail: `Account ID ${accountId} deleted successfully.`});
                this.loadAccountsData();
            },
            error: (err) => {
                console.error('Deletion failed:', err);
                this._messageService.add({severity: 'error', summary: 'Error', detail: `Failed to delete account ID ${accountId}.`});
            }
        });
    }
}
