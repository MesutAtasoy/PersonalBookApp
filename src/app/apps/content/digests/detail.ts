import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { ActivatedRoute, RouterModule } from "@angular/router";
import { Subject, takeUntil, finalize, debounceTime, distinctUntilChanged } from "rxjs";

// PrimeNG
import { TabsModule } from 'primeng/tabs';
import { ButtonModule } from "primeng/button";
import { TagModule } from "primeng/tag";
import { SkeletonModule } from "primeng/skeleton";
import { PaginatorModule } from "primeng/paginator";
import { IconFieldModule } from "primeng/iconfield";
import { InputIconModule } from "primeng/inputicon";
import { InputTextModule } from "primeng/inputtext";
import { SelectModule } from "primeng/select";
import { TooltipModule } from "primeng/tooltip";

// Services & Types
import { ContentDigest, ContentDigestItem } from "@/apps/content/content.types";
import { PersonalContentService } from "@/apps/content/content.service";
import { PaginationFilter, SearchFilter } from "@/core/pagination/personal-book.pagination";

@Component({
    selector: 'app-content-digest-renderer',
    standalone: true,
    imports: [
        CommonModule, FormsModule, RouterModule, TooltipModule,
        TabsModule, ButtonModule, TagModule, SelectModule,
        SkeletonModule, PaginatorModule, IconFieldModule,
        InputIconModule, InputTextModule
    ],
    encapsulation: ViewEncapsulation.None,
    template: `
        <div class="flex flex-col h-full bg-slate-50 font-sans overflow-hidden">
            <div class="p-8 bg-white border-b border-slate-200 shrink-0">
                <div class="flex justify-between items-start max-w-7xl mx-auto w-full">
                    <div>
                        <div class="flex items-center gap-2 mb-2">
                            <button pButton icon="pi pi-arrow-left" class="p-button-text p-button-sm" routerLink="../.."></button>
                            <span class="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em]">Intelligence Report</span>
                        </div>
                        <h1 class="text-4xl font-black text-slate-900 tracking-tighter">{{ digest?.title }}</h1>
                        <p class="text-slate-500 font-medium">{{ digest?.digestDate | date:'fullDate' }} • Profile: {{ digest?.profileKey }}</p>
                    </div>

                    <div class="flex gap-4" *ngIf="digest?.stats">
                        <div class="px-6 py-3 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                            <div class="text-[10px] font-bold text-slate-400 uppercase">Avg Match</div>
                            <div class="text-xl font-black text-slate-800">{{ (digest?.stats?.averageRelevanceScore || 0) * 100 | number:'1.0-0' }}%</div>
                        </div>
                        <div class="px-6 py-3 bg-indigo-600 rounded-2xl text-center shadow-lg shadow-indigo-100">
                            <div class="text-[10px] font-bold text-indigo-200 uppercase text-white/70">Curated</div>
                            <div class="text-xl font-black text-white">{{ digest?.stats?.includedCount }}</div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="px-8 py-4 bg-white/50 border-b border-slate-200 backdrop-blur-md sticky top-0 z-10">
                <div class="max-w-7xl mx-auto flex justify-between items-center gap-4">
                    <p-icon-field iconPosition="left" class="flex-1 max-w-md">
                        <p-inputicon class="pi pi-search"></p-inputicon>
                        <input type="text" pInputText placeholder="Search within this digest..."
                               [(ngModel)]="searchText" (ngModelChange)="onSearchChange($event)"
                               class="w-full border-none bg-white rounded-xl py-3 text-sm font-bold shadow-sm"/>
                    </p-icon-field>

                    <div class="flex items-center gap-3">
                        <p-select [options]="sortOptions" [(ngModel)]="selectedSort"
                                  (onChange)="loadItems()"
                                  placeholder="Sort By"
                                  styleClass="border-none bg-white rounded-xl shadow-sm text-sm font-bold"></p-select>
                    </div>
                </div>
            </div>

            <div class="flex-1 overflow-y-auto p-8 custom-scrollbar bg-slate-50/50">
                <div class="max-w-5xl mx-auto space-y-6">

                    <div *ngIf="loading" class="space-y-6">
                        <div *ngFor="let i of [1,2,3]" class="p-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm">
                            <p-skeleton width="30%" height="1.5rem" styleClass="mb-4"></p-skeleton>
                            <p-skeleton width="100%" height="1rem" styleClass="mb-2"></p-skeleton>
                            <p-skeleton width="100%" height="1rem" styleClass="mb-4"></p-skeleton>
                            <div class="flex gap-2">
                                <p-skeleton width="80px" height="2rem" borderRadius="1rem"></p-skeleton>
                                <p-skeleton width="80px" height="2rem" borderRadius="1rem"></p-skeleton>
                            </div>
                        </div>
                    </div>

                    <div *ngFor="let item of items"
                         class="group bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-indigo-100/30 transition-all duration-500 relative overflow-hidden">

                        <div class="absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 bg-indigo-50 rounded-full flex items-end justify-start pl-6 pb-6 text-indigo-600 font-black text-xs group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-500"
                             [pTooltip]="'AI Relevance Score: ' + item.relevanceScore">
                            {{ item.relevanceScore | number:'1.0-0' }}%
                        </div>

                        <div class="flex flex-col gap-4">
                            <div class="flex items-center gap-3">
                                <p-tag [value]="item.topic" styleClass="bg-indigo-50 text-indigo-600 text-[9px] uppercase font-black px-3 border-none"></p-tag>
                                <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{{ item.sourceName }}</span>
                            </div>

                            <a [href]="item.url" target="_blank" class="no-underline">
                                <h2 class="text-2xl font-black text-slate-900 tracking-tight group-hover:text-indigo-600 transition-colors leading-tight">
                                    {{ item.title }}
                                </h2>
                            </a>

                            <p class="text-slate-600 leading-relaxed font-medium">
                                {{ item.summary }}
                            </p>

                            <div class="flex flex-wrap items-center gap-4 mt-2 pt-4 border-t border-slate-50">
                                <div class="flex items-center gap-2">
                                    <span class="text-[10px] font-black text-slate-300 uppercase">Quality:</span>
                                    <p-tag [value]="item.quality" [severity]="item.quality === 'High' ? 'success' : 'secondary'" styleClass="text-[9px] font-black uppercase"></p-tag>
                                </div>
                                <div class="flex items-center gap-2">
                                    <span class="text-[10px] font-black text-slate-300 uppercase tracking-tighter italic">"{{ item.decisionReason }}"</span>
                                </div>
                                <button pButton icon="pi pi-external-link" label="Source" class="p-button-text p-button-sm ml-auto font-black text-indigo-500"></button>
                            </div>
                        </div>
                    </div>

                    <div *ngIf="!loading && items.length === 0" class="text-center py-20">
                        <i class="pi pi-search-minus text-5xl text-slate-200 mb-4"></i>
                        <h3 class="text-xl font-bold text-slate-800">No items match your filters</h3>
                    </div>
                </div>
            </div>

            <div class="p-6 bg-white border-t border-slate-200 flex justify-center shrink-0">
                <p-paginator [rows]="pagination.pageSize" [totalRecords]="totalRecords"
                             [rowsPerPageOptions]="[10, 20, 50]" (onPageChange)="onPageChange($event)"
                             styleClass="bg-transparent border-none"></p-paginator>
            </div>
        </div>
    `,
    styles: [`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
    `],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContentDigestComponent implements OnInit, OnDestroy {
    digestId: string = '';
    digest?: ContentDigest;
    items: ContentDigestItem[] = [];

    loading: boolean = true;
    searchText: string = '';
    totalRecords: number = 0;

    pagination: PaginationFilter = { pageNumber: 1, pageSize: 10 };
    sortOptions = [
        { label: 'Highest Score', value: 'relevanceScore,desc' },
        { label: 'Newest First', value: 'createdDate,desc' },
        { label: 'Topic A-Z', value: 'topic,asc' }
    ];
    selectedSort: string = 'relevanceScore,desc';

    private _searchSubject = new Subject<string>();
    private _unsubscribeAll = new Subject<any>();

    constructor(
        private _route: ActivatedRoute,
        private _contentService: PersonalContentService,
        private _cdr: ChangeDetectorRef
    ) {}

    ngOnInit(): void {
        this.digestId = this._route.snapshot.params['id'];

        // Load Header metadata
        this._contentService.getContentDigest(this.digestId)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(res => {
                this.digest = (res as any).payload || res;
                this._cdr.markForCheck();
            });

        // Setup Search
        this._searchSubject.pipe(
            debounceTime(400),
            distinctUntilChanged(),
            takeUntil(this._unsubscribeAll)
        ).subscribe(() => {
            this.pagination.pageNumber = 1;
            this.loadItems();
        });

        this.loadItems();
    }

    loadItems(): void {
        this.loading = true;
        const [column, direction] = this.selectedSort.split(',');

        const filter: any = {
            paginationFilter: this.pagination,
            search: { value: this.searchText },
            // order: { column, direction: direction as any },
            contentDigestId : this.digestId
        };

        // We assume your searchContentDigestItems is modified to accept a specific contentDigestId
        // or it's part of the filter logic.
        this._contentService.searchContentDigestItems(filter)
            .pipe(
                takeUntil(this._unsubscribeAll),
                finalize(() => {
                    this.loading = false;
                    this._cdr.markForCheck();
                })
            )
            .subscribe((res: any) => {
                this.items = res.payload?.data || res || [];
                this.totalRecords = res.payload?.totalRecords || this.items.length;
            });
    }

    onSearchChange(v: string): void { this._searchSubject.next(v); }

    onPageChange(event: any): void {
        this.pagination.pageNumber = event.page + 1;
        this.pagination.pageSize = event.rows;
        this.loadItems();
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }
}
