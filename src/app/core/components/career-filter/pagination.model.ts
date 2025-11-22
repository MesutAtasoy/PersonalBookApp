export interface CareerPagination {
    pageNumber: number,
    pageSize: number,
    totalRecords: number,
    totalPages: number,
    nextPage?: number,
    previousPage?: number
}


export interface CareerQueryResponse<T> extends CareerPagination {
    data: T[];
}

export class PaginationFilter {
    PageNumber?: number;
    PageSize?: number;
}

export class CareerFilterRequest {
    filters?: Filter[] = [];
    sorts?: Sort[] = [];
    query?: string;
    pageNumber?: number = 0;
    pageSize?: number = 20;
    calculateTotalCount? : boolean = false;
}

export class Filter {
    field?: string;
    operator?: string;
    value: any;
}

export class Sort {
    field?: string;
    direction?: string;
}
