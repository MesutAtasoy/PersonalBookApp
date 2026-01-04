import { Routes } from '@angular/router';
import {ContentProfileDetailComponent} from "@/apps/content/profiles/detail";

export default [
    {
        path: '',
        loadComponent: () => import('./list').then((c) => c.ContentProfilesComponent),
        data: { breadcrumb: '' }
    },
    {
        path: ':id/detail',
        loadComponent: () => import('./detail').then((c) => c.ContentProfileDetailComponent),
        data: { breadcrumb: '' }
    }
] as Routes;
