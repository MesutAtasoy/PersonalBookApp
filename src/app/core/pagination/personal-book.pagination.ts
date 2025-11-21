export interface PersonalBookPagination {
    pageNumber: number,
    pageSize: number,
    totalRecords: number,
    totalPages: number,
    nextPage?: number,
    previousPage?: number
}


export interface CareerDataPagination<T> extends PersonalBookPagination {
    data: T[];
}

export class PaginationFilter {
    pageNumber?: number;
    pageSize?: number;
}

export interface SearchParameter {
    value?: string;
    regex?: boolean;
}

export interface OrderParameter {
    column?: string;
    direction?: string;
}

export interface SearchFilter {
    order?: OrderParameter;
    search?: SearchParameter;
    paginationFilter?: PaginationFilter;
}

export interface DateTimeRangeFilter {
    type?: number,
    startDate?: string;
    endDate?: string;
}

export class PaginationConstants {
    static DefaultPageIndex = 0;
    static DefaultPageSize = 10;
    static DefaultPageOptions = [10, 25, 50];
    static DefaultPagination = {
        pageNumber: 1,
        pageSize: 1,
        totalPages: 1,
        totalRecords: 0,
        nextPage: 0,
        previousPage: 0,
        data: []
    };

    static DefaultPaginationPascalCase = {
        PageNumber: 1,
        PageSize: 1,
        TotalPages: 1,
        TotalRecords: 0,
        NextPage: 0,
        PreviousPage: 0,
        Data: []
    };
}
