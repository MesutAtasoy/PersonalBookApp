import {Routes} from "@angular/router";

export default [
    {
        path: 'profiles',
        loadChildren: () => import('./profiles/content-profiles.routes'),
        data: { breadcrumb: 'Profiles' }
    },
    {
        path: 'logs',
        loadChildren: () => import('./logs/content-logs.routes'),
        data: { breadcrumb: 'Logs' }
    },
    {
        path: 'digests',
        loadChildren: () => import('./digests/content-digests.routes'),
        data: { breadcrumb: 'Digests' }
    }
] as Routes;
