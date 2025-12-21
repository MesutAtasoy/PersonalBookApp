import {Routes} from "@angular/router";
import {TaskListComponent} from "@/apps/task/list";

export default [
    {
        path: '',
        loadComponent: () => import('./list').then((c) => c.SystemConfigurationComponent),
        data: { breadcrumb: '' }
    },
] as Routes;
