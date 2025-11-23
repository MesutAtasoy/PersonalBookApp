import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule, Params } from '@angular/router';
import { MenuModule } from 'primeng/menu';
import {MenuItem, MessageService} from 'primeng/api';
import { CardModule } from 'primeng/card';
import { SkeletonModule } from 'primeng/skeleton';
import {PersonalFinanceService} from "@/apps/finance/finance.service";
import {Avatar} from "primeng/avatar";
import {Badge} from "primeng/badge";
import {Toast} from "primeng/toast";
import {FinanceAccount} from "@/apps/finance/finance.types";


@Component({
    selector: 'app-account-detail',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        MenuModule,
        CardModule,
        SkeletonModule,
        Avatar,
        Badge,
        Toast,
        // BreadcrumbComponent
    ],
    providers: [ MessageService ],
    template: `
        <div class="mt-3">
            <p-toast></p-toast>

            <div class="col-12">
                <p-card class="p-0 overflow-hidden">
                    <ng-template pTemplate="content">
                        <div *ngIf="loading" class="flex items-center gap-4 p-4">
                            <p-skeleton shape="circle" size="5rem"></p-skeleton>
                            <div class="flex flex-col gap-2">
                                <p-skeleton width="10rem" height="1.5rem"></p-skeleton>
                                <p-skeleton width="15rem" height=".8rem"></p-skeleton>
                            </div>
                        </div>
                        <div *ngIf="!loading && account" class="flex flex-col md:flex-row items-center gap-4 p-4 relative">
                            <div class="relative">
                                <p-avatar
                                    [image]="account.financeBank?.bank?.logo || 'assets/default-bank.png'"
                                    size="xlarge"
                                    shape="circle"
                                    [style]="{'width': '5rem', 'height': '5rem', 'font-size': '2.5rem'}">
                                </p-avatar>
                                <p-badge
                                    *ngIf="account.isActive"
                                    severity="success"
                                    icon="pi pi-check"
                                    styleClass="absolute bottom-0 right-0 transform translate-x-1/2 translate-y-1/2"></p-badge>
                            </div>

                            <div class="flex flex-col flex-grow text-center md:text-left">
                                <div class="text-3xl font-bold text-900">{{ account.name }}</div>
                                <span class="text-secondary text-lg">{{ account.description || 'No description provided.' }}</span>
                            </div>

                            <div class="mt-3 md:mt-0 md:ml-auto flex gap-3 items-center">
                                <i class="pi pi-cog text-2xl text-600 hover:text-900 cursor-pointer"></i>
                            </div>
                        </div>
                    </ng-template>
                </p-card>
            </div>

            <div class="col-12 flex flex-col md:flex-row gap-3 mt-4">

                <div class="col-12 md:col-3 p-0">
                    <p-card styleClass="h-full">
                        <ng-template pTemplate="content">
                            <div *ngIf="loading">
                                <p-skeleton height="2rem" styleClass="mb-2"></p-skeleton>
                                <p-skeleton height="2rem" styleClass="mb-2"></p-skeleton>
                                <p-skeleton height="2rem" styleClass="mb-2"></p-skeleton>
                                <p-skeleton height="2rem"></p-skeleton>
                            </div>

                            <ul *ngIf="!loading" class="list-none p-0 m-0">
                                <li *ngFor="let item of sidebarItems" class="mb-2">
                                    <a
                                        [routerLink]="item.routerLink"  routerLinkActive="bg-primary-50 text-primary-900 dark:bg-primary-900 dark:text-primary-100" [ngClass]="{
                                            'hover:bg-surface-100 dark:hover:bg-surface-800 text-700': !isLinkActive(item.value)
                                        }"
                                        (click)="setActiveSection(item.value)"
                                        class="flex flex-col p-3 border-round cursor-pointer transition-all transition-duration-200">
                                        <div class="flex items-center gap-3">
                                            <i [class]="item.icon + ' text-lg'"></i>
                                            <span class="font-semibold text-lg">{{ item.label }}</span>
                                        </div>
                                        <span class="text-sm text-secondary block mt-1 ml-6">{{ item.description }}</span>
                                    </a>
                                </li>
                            </ul>
                        </ng-template>
                    </p-card>
                </div>

                <div class="col-12 md:col-9 p-0 w-full">
                    <p-card styleClass="h-full">
                        <ng-template pTemplate="header">
                            <div *ngIf="loading" class="p-4">
                                <p-skeleton width="30%" height="1.5rem"></p-skeleton>
                                <p-skeleton width="60%" height=".8rem" styleClass="mt-2"></p-skeleton>
                            </div>
                            <div *ngIf="!loading && account" class="p-4">
                                <h2 class="text-2xl font-bold text-900">{{ getCurrentSectionTitle() }}</h2>
                                <p class="text-secondary">{{ getCurrentSectionDescription() }}</p>
                            </div>
                        </ng-template>

                        <ng-template pTemplate="content">
                            <div *ngIf="loading; then skeletonContent else contentOutlet"></div>

                            <ng-template #contentOutlet>
                                <router-outlet></router-outlet> </ng-template>

                            <ng-template #skeletonContent>
                                <div class="flex flex-col gap-4">
                                    <p-skeleton width="70%" height="1.5rem"></p-skeleton>
                                    <p-skeleton width="90%" height="1rem"></p-skeleton>
                                    <p-skeleton width="50%" height="1rem"></p-skeleton>
                                    <p-skeleton width="80%" height="1rem"></p-skeleton>
                                </div>
                            </ng-template>
                        </ng-template>
                    </p-card>
                </div>
            </div>
        </div>
    `
})
export class AccountDetailComponent implements OnInit {
    bankId!: string;
    accountId!: string;
    account: FinanceAccount | null = null;
    menuItems: MenuItem[] = [];
    loading: boolean = true;

    sidebarItems: { label: string; icon: string; description: string; value: string; routerLink: string[] }[] = [];
    activeSection: string = 'overview'; // Tracks current section for header display


    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private financeService: PersonalFinanceService ,
        private messageService : MessageService
    ) { }

    ngOnInit(): void {
        this.route.params.subscribe((params: Params) => {
            this.bankId = params['bankId'];
            this.accountId = params['accountId']; // Convert to number

            // Re-initialize when params change (though usually not necessary for bank detail)
            this.loadAccountDetails();
            this.initSidebar();
        });
    }

    loadAccountDetails(): void {
        this.loading = true;

        // --- Replace with actual service call ---
        // this.financeService.getAccountDetail(this.accountId).subscribe(data => { ... });

        this.financeService.getFinanceAccount(this.accountId)
            .subscribe({
                next: (response: any) => {
                    this.account = response.payload;
                    this.loading = false;
                },
                error: (err: any) => {
                    console.error('Error loading bank details for ID:', this.accountId, err);
                    this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load bank details.' });
                    this.loading = false;
                }
            })
    }

    initSidebar(): void {
        this.sidebarItems = [
            {
                label: 'Overview',
                icon: 'pi pi-chart-line',
                description: 'A snapshot of your account health, including current balance, available credit (if applicable), and recent activity.',
                value: 'overview',
                routerLink: ['overview']
            },
            {
                label: 'Transactions',
                icon: 'pi pi-history',
                description: 'View, search, and categorize historical transactions for this account.',
                value: 'transactions',
                routerLink: ['transactions']
            },
            {
                label: 'Cards',
                icon: 'pi pi-credit-card',
                description: 'View and manage all debit and credit cards linked to this account.',
                value: 'accounts',
                routerLink: ['cards']
            },
            {
                label: 'Buckets',
                icon: 'pi pi-wallet',
                description: 'Manage your savings goals or virtual sub-accounts linked to the main balance.',
                value: 'accounts',
                routerLink: ['buckets']
            },
            {
                label: 'Installment Plans',
                icon: 'pi pi-calendar',
                description: 'Manage recurring bills, subscription payments, or loan installment schedules tied to this account.',
                value: 'accounts',
                routerLink: ['installments']
            },
            {
                label: 'Settings',
                icon: 'pi pi-cog',
                description: 'Configure bank preferences and integration settings.',
                value: 'settings',
                routerLink: ['settings']
            },
            {
                label: 'Danger Zone',
                icon: 'pi pi-exclamation-triangle',
                description: 'Area for high-impact actions like account closure or archival.',
                value: 'danger-zone',
                routerLink: ['danger-zone']
            }
        ];
    }

    // Updates the active section state based on the clicked link
    setActiveSection(section: string): void {
        this.activeSection = section;
    }

    // Utility to check active status for applying custom class (used in template)
    isLinkActive(value: string): boolean {
        // Simple check based on the current activeSection property
        return this.activeSection === value;
    }

    getCurrentSectionTitle(): string {
        const section = this.sidebarItems.find(item => item.value === this.activeSection);
        return section ? section.label : 'Details';
    }

    getCurrentSectionDescription(): string {
        const section = this.sidebarItems.find(item => item.value === this.activeSection);
        return section ? section.description : 'Detailed information about the selected section.';
    }
}
