import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AppMenuitem } from './app.menuitem';

@Component({
    selector: 'app-menu',
    standalone: true,
    imports: [CommonModule, AppMenuitem, RouterModule],
    template: `<ul class="layout-menu">
        <ng-container *ngFor="let item of model; let i = index">
            <li
                app-menuitem
                *ngIf="!item.separator"
                [item]="item"
                [index]="i"
                [root]="true"
            ></li>
            <li *ngIf="item.separator" class="menu-separator"></li>
        </ng-container>
    </ul> `,
})
export class AppMenu {
    model: any[] = [];

    ngOnInit() {
        this.model = [
            {
                label: 'Dashboards',
                icon: 'pi pi-home',
                items: [
                    {
                        label: 'E-Commerce',
                        icon: 'pi pi-fw pi-home',
                        routerLink: ['/'],
                    },
                    {
                        label: 'Banking',
                        icon: 'pi pi-fw pi-image',
                        routerLink: ['/dashboard-banking'],
                    },
                ],
            },
            {
                label: 'Apps',
                icon: 'pi pi-th-large',
                items: [
                    {
                        label: 'Academy',
                        icon: 'pi pi-fw pi-book',
                        routerLink: ['/apps/academy'],
                    },
                    {
                        label: 'Finance',
                        icon: 'pi pi-fw pi-wallet',
                        items: [
                            {
                                label: 'Bank Accounts',
                                icon: 'pi pi-fw pi-building-columns',
                                routerLink: ['/apps/finance/finance-banks/'],
                            },
                            {
                                label: 'Transactions',
                                icon: 'pi pi-fw pi-history',
                                routerLink: ['/apps/finance/transactions/'],
                            },
                            {
                                label: 'Planned Payments',
                                icon: 'pi pi-fw pi-wallet',
                                items: [
                                    {
                                        label: 'Overview',
                                        icon: 'pi pi-fw pi-wave-pulse',
                                        routerLink: ['/apps/finance/planned-payments/overview'],
                                    },
                                    {
                                        label: 'Payments',
                                        icon: 'pi pi-fw pi-money-bill',
                                        routerLink: ['/apps/finance/planned-payments/']
                                    }
                                ]
                            },
                            {
                                label: 'Buckets',
                                icon: 'pi pi-fw pi-shopping-cart',
                                routerLink: ['/apps/finance/buckets/'],
                            },
                            {
                                label: 'Settings',
                                icon: 'pi pi-fw pi-wallet',
                                items: [
                                    {
                                        label: 'Banks',
                                        icon: 'pi pi-fw pi-building-columns',
                                        routerLink: ['/apps/finance/settings/banks'],
                                    },
                                    {
                                        label: 'Currencies',
                                        icon: 'pi pi-fw pi-money-bill',
                                        routerLink: ['/apps/finance/settings/currencies'],
                                    },
                                    {
                                        label: 'Categories',
                                        icon: 'pi pi-fw pi-tags',
                                        routerLink: ['/apps/finance/settings/categories'],
                                    },
                                ]
                            }
                        ],
                    },
                    {
                        label: 'Task',
                        icon: 'pi pi-fw pi-list-check',
                        routerLink: ['/apps/tasks'],
                    },
                    {
                        label: 'System Configuration',
                        icon: 'pi pi-fw pi-cog',
                        routerLink: ['/apps/system-configuration'],
                    },
                    {
                        label: 'Blog',
                        icon: 'pi pi-fw pi-comment',
                        items: [
                            {
                                label: 'List',
                                icon: 'pi pi-fw pi-image',
                                routerLink: ['/apps/blog/list'],
                            },
                            {
                                label: 'Detail',
                                icon: 'pi pi-fw pi-list',
                                routerLink: ['/apps/blog/detail'],
                            },
                            {
                                label: 'Edit',
                                icon: 'pi pi-fw pi-pencil',
                                routerLink: ['/apps/blog/edit'],
                            },
                        ],
                    },
                    {
                        label: 'Chat',
                        icon: 'pi pi-fw pi-comments',
                        routerLink: ['/apps/chat'],
                    },
                    {
                        label: 'Files',
                        icon: 'pi pi-fw pi-folder',
                        routerLink: ['/apps/files'],
                    },
                    {
                        label: 'Kanban',
                        icon: 'pi pi-fw pi-sliders-v',
                        routerLink: ['/apps/kanban']
                    },
                    {
                        label: 'Mail',
                        icon: 'pi pi-fw pi-envelope',
                        items: [
                            {
                                label: 'Inbox',
                                icon: 'pi pi-fw pi-inbox',
                                routerLink: ['/apps/mail/inbox'],
                            },
                            {
                                label: 'Compose',
                                icon: 'pi pi-fw pi-pencil',
                                routerLink: ['/apps/mail/compose'],
                            },
                            {
                                label: 'Detail',
                                icon: 'pi pi-fw pi-comment',
                                routerLink: ['/apps/mail/detail/1000'],
                            },
                        ],
                    },
                ],
            }
        ];
    }
}
