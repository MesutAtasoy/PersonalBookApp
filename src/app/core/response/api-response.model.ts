export class ApiResponse
{
    statusCode? : number;
    isError? : boolean;
    payload : any;
    message? : string;
    exceptionMessage? : string;
}
