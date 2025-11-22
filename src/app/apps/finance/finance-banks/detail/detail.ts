import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {ActivatedRoute, Router, RouterLink, RouterLinkActive, RouterOutlet} from '@angular/router'; // NEW: Router and RouterOutlet
import { FinanceBank } from '@/apps/finance/finance.types';
import { MenuItem, MessageService } from 'primeng/api';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { TagModule } from 'primeng/tag';
import { AvatarModule } from 'primeng/avatar';
import { BadgeModule } from 'primeng/badge';
import { ToastModule } from 'primeng/toast';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import {TextareaModule} from "primeng/textarea";
import {PersonalFinanceService} from "@/apps/finance/finance.service"; // Required for NgModel in Top Card

@Component({
    selector: 'app-finance-bank-detail',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        CardModule,
        ButtonModule,
        SkeletonModule,
        TagModule,
        AvatarModule,
        BadgeModule,
        ToastModule,
        InputTextModule,
        TextareaModule,
        RouterOutlet,
        RouterLink,
        RouterLinkActive,
        // <-- Essential for nested routing
    ],
    providers: [MessageService],
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
                        <div *ngIf="!loading && bank" class="flex flex-col md:flex-row items-center gap-4 p-4 relative">
                            <div class="relative">
                                <p-avatar
                                    [image]="bank.bank?.logo || 'assets/default-bank.png'"
                                    size="xlarge"
                                    shape="circle"
                                    [style]="{'width': '5rem', 'height': '5rem', 'font-size': '2.5rem'}">
                                </p-avatar>
                                <p-badge
                                    *ngIf="bank.isActive"
                                    severity="success"
                                    icon="pi pi-check"
                                    styleClass="absolute bottom-0 right-0 transform translate-x-1/2 translate-y-1/2"></p-badge>
                            </div>

                            <div class="flex flex-col flex-grow text-center md:text-left">
                                <div class="text-3xl font-bold text-900">{{ bank.name }}</div>
                                <span class="text-secondary text-lg">{{ bank.description || 'No description provided.' }}</span>
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
                            <div *ngIf="!loading && bank" class="p-4">
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
    `,
    styles: [`
        :host { display: block; }
        .grid { margin-left: -0.5rem; margin-right: -0.5rem; }
        .col-12, .md\\:col-3, .md\\:col-9 { padding-left: 0.5rem; padding-right: 0.5rem; }
    `]
})
export class FinanceBankDetailComponent implements OnInit {
    bankId: string | null = null;
    bank: FinanceBank | undefined;

    // Updated sidebar items to include routerLink property
    sidebarItems: { label: string; icon: string; description: string; value: string; routerLink: string[] }[] = [];
    activeSection: string = 'overview'; // Tracks current section for header display
    loading: boolean = true;

    constructor(
        private route: ActivatedRoute,
        private router: Router, // Inject Router
        private financeService: PersonalFinanceService,
        private messageService: MessageService
    ) {}

    ngOnInit(): void {
        this.bankId = this.route.snapshot.paramMap.get('id');
        this.initSidebar();

        if (this.bankId) {
            this.loadBankDetails(this.bankId);
        } else {
            this.loading = false;
        }
    }

    // --- Data Loading ---

    loadBankDetails(id: string): void {
        this.loading = true;

        this.financeService.getFinanceBank(id)
            .subscribe({
                next: (response: any) => {
                    this.bank = response;
                    this.loading = false;
                    // Automatically navigate to the default nested route (Overview) after data loads
                    this.router.navigate(['overview'], { relativeTo: this.route });
                },
                error: (err: any) => {
                    console.error('Error loading bank details for ID:', id, err);
                    this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load bank details.' });
                    this.loading = false;
                }
            });
    }

    // --- Sidebar & Navigation Logic ---

    initSidebar(): void {
        const bankIdSegment = this.bankId || ':id';
        this.sidebarItems = [
            {
                label: 'Overview',
                icon: 'pi pi-chart-line',
                description: 'View a summary of account status and basic information.',
                value: 'overview',
                routerLink: ['overview']
            },
            {
                label: 'Accounts',
                icon: 'pi pi-wallet',
                description: 'Manage individual linked accounts (checking, savings, etc.).',
                value: 'accounts',
                routerLink: ['accounts']
            },
            {
                label: 'Transactions',
                icon: 'pi pi-history',
                description: 'View detailed transaction history and filters.',
                value: 'transactions',
                routerLink: ['transactions']
            },
            {
                label: 'Settings',
                icon: 'pi pi-cog',
                description: 'Configure bank preferences and integration settings.',
                value: 'settings',
                routerLink: ['settings']
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
