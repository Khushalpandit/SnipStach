export class ApiError extends Error {
    constructor(message, code, status) {
        super(message);
        this.message = message;
        this.code = code;
        this.status = status;
        this.name = 'ApiError';
    }
}
//# sourceMappingURL=ApiError.js.map