import { Routes } from '@angular/router';
import {ContentProfileDetailComponent} from "@/apps/content/profiles/detail";
import {ContentDigestListComponent} from "@/apps/content/digests/list";
import {ContentDigestComponent} from "@/apps/content/digests/detail";

export default [
    {
        path: '',
        loadComponent: () => import('./list').then((c) => c.ContentDigestListComponent),
        data: { breadcrumb: '' }
    },
    {
        path: ':id/detail',
        loadComponent: () => import('./detail').then((c) => c.ContentDigestComponent),
        data: { breadcrumb: '' }
    }
] as Routes;
