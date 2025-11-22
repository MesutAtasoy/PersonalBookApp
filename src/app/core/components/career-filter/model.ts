export interface FilterValue {
    label?: string;
    keyword?: string;
    field?: string;
    operator?: string;
    value?: any;
    comparatorLabel?: string;
    comparatorKeyword?: string;
    urlId?: any;
}


export interface FilterConfig {
    screen?: string;
    filters?: Filter[];
    sorts?: Sort[];
    search: Search
}

export interface Filter {
    label?: string;
    keyword?: string;
    field?: string;
    type?: string;
    multipleSelection?: boolean;
    resources?: FilterResource;
    comparators?: Comparator[];
}

export interface FilterResource {
    url?: string;
    resourceKeyword?: string;
    parameters?: any;
}

export interface Comparator {
    comparatorLabel?: string;
    comparatorKeyword?: string;
    operator?: string;
    options?: any[];
}


export interface Search {
    property?: string;
    field?: string;
}


export interface Sort {
    property?: string;
    field?: string;
}



