import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Subject, takeUntil, finalize, debounceTime, distinctUntilChanged } from "rxjs";

// PrimeNG
import { DataViewModule } from 'primeng/dataview';
import { ButtonModule } from "primeng/button";
import { InputTextModule } from "primeng/inputtext";
import { TagModule } from "primeng/tag";
import { SkeletonModule } from "primeng/skeleton";
import { PaginatorModule } from "primeng/paginator";
import { MenuModule } from "primeng/menu";
import { TooltipModule } from "primeng/tooltip";
import { IconFieldModule } from "primeng/iconfield";
import { InputIconModule } from "primeng/inputicon";
import { MenuItem, MessageService } from "primeng/api";

// Services & Types
import { ContentDigest } from "@/apps/content/content.types";
import { PersonalContentService } from "@/apps/content/content.service";
import { PaginationFilter, SearchFilter } from "@/core/pagination/personal-book.pagination";
import {Router} from "@angular/router";

@Component({
    selector: 'app-content-digest-list',
    standalone: true,
    imports: [
        CommonModule, FormsModule, DataViewModule, ButtonModule, InputTextModule,
        TagModule, SkeletonModule, PaginatorModule, MenuModule, TooltipModule,
        IconFieldModule, InputIconModule
    ],
    providers: [MessageService],
    template: `
        <div class="flex flex-col h-full bg-slate-50 font-sans overflow-hidden">
            <div class="p-8 bg-white border-b border-slate-200 flex justify-between items-center shrink-0">
                <div>
                    <h1 class="text-4xl font-black text-slate-900 tracking-tighter">Digested Intelligence</h1>
                    <p class="text-slate-500 font-medium mt-1">Daily AI-curated summaries and performance metrics.</p>
                </div>
                <div class="flex gap-3">
                    <p-icon-field iconPosition="left">
                        <p-inputicon class="pi pi-search"></p-inputicon>
                        <input type="text" pInputText placeholder="Search digests..."
                               [(ngModel)]="searchText" (ngModelChange)="onSearchChange($event)"
                               class="w-72 border-none bg-slate-100 rounded-2xl py-3 text-sm font-bold"/>
                    </p-icon-field>
                </div>
            </div>

            <div class="flex-1 overflow-y-auto p-8 custom-scrollbar">
                <div class="max-w-7xl mx-auto">

                    <div *ngIf="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div *ngFor="let i of [1,2,3,4,5,6]" class="bg-white p-6 rounded-[2.5rem] border border-slate-100">
                            <p-skeleton width="60%" height="1.5rem" styleClass="mb-4"></p-skeleton>
                            <p-skeleton width="40%" styleClass="mb-6"></p-skeleton>
                            <div class="flex gap-2">
                                <p-skeleton width="30%" height="2rem" borderRadius="1rem"></p-skeleton>
                                <p-skeleton width="30%" height="2rem" borderRadius="1rem"></p-skeleton>
                            </div>
                        </div>
                    </div>

                    <p-dataView *ngIf="!loading" [value]="digests" layout="grid">
                        <ng-template #grid let-items>
                            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <div *ngFor="let digest of items" class="pb-digest-card group">
                                    <div class="bg-white p-7 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-indigo-100 transition-all duration-300 relative overflow-hidden h-full flex flex-col">

                                        <div class="flex justify-between items-start mb-4">
                                            <div class="flex flex-col">
                                                <span class="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em]">
                                                    {{ digest.digestDate | date:'EEEE, MMM d' }}
                                                </span>
                                                <h2 class="text-xl font-black text-slate-800 leading-tight mt-1">{{ digest.title }}</h2>
                                            </div>
                                            <button pButton icon="pi pi-ellipsis-h"
                                                    class="p-button-text p-button-secondary p-button-rounded"
                                                    (click)="toggleMenu($event, menu, digest)"></button>
                                        </div>

                                        <div class="flex flex-wrap gap-2 mb-6" *ngIf="digest.stats">
                                            <p-tag [value]="digest.stats.includedCount + ' Included'" severity="success"
                                                   styleClass="text-[9px] font-black uppercase px-3 bg-emerald-50 text-emerald-600 border-none"></p-tag>
                                            <p-tag [value]="digest.stats.rejectedCount + ' Filtered'" severity="secondary"
                                                   styleClass="text-[9px] font-black uppercase px-3 bg-slate-100 text-slate-500 border-none"></p-tag>
                                            <p-tag [value]="(digest.stats.averageRelevanceScore * 100 | number:'1.0-0') + '% Match'"
                                                   styleClass="text-[9px] font-black uppercase px-3 bg-indigo-50 text-indigo-600 border-none"></p-tag>
                                        </div>

                                        <div class="mt-auto pt-6 border-t border-slate-50 flex justify-between items-center">
                                            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                                                ID: {{ digest.profileKey }}
                                            </span>
                                            <button pButton label="Read Digest" icon="pi pi-chevron-right" iconPos="right"
                                                    class="p-button-text p-button-sm font-black text-indigo-600 p-0 hover:translate-x-1 transition-transform" (click)="readDigest(digest)"></button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </ng-template>
                    </p-dataView>
                </div>
            </div>

            <div class="p-4 shrink-0 flex justify-center">
                <p-paginator [rows]="pagination.pageSize" [totalRecords]="totalRecords"
                             [rowsPerPageOptions]="[12, 24, 48]" (onPageChange)="onPageChange($event)"
                             class="bg-transparent border-none"></p-paginator>
            </div>
        </div>

        <p-menu #menu [model]="menuItems" [popup]="true" appendTo="body"></p-menu>
    `,
    styles: [`
        .pb-digest-card:hover { transform: translateY(-4px); }
        :host ::ng-deep {
            .p-dataview .p-dataview-content { background: transparent; }
            .p-paginator .p-paginator-pages .p-paginator-page.p-highlight { background: #6366f1; color: white; border-radius: 14px; }
        }
    `],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContentDigestListComponent implements OnInit, OnDestroy {
    digests: ContentDigest[] = [];
    totalRecords: number = 0;
    loading: boolean = true;
    searchText: string = '';

    pagination: PaginationFilter = { pageNumber: 1, pageSize: 12 };
    menuItems: MenuItem[] = [];
    selectedDigest: ContentDigest | null = null;

    private _searchSubject: Subject<string> = new Subject<string>();
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _contentService: PersonalContentService,
        private _cdr: ChangeDetectorRef,
        public _router: Router,
    ) {}

    ngOnInit(): void {
        this.initializeMenu();

        this._searchSubject.pipe(
            debounceTime(400),
            distinctUntilChanged(),
            takeUntil(this._unsubscribeAll)
        ).subscribe(() => {
            this.pagination.pageNumber = 1;
            this.loadDigests();
        });

        this.loadDigests();
    }

    initializeMenu(): void {
        this.menuItems = [
            { label: 'View Analytics', icon: 'pi pi-chart-bar', command: () => this.viewStats() },
            { label: 'Export PDF', icon: 'pi pi-file-pdf', command: () => {} },
            { separator: true },
            { label: 'Re-generate', icon: 'pi pi-refresh', command: () => {} },
            { label: 'Delete', icon: 'pi pi-trash', styleClass: 'text-red-500' }
        ];
    }

    loadDigests(): void {
        this.loading = true;
        const filter: SearchFilter = {
            paginationFilter: this.pagination,
            search: { value: this.searchText },

        };

        this._contentService.searchContentDigest(filter)
            .pipe(
                takeUntil(this._unsubscribeAll),
                finalize(() => {
                    this.loading = false;
                    this._cdr.markForCheck();
                })
            )
            .subscribe((res: any) => {
                this.digests = res.payload?.data || res || [];
                this.totalRecords = res.payload?.totalRecords || this.digests.length;
                this._cdr.markForCheck();
            });
    }

    toggleMenu(event: any, menu: any, digest: ContentDigest): void {
        this.selectedDigest = digest;
        menu.toggle(event);
    }

    viewStats(): void {
        if (this.selectedDigest?.stats) {
            console.log('Category Breakdown:', this.selectedDigest.stats.categoryBreakdown);
        }
    }

    onPageChange(event: any): void {
        this.pagination.pageNumber = event.page + 1;
        this.pagination.pageSize = event.rows;
        this.loadDigests();
    }

    onSearchChange(v: string): void {
        this._searchSubject.next(v);
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    readDigest(digest : ContentDigest){
        this._router.navigate(['apps/content/digests/' + digest.id + '/detail']);
    }
}
