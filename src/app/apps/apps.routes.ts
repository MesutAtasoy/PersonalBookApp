import { Routes } from '@angular/router';

export default [
    {
        path: 'finance',
        loadChildren: () => import('./finance/finance.routes'),
        data: { breadcrumb: 'Finance' }
    },
    {
        path: 'academy',
        loadChildren: () => import('./academy/academy.routes'),
        data: { breadcrumb: 'Academy' }
    },
    {
        path: 'tasks',
        loadChildren: () => import('./task/tasks.routes'),
        data: { breadcrumb: 'Task' }
    },
    {
        path: 'system-configuration',
        loadChildren: () => import('./system-configuration/system-configurations.routes'),
        data: { breadcrumb: 'System Configuration' }
    },
    {
        path: 'content',
        loadChildren: () => import('./content/content.routes'),
        data: { breadcrumb: 'Content Intelligence' }
    },
    {
        path: 'blog',
        loadChildren: () => import('./blog/blog.routes'),
        data: { breadcrumb: 'Blog' }
    },

    {
        path: 'chat',
        loadComponent: () => import('./chat').then((c) => c.Chat),
        data: { breadcrumb: 'Chat' }
    },
    {
        path: 'files',
        loadComponent: () => import('./files').then((c) => c.Files),
        data: { breadcrumb: 'Files' }
    },
    {
        path: 'mail',
        loadChildren: () => import('./mail/mail.routes'),
        data: { breadcrumb: 'Mail' }
    },
    {
        path: 'tasklist',
        loadComponent: () => import('./tasklist').then((c) => c.TaskList),
        data: { breadcrumb: 'Tasklist' }
    },
    {
        path: 'kanban',
        loadComponent: () => import('./kanban').then((c) => c.Kanban),
        data: { breadcrumb: 'Kanban' }
    }
] as Routes;
