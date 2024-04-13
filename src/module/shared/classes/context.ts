/**
 * Represents the context for a specific class.
 */
export class Context {
    private readonly _context: string;

    /**
     * Constructs a new Context instance.
     *
     * @param {string} name - The name of the class or the name of the file.
     */
    constructor(name: string) {
        this._context = name.replace('.ts', '').replace(/\./g, '-').toUpperCase();
    }

    /**
     * Gets the context string.
     *
     * @returns {string} - The context string.
     */
    get context(): string {
        return this._context;
    }
}
