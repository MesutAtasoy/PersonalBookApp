import {Routes} from "@angular/router";
import {TaskListComponent} from "@/apps/task/list";

export default [
    {
        path: '',
        loadComponent: () => import('./list').then((c) => c.TaskListComponent),
        data: { breadcrumb: '' }
    },
] as Routes;
