export class Context {
    private readonly _context: string;

    constructor(cl: typeof Context | string) {
        this._context = typeof cl === 'string' ? cl : cl.name;
    }

    get context(): string {
        return this._context;
    }
}
