import {Routes} from "@angular/router";
import {TaskListComponent} from "@/apps/task/list";

export default [
    {
        path: '',
        loadComponent: () => import('./list').then((c) => c.TaskListComponent),
        data: { breadcrumb: '' }
    },
    {
        path: 'tags',
        loadComponent: () => import('./tags').then((c) => c.TagListComponent),
        data: { breadcrumb: '' }
    }
] as Routes;
