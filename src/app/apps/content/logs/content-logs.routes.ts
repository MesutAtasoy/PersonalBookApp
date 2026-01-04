import { Routes } from '@angular/router';
import {ContentProfileDetailComponent} from "@/apps/content/profiles/detail";

export default [
    {
        path: '',
        loadComponent: () => import('./list').then((c) => c.ContentLogsListComponent),
        data: { breadcrumb: '' }
    }
] as Routes;
