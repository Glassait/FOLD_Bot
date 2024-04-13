/**
 * Represents a successful response structure from the Wargaming API.
 *
 * @template TData - The type of data included in the success response.
 * @template TMeta - The type of additional metadata in the success response (optional).
 */
export type WargamingSuccessType<TData, TMeta = Record<string, never>> = {
    /**
     * The status of the response, always set to 'ok'
     */
    status: 'ok';
    /**
     * Additional metadata information.
     */
    meta: TMeta & {
        /**
         * The count of items in the response.
         */
        count: number;
        /**
         * The total number of items available.
         */
        total: number;
    };
    /**
     * The actual data in the response.
     */
    data: TData;
};

/**
 * Represents an error response structure from the Wargaming API.
 *
 * @template TError - The type of additional error information in the error response (optional).
 */
export type WargamingErrorType<TError = Record<string, never>> = {
    /**
     * The status of the response, always set to 'error'.
     */
    status: 'error';
    /**
     * Additional error information.
     */
    error: TError & {
        /**
         * The field related to the error.
         */
        field: string;
        /**
         * The error message.
         */
        message: string;
        /**
         * The error code.
         */
        code: number;
        /**
         * The error value.
         */
        value: number;
    };
};
