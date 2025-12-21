export interface Task
{
    id?: string;
    type?  : string;
    title?: string;
    notes?: string;
    completed?: boolean;
    startDate?: string | null;
    dueDate?: string | null;
    priority?: 0 | 1 | 2;
    order?: number;
}
