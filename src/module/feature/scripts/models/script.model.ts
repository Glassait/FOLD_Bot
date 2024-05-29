/**
 * Represents a Script Model.
 */
export class ScriptModel {
    /**
     * Creates an instance of ScriptModel.
     *
     * @param {string} _name - The name of the script.
     * @param {(...args: any) => Promise<void>} _script - The script function.
     */
    constructor(
        private _name: string,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        private _script: (...args: any) => Promise<void>
    ) {}

    /**
     * Gets the name of the script.
     */
    public get name(): string {
        return this._name;
    }

    /**
     * Gets the script function.
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public get script(): (...args: any) => Promise<void> {
        return this._script;
    }
}
