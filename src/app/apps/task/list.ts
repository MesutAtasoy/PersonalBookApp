import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit} from "@angular/core";
import {CommonModule} from "@angular/common";
import {FormsModule} from "@angular/forms";
import {Router} from "@angular/router";
import {debounceTime, distinctUntilChanged, finalize, Subject, takeUntil} from "rxjs";

// PrimeNG Modules
import {CheckboxModule} from "primeng/checkbox";
import {ButtonModule} from "primeng/button";
import {InputTextModule} from "primeng/inputtext";
import {EditorModule} from "primeng/editor";
import {DatePickerModule} from "primeng/datepicker";
import {TagModule} from "primeng/tag";
import {ToastModule} from "primeng/toast";
import {SkeletonModule} from "primeng/skeleton";
import {ConfirmDialogModule} from "primeng/confirmdialog";
import {PaginatorModule} from "primeng/paginator";
import {SelectModule} from "primeng/select";
import {DialogModule} from "primeng/dialog";
import {InputIcon} from "primeng/inputicon";
import {IconField} from "primeng/iconfield";
import {TooltipModule} from "primeng/tooltip";
import {MultiSelectModule} from "primeng/multiselect";
import {ConfirmationService, MessageService} from "primeng/api";

// Internal Services & Models
import {TasksService} from "@/apps/task/tasks.service";
import {PaginationFilter, SearchFilter} from "@/core/pagination/personal-book.pagination";

export interface Tag {
    id: string;
    title: string;
    color?: string;
}

export interface Task {
    id?: string;
    title?: string;
    notes?: string;
    completed?: boolean;
    startDate?: string | Date | null;
    dueDate?: string | Date | null;
    priority?: 0 | 1 | 2 | number;
    tagId: string | null;
}

@Component({
    selector: 'app-tasks',
    standalone: true,
    imports: [
        CommonModule, FormsModule, CheckboxModule, ButtonModule,
        InputTextModule, EditorModule, DatePickerModule,
        TagModule, ToastModule, SkeletonModule, ConfirmDialogModule,
        PaginatorModule, SelectModule, DialogModule, InputIcon,
        IconField, TooltipModule, MultiSelectModule
    ],
    providers: [MessageService, ConfirmationService],
    template: `
        <p-toast position="bottom-right"></p-toast>
        <p-confirmDialog></p-confirmDialog>

        <p-dialog [(visible)]="displayDialog"
                  [header]="editingTask?.id ? 'Edit Task Details' : 'Create New Task'"
                  [modal]="true"
                  [style]="{width: '800px'}"
                  [draggable]="false"
                  [resizable]="false"
                  [maximizable]="true"
                  class="task-management-dialog">

            <div class="flex flex-col gap-6 py-4" *ngIf="editingTask">
                <div class="flex flex-col gap-2">
                    <label class="text-xs font-black text-slate-400 uppercase tracking-widest">Headline</label>
                    <input type="text" pInputText [(ngModel)]="editingTask.title"
                           placeholder="Enter task title..."
                           class="w-full p-4 bg-slate-50 border-none rounded-2xl text-xl font-bold"/>
                </div>

                <div class="grid grid-cols-3 gap-4">
                    <div class="flex flex-col gap-2">
                        <label class="text-xs font-black text-slate-400 uppercase tracking-widest">Priority</label>
                        <div class="flex gap-1">
                            <button *ngFor="let p of [0,1,2]" (click)="editingTask.priority = p"
                                    [ngClass]="editingTask.priority === p ? getPriorityColor(p) : 'bg-slate-100 text-slate-400'"
                                    class="flex-1 py-3 rounded-xl text-[10px] font-black border-none cursor-pointer uppercase transition-all">
                                {{ getPriorityLabel(p) }}
                            </button>
                        </div>
                    </div>
                    <div class="flex flex-col gap-2">
                        <label class="text-xs font-black text-slate-400 uppercase tracking-widest">Start Date</label>
                        <p-date-picker [(ngModel)]="editingTask.startDate" appendTo="body" [showIcon]="true"
                                       styleClass="w-full"
                                       inputStyleClass="border-none bg-slate-50 rounded-xl p-3 text-sm font-bold"></p-date-picker>
                    </div>
                    <div class="flex flex-col gap-2">
                        <label class="text-xs font-black text-slate-400 uppercase tracking-widest">Due Date</label>
                        <p-date-picker [(ngModel)]="editingTask.dueDate" appendTo="body" [showIcon]="true"
                                       styleClass="w-full"
                                       inputStyleClass="border-none bg-slate-50 rounded-xl p-3 text-sm font-bold"></p-date-picker>
                    </div>
                </div>

                <div class="flex flex-col gap-2">
                    <label class="text-xs font-black text-slate-400 uppercase tracking-widest">Tags / Categories</label>
                    <p-select [options]="availableTags" [(ngModel)]="editingTask.tagId"
                              optionLabel="title" optionValue="id"
                              placeholder="Assign tags to this task..." display="chip"
                              styleClass="w-full border-none bg-slate-50 rounded-2xl p-2 text-sm font-bold">
                        <ng-template let-tag pTemplate="item">
                            <div class="flex items-center gap-2">
                                <div class="w-3 h-3 rounded-full"
                                     [style.backgroundColor]="tag.color || '#cbd5e1'"></div>
                                <span>{{ tag.title }}</span>
                            </div>
                        </ng-template>
                    </p-select>
                </div>

                <div class="flex flex-col gap-2">
                    <label class="text-xs font-black text-slate-400 uppercase tracking-widest">Documentation
                        (HTML)</label>
                    <p-editor [(ngModel)]="editingTask.notes" [style]="{ height: '320px' }"
                              styleClass="border-none bg-slate-50 rounded-2xl overflow-hidden shadow-inner">
                    </p-editor>
                </div>
            </div>

            <ng-template pTemplate="footer">
                <button pButton label="Discard" class="p-button-text p-button-secondary font-bold"
                        (click)="displayDialog = false"></button>
                <button pButton label="Save Changes" class="p-button-primary px-8 rounded-xl font-bold"
                        [loading]="isSaving" (click)="onSaveTask()"></button>
            </ng-template>
        </p-dialog>

        <div class="flex h-screen w-full bg-white overflow-hidden font-sans">

            <div class="flex flex-col w-[420px] border-r border-slate-200 shrink-0 bg-slate-50/50">
                <div class="p-6 bg-white border-b border-slate-200 space-y-4">
                    <div class="flex justify-between items-center">
                        <h1 class="text-2xl font-black text-slate-900 tracking-tight">Inbox</h1>
                        <div class="flex items-center gap-2">
                            <button (click)="goToTags()" pTooltip="Manage Tags" tooltipPosition="bottom"
                                    class="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 flex items-center justify-center border border-slate-100 cursor-pointer transition-all">
                                <i class="pi pi-tags text-sm"></i>
                            </button>
                            <button (click)="openCreateDialog()"
                                    class="w-10 h-10 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white border-none cursor-pointer flex items-center justify-center shadow-lg shadow-indigo-100 transition-all">
                                <i class="pi pi-plus"></i>
                            </button>
                        </div>
                    </div>

                    <div class="space-y-2">
                        <p-icon-field iconPosition="left">
                            <p-inputicon class="pi pi-search"/>
                            <input type="text" pInputText [(ngModel)]="searchText"
                                   (ngModelChange)="onSearchChange($event)"
                                   placeholder="Search archive..."
                                   class="w-full pl-10 bg-slate-100 border-none rounded-xl py-3 text-sm"/>
                        </p-icon-field>

                        <div class="grid grid-cols-2 gap-2">
                            <p-select [options]="sortOptions" [(ngModel)]="selectedSort" (onChange)="onSortChange()"
                                      optionLabel="label"
                                      styleClass="w-full bg-slate-100 border-none rounded-xl text-xs"></p-select>

                            <p-select [options]="availableTags" [(ngModel)]="selectedTagFilters"
                                      (onChange)="loadTasks()" [showClear]="'true'"
                                      optionLabel="title" optionValue="id" placeholder="Filter Tags" display="chip"
                                      styleClass="w-full bg-slate-100 border-none rounded-xl text-xs"
                            >
                            </p-select>
                        </div>
                    </div>
                </div>

                <div class="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                    <ng-container *ngIf="loading">
                        <div *ngFor="let i of [1,2,3,4,5,6]"
                             class="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                            <p-skeleton width="60%" height="1.2rem" styleClass="mb-3"></p-skeleton>
                            <p-skeleton width="30%" height="0.7rem"></p-skeleton>
                        </div>
                    </ng-container>

                    <div *ngIf="!loading">
                        <div *ngFor="let task of tasks" (click)="selectTask(task)"
                             [ngClass]="selectedTask?.id === task.id ? 'ring-2 ring-indigo-600 bg-white shadow-xl translate-x-1' : 'bg-white border-slate-100 shadow-sm'"
                             class="group p-5 rounded-2xl border cursor-pointer transition-all animate-fade-in mb-3">
                            <div class="flex items-start gap-4">
                                <div (click)="$event.stopPropagation()" class="mt-0.5">
                                    <p-checkbox [(ngModel)]="task.completed" [binary]="true"
                                                (onChange)="onToggleComplete(task)"></p-checkbox>
                                </div>
                                <div class="flex-1 min-w-0">
                                    <h3 [ngClass]="{'line-through text-slate-300': task.completed, 'text-slate-800 font-bold': !task.completed}"
                                        class="text-sm truncate mb-1">{{ task.title }}</h3>

                                    <div class="flex flex-wrap gap-1 mb-2" *ngIf="task.tagId">
                                        <span [style.backgroundColor]="getTag(task.tagId)?.color || '#e2e8f0'"
                                              [style.color]="getTextColor(getTag(task.tagId)?.color)"
                                              class="text-[7px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter">
                                            {{ getTag(task.tagId)?.title }}
                                        </span>
                                    </div>

                                    <div class="flex items-center gap-2">
                                        <p-tag [severity]="getPrioritySeverity(task.priority)"
                                               [value]="getPriorityLabel(task.priority)"
                                               styleClass="text-[8px] font-black"></p-tag>
                                        <span
                                            class="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{{ task.dueDate | date:'MMM d' }}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="bg-white border-t border-slate-100 p-2 shrink-0">
                    <p-paginator [rows]="pagination.pageSize" [totalRecords]="totalRecords"
                                 (onPageChange)="onPageChange($event)"
                                 styleClass="border-none bg-transparent scale-90"></p-paginator>
                </div>
            </div>

            <div class="flex-1 flex flex-col bg-white overflow-hidden relative">
                <ng-container *ngIf="selectedTask; else emptyState">
                    <div class="h-24 px-12 border-b border-slate-50 flex items-center justify-between shrink-0">
                        <div class="flex flex-col">
                            <span class="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-1">Documentation Viewer</span>
                            <div class="flex items-center gap-2 text-slate-400 text-xs font-medium"><i
                                class="pi pi-info-circle"></i> View mode
                            </div>
                        </div>
                        <div class="flex items-center gap-3">
                            <button (click)="onDeleteTask(selectedTask.id)"
                                    class="w-10 h-10 rounded-full text-slate-300 hover:text-red-500 border-none cursor-pointer">
                                <i class="pi pi-trash text-lg"></i></button>
                            <button (click)="openEditDialog(selectedTask)"
                                    class="bg-slate-900 text-white px-8 py-3 rounded-xl text-xs font-black border-none cursor-pointer">
                                EDIT TASK
                            </button>
                        </div>
                    </div>

                    <div class="flex-1 overflow-y-auto p-16 custom-scrollbar animate-fade-in">
                        <div class="max-w-3xl mx-auto space-y-12">
                            <h1 class="text-6xl font-black text-slate-900 tracking-tighter leading-[1.1]">{{ selectedTask.title }}</h1>

                            <div class="grid grid-cols-3 gap-10 py-8 border-y border-slate-100">
                                <div class="space-y-1">
                                    <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                        Priority</p>
                                    <p-tag [severity]="getPrioritySeverity(selectedTask.priority)"
                                           [value]="getPriorityLabel(selectedTask.priority)"
                                           styleClass="font-black px-3"></p-tag>
                                </div>
                                <div class="space-y-1 border-l pl-10">
                                    <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Started
                                        On</p>
                                    <p class="text-lg font-bold text-slate-700">{{ (selectedTask.startDate | date:'MMMM d, yyyy') || 'N/A' }}</p>
                                </div>
                                <div class="space-y-1 border-l pl-10">
                                    <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Due
                                        Date</p>
                                    <p class="text-lg font-bold text-slate-700">{{ (selectedTask.dueDate | date:'MMMM d, yyyy') || 'No date set' }}</p>
                                </div>

                                <div class="col-span-3 pt-6 border-t border-slate-50">
                                    <p class="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-3">
                                        Associated Tags</p>
                                    <div class="flex flex-wrap gap-2">
                                        <span *ngIf="selectedTask.tagId"
                                              [style.backgroundColor]="getTag(selectedTask.tagId)?.color || '#f1f5f9'"
                                              [style.color]="getTextColor(getTag(selectedTask.tagId)?.color)"
                                              class="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">
                                            {{ getTag(selectedTask.tagId)?.title }}
                                        </span>
                                        <span *ngIf="!selectedTask.tagId" class="text-slate-300 text-xs italic font-medium">No tags assigned.</span>
                                    </div>
                                </div>
                            </div>

                            <div class="space-y-6">
                                <label class="text-[10px] font-black text-slate-300 uppercase tracking-widest">Notes &
                                    Description</label>
                                <div *ngIf="selectedTask.notes; else noNotesTemplate" [innerHTML]="selectedTask.notes"
                                     class="html-content-view text-xl leading-relaxed text-slate-600"></div>
                                <ng-template #noNotesTemplate>
                                    <div
                                        class="p-10 rounded-3xl bg-slate-50 border-2 border-dashed border-slate-100 text-center text-slate-400 italic">
                                        No documentation content available.
                                    </div>
                                </ng-template>
                            </div>
                        </div>
                    </div>
                </ng-container>

                <ng-template #emptyState>
                    <div class="flex-1 flex flex-col items-center justify-center p-20 text-center" *ngIf="!loading">
                        <div class="w-32 h-32 rounded-full bg-slate-50 flex items-center justify-center mb-8"><i
                            class="pi pi-mouse-pointer text-5xl text-slate-200"></i></div>
                        <h2 class="text-2xl font-black text-slate-300 uppercase tracking-[0.2em]">Ready for Work</h2>
                        <p class="text-slate-400 mt-3 text-sm">Select a task from your inbox to view detailed
                            documentation.</p>
                    </div>
                </ng-template>
            </div>
        </div>
    `,
    styles: [`
        :host ::ng-deep {
            .p-dialog .p-dialog-header {
                border-bottom: 1px solid #f8fafc;
                padding: 2rem;
                background: #fff;
                border-top-left-radius: 24px;
                border-top-right-radius: 24px;
            }

            .p-dialog .p-dialog-footer {
                padding: 1.5rem 2rem;
                border-top: 1px solid #f8fafc;
                border-bottom-left-radius: 24px;
                border-bottom-right-radius: 24px;
            }

            .p-editor-container .p-editor-toolbar {
                border: none !important;
                background: #f1f5f9 !important;
                border-top-left-radius: 16px;
                border-top-right-radius: 16px;
            }

            .p-editor-container .p-editor-content {
                border: none !important;
                background: #f1f5f9 !important;
                border-bottom-left-radius: 16px;
                border-bottom-right-radius: 16px;
                font-size: 16px;
            }

            .p-checkbox .p-checkbox-box {
                border-radius: 8px;
                width: 22px;
                height: 22px;
                border: 2px solid #e2e8f0;
            }

            .p-checkbox .p-checkbox-box.p-highlight {
                background: #4f46e5;
                border-color: #4f46e5;
            }

            .p-tooltip .p-tooltip-text {
                font-size: 10px;
                font-weight: 800;
                text-transform: uppercase;
                background: #1e293b;
            }

            .p-multiselect {
                border: none !important;
            }

            .html-content-view h1 {
                font-size: 2.5rem;
                margin-bottom: 1.5rem;
                font-weight: 800;
            }

            .html-content-view p {
                margin-bottom: 1.25rem;
                line-height: 1.8;
            }
        }

        .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #e2e8f0;
            border-radius: 10px;
        }

        .animate-fade-in {
            animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes fadeIn {
            from {
                opacity: 0;
                transform: translateY(10px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
    `],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaskListComponent implements OnInit, OnDestroy {
    tasks: Task[] = [];
    availableTags: Tag[] = [];
    selectedTask: Task | null = null;
    loading: boolean = true;
    isSaving: boolean = false;
    displayDialog: boolean = false;
    editingTask: Task | null = null;
    searchText: string = '';
    totalRecords: number = 0;
    pagination: PaginationFilter = {pageNumber: 1, pageSize: 10};
    selectedTagFilters: string | null = null;

    sortOptions = [
        {label: 'Name (A-Z)', field: 'title', dir: 'asc'},
        {label: 'Name (Z-A)', field: 'title', dir: 'desc'},
        {label: 'Priority', field: 'priority', dir: 'desc'},
        {label: 'Due Date', field: 'dueDate', dir: 'asc'}
    ];
    selectedSort: any = this.sortOptions[0];

    private _searchSubject: Subject<string> = new Subject<string>();
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _router: Router,
        private _tasksService: TasksService,
        private _cdr: ChangeDetectorRef,
        private _messageService: MessageService,
        private _confirmationService: ConfirmationService
    ) {
    }

    ngOnInit(): void {
        this.fetchTags();
        this._searchSubject.pipe(debounceTime(400), distinctUntilChanged(), takeUntil(this._unsubscribeAll))
            .subscribe(() => {
                this.pagination.pageNumber = 1;
                this.loadTasks();
            });
        this.loadTasks();
    }

    fetchTags(): void {
        this._tasksService.getTags().pipe(takeUntil(this._unsubscribeAll)).subscribe((res: any) => {
            this.availableTags = res.payload || [];
            this._cdr.markForCheck();
        });
    }

    goToTags(): void {
        this._router.navigate(['apps/tasks/tags']);
    }

    getTextColor(bgColor: string | undefined): string {
        if (!bgColor) return '#64748b';
        const color = bgColor.charAt(0) === '#' ? bgColor.substring(1, 7) : bgColor;
        const r = parseInt(color.substring(0, 2), 16);
        const g = parseInt(color.substring(2, 4), 16);
        const b = parseInt(color.substring(4, 6), 16);
        const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
        return (yiq >= 128) ? '#1e293b' : '#ffffff';
    }

    getTag(id: string): Tag | undefined {
        return this.availableTags.find(x => x.id === id);
    }

    loadTasks(): void {

        this.loading = true;
        const filter: any = {
            paginationFilter: this.pagination,
            search: {value: this.searchText},
            order: {column: this.selectedSort.field, direction: this.selectedSort.dir},
            tagId: this.selectedTagFilters
        };
        this._tasksService.searchTasks(filter).pipe(takeUntil(this._unsubscribeAll), finalize(() => {
            this.loading = false;
            this._cdr.markForCheck();
        }))
            .subscribe((res: any) => {
                this.tasks = res.payload?.data || [];
                this.totalRecords = res.payload?.totalRecords || 0;
                this._cdr.markForCheck();
            });
    }

    selectTask(task: Task): void {
        this.selectedTask = {
            ...task,
            startDate: task.startDate ? new Date(task.startDate) : null,
            dueDate: task.dueDate ? new Date(task.dueDate) : null
        };
        this._cdr.markForCheck();
    }

    openCreateDialog(): void {
        this.editingTask = {
            title: '',
            priority: 0,
            completed: false,
            notes: '',
            startDate: null,
            dueDate: null,
            tagId: null
        };
        this.displayDialog = true;
    }

    openEditDialog(task: Task): void {
        this.editingTask = {
            ...task,
            startDate: task.startDate ? new Date(task.startDate) : null,
            dueDate: task.dueDate ? new Date(task.dueDate) : null,
            tagId: task.tagId
        };
        this.displayDialog = true;
    }

    onSaveTask(): void {
        if (!this.editingTask?.title) return;
        this.isSaving = true;
        const request = this.editingTask.id ? this._tasksService.updateTask(this.editingTask.id, this.editingTask) : this._tasksService.createNewTask(this.editingTask);
        request.pipe(finalize(() => {
            this.isSaving = false;
            this._cdr.markForCheck();
        })).subscribe(() => {
            this._messageService.add({severity: 'success', summary: 'Saved'});
            this.displayDialog = false;
            this.loadTasks();
        });
    }

    onSearchChange(v: string): void {
        this._searchSubject.next(v);
    }

    onSortChange(): void {
        this.pagination.pageNumber = 1;
        this.loadTasks();
    }

    onPageChange(e: any): void {
        this.pagination.pageNumber = e.page + 1;
        this.pagination.pageSize = e.rows;
        this.loadTasks();
    }

    onToggleComplete(task: Task): void {
        this._tasksService.updateTask(task.id!, task).subscribe();
    }

    onDeleteTask(id: any): void {
        this._confirmationService.confirm({
            header: 'Delete Task', message: 'Permanently remove this task?',
            acceptButtonStyleClass: 'p-button-danger rounded-xl',
            accept: () => {
                this._tasksService.deleteTask(id).subscribe(() => {
                    this._messageService.add({severity: 'info', summary: 'Deleted'});
                    if (this.selectedTask?.id === id) this.selectedTask = null;
                    this.loadTasks();
                });
            }
        });
    }

    getPriorityLabel(p: any): string {
        return p === 2 ? 'High' : (p === 1 ? 'Medium' : 'Low');
    }

    getPrioritySeverity(p: any): any {
        return p === 2 ? 'danger' : (p === 1 ? 'warning' : 'info');
    }

    getPriorityColor(p: any): string {
        return p === 2 ? 'bg-red-500 text-white' : (p === 1 ? 'bg-amber-500 text-white' : 'bg-indigo-500 text-white');
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }
}
