import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from "@angular/core";
import { Subject, takeUntil, finalize } from 'rxjs';

// PrimeNG
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ColorPickerModule } from 'primeng/colorpicker';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { SkeletonModule } from 'primeng/skeleton';
import { MessageService, ConfirmationService } from 'primeng/api';
import { TagModule } from 'primeng/tag';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';

// Internal
import { TasksService } from "@/apps/task/tasks.service";

export interface Tag {
    id?: string;
    title?: string;
    color?: string;
}

@Component({
    selector: 'app-tags',
    standalone: true,
    imports: [
        CommonModule, FormsModule, ButtonModule, InputTextModule,
        ColorPickerModule, DialogModule, ToastModule, ConfirmDialogModule,
        SkeletonModule, TagModule, IconField, InputIcon
    ],
    providers: [MessageService, ConfirmationService],
    template: `
        <p-toast position="bottom-right"></p-toast>
        <p-confirmDialog></p-confirmDialog>

        <div class="p-8 max-w-6xl mx-auto min-h-screen bg-white">
            <div class="flex justify-between items-end mb-10">
                <div>
                    <h1 class="text-4xl font-black text-slate-900 tracking-tight">Labels & Tags</h1>
                    <p class="text-slate-500 font-medium mt-1">Organize your tasks with custom categories and colors.</p>
                </div>
                <button pButton icon="pi pi-plus" label="Create New Tag"
                        class="p-button-primary rounded-xl px-6 py-3 font-bold shadow-lg shadow-indigo-100"
                        (click)="openDialog()"></button>
            </div>

            <div class="flex gap-4 mb-8">
                <p-icon-field iconPosition="left" class="flex-1">
                    <p-inputicon class="pi pi-search" />
                    <input type="text" pInputText [(ngModel)]="filterQuery"
                           placeholder="Filter tags by name..."
                           class="w-full border-slate-200 rounded-xl bg-slate-50/50 py-3 pl-10" />
                </p-icon-field>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <ng-container *ngIf="loading">
                    <div *ngFor="let i of [1,2,3,4,5,6]" class="p-6 border border-slate-100 rounded-2xl">
                        <p-skeleton width="60%" height="1.5rem" styleClass="mb-4"></p-skeleton>
                        <p-skeleton width="30%" height="1rem"></p-skeleton>
                    </div>
                </ng-container>

                <ng-container *ngIf="!loading">
                    <div *ngFor="let tag of filteredTags"
                         class="group p-1 border border-slate-100 rounded-2xl bg-white hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-50/50 transition-all">
                        <div class="p-5 flex items-center justify-between">
                            <div class="flex items-center gap-4 min-w-0">
                                <div class="w-10 h-10 rounded-xl shrink-0" [style.backgroundColor]="tag.color || '#cbd5e1'"></div>
                                <div class="truncate">
                                    <h3 class="font-bold text-slate-800 truncate">{{ tag.title }}</h3>
                                    <span class="text-[10px] font-black uppercase text-slate-400 tracking-widest">{{ tag.color }}</span>
                                </div>
                            </div>
                            <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button pButton icon="pi pi-pencil" class="p-button-text p-button-secondary p-button-sm" (click)="openDialog(tag)"></button>
                                <button pButton icon="pi pi-trash" class="p-button-text p-button-danger p-button-sm" (click)="onDelete(tag)"></button>
                            </div>
                        </div>
                    </div>
                </ng-container>
            </div>

            <div *ngIf="!loading && filteredTags.length === 0" class="py-24 text-center">
                <div class="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i class="pi pi-tag text-3xl text-slate-300"></i>
                </div>
                <h3 class="text-lg font-bold text-slate-800">No tags found</h3>
                <p class="text-slate-500 text-sm">Try a different search or create a new label.</p>
            </div>
        </div>

        <p-dialog [(visible)]="displayDialog"
                  [header]="editingTag?.id ? 'Edit Tag' : 'New Tag'"
                  [modal]="true"
                  [style]="{width: '400px'}"
                  [draggable]="false"
                  class="tag-editor-dialog">

            <div class="flex flex-col gap-6 py-4" *ngIf="editingTag">
                <div class="flex flex-col gap-2">
                    <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tag Label</label>
                    <input type="text" pInputText [(ngModel)]="editingTag.title"
                           placeholder="Enter tag name..."
                           class="w-full border-slate-200 rounded-xl p-3 font-bold" />
                </div>

                <div class="flex flex-col gap-2">
                    <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Identify Color</label>
                    <div class="flex items-center gap-4 p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <p-colorPicker [(ngModel)]="editingTag.color" appendTo="body"></p-colorPicker>
                        <input type="text" pInputText [(ngModel)]="editingTag.color"
                               class="flex-1 bg-transparent border-none font-mono text-sm font-bold text-slate-600 focus:ring-0" />
                    </div>
                </div>

                <div class="mt-4">
                    <label class="text-[10px] font-black text-slate-300 uppercase tracking-widest block mb-2">Live Preview</label>
                    <div class="p-4 rounded-xl border-2 border-dashed border-slate-100 flex justify-center">
                        <p-tag [value]="editingTag.title || 'Preview'"
                               [style]="{'background': editingTag.color, 'color': '#fff'}"
                               styleClass="px-4 py-1 text-sm font-bold rounded-lg"></p-tag>
                    </div>
                </div>
            </div>

            <ng-template pTemplate="footer">
                <button pButton label="Cancel" class="p-button-text p-button-secondary font-bold" (click)="displayDialog = false"></button>
                <button pButton label="Save Tag" class="p-button-primary px-8 rounded-xl font-bold" [loading]="isSaving" (click)="onSave()"></button>
            </ng-template>
        </p-dialog>
    `,
    styles: [`
        :host ::ng-deep {
            .p-dialog-header { padding: 1.5rem 2rem; border: none; }
            .p-dialog-content { padding: 0 2rem 1.5rem 2rem; }
            .p-dialog-footer { padding: 1.5rem 2rem; border-top: 1px solid #f8fafc; }
            .p-colorpicker-preview { border-radius: 8px; width: 32px; height: 32px; border: 2px solid #fff; box-shadow: 0 0 0 1px #e2e8f0; }
        }
    `],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TagListComponent implements OnInit, OnDestroy {
    tags: Tag[] = [];
    loading = true;
    isSaving = false;
    displayDialog = false;
    editingTag: Tag | null = null;
    filterQuery = '';

    private _destroy = new Subject<void>();

    constructor(
        private _tasksService: TasksService,
        private _cdr: ChangeDetectorRef,
        private _toast: MessageService,
        private _confirm: ConfirmationService
    ) {}

    ngOnInit(): void {
        this.loadTags();
    }

    get filteredTags(): Tag[] {
        if (!this.filterQuery) return this.tags;
        return this.tags.filter(t => t.title?.toLowerCase().includes(this.filterQuery.toLowerCase()));
    }

    loadTags(): void {
        this.loading = true;
        this._tasksService.getTags().pipe(
            takeUntil(this._destroy),
            finalize(() => { this.loading = false; this._cdr.markForCheck(); })
        ).subscribe((res: any) => this.tags = res.payload);
    }

    openDialog(tag?: Tag): void {
        this.editingTag = tag ? { ...tag } : { title: '', color: '#6366f1' };
        this.displayDialog = true;
    }

    onSave(): void {
        if (!this.editingTag?.title) return;
        this.isSaving = true;

        const request = this.editingTag.id
            ? this._tasksService.updateTag(this.editingTag.id, this.editingTag)
            : this._tasksService.createTag(this.editingTag);

        request.pipe(finalize(() => { this.isSaving = false; this._cdr.markForCheck(); }))
            .subscribe(() => {
                this._toast.add({ severity: 'success', summary: 'Success', detail: 'Tag updated' });
                this.displayDialog = false;
                this.loadTags();
            });
    }

    onDelete(tag: Tag): void {
        this._confirm.confirm({
            message: `Are you sure you want to delete "${tag.title}"? This cannot be undone.`,
            header: 'Confirm Deletion',
            icon: 'pi pi-exclamation-triangle',
            acceptButtonStyleClass: 'p-button-danger rounded-xl',
            accept: () => {
                this._tasksService.deleteTag(tag.id!).subscribe(() => {
                    this._toast.add({ severity: 'info', summary: 'Deleted', detail: 'Tag removed' });
                    this.loadTags();
                });
            }
        });
    }

    ngOnDestroy(): void {
        this._destroy.next();
        this._destroy.complete();
    }
}
