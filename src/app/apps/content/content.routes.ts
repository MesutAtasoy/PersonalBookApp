import {Routes} from "@angular/router";

export default [
    {
        path: 'profiles',
        loadChildren: () => import('./profiles/content-profiles.routes'),
        data: { breadcrumb: 'Profiles' }
    }
] as Routes;
