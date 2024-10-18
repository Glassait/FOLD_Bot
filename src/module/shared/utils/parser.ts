export interface XmlElement {
    tag: string;
    attributes?: Record<string, string>;
    children?: XmlElement[];
    text?: string;
    selfClosing?: boolean;
}

export class SimpleXMLParser {
    private pos: number = 0;

    constructor(private readonly xmlString: string) {
        this.xmlString = this.xmlString.trim();
    }

    /**
     * Main parse function to start parsing XML
     */
    public parse(): XmlElement {
        if (!this.xmlString.startsWith('<')) {
            throw new Error('Invalid XML: Does not start with a root element.');
        }

        return this.parseElement();
    }

    /**
     * Parse an individual element
     */
    private parseElement(): XmlElement {
        const element: XmlElement = { tag: '' };

        // Find the opening tag
        const tagOpen = this.match(/<(\w+)(.*?)\/?>/);
        if (!tagOpen) {
            throw new Error('Invalid XML: Cannot find an opening tag.');
        }

        element.tag = tagOpen[1];
        if (tagOpen[0].endsWith('/>')) {
            element.selfClosing = true;
        }

        // Parse attributes if any
        const attributes = this.parseAttributes(tagOpen[2]);
        if (attributes) {
            element.attributes = attributes;
        }

        const children: XmlElement[] = [];
        this.manageParsing('', children, element);

        if (children.length) {
            element.children = children;
        }

        return element;
    }

    /**
     * Parse CDATA sections
     */
    private parseCData(): string {
        const cdataMatch = this.match(/<!\[CDATA\[(.*?)]]>/s);
        if (cdataMatch) {
            return cdataMatch[1]; // Return the content inside CDATA
        }

        throw new Error('Invalid XML: CDATA section not closed properly.');
    }

    /**
     * Parse attributes in the opening tag
     *
     * @param attrString - The list of attributes in string
     */
    private parseAttributes(attrString: string): Record<string, string> | null {
        const attrs: Record<string, string> = {};
        const attrRegex = /(\w+)\s*=\s*"([^"]*)"/g;
        let match: RegExpExecArray | null;

        while ((match = attrRegex.exec(attrString)) !== null) {
            attrs[match[1]] = match[2];
        }

        return Object.keys(attrs).length > 0 ? attrs : null;
    }

    /**
     * Parse text between tags
     */
    private parseText(): string {
        const textMatch = this.match(/([^<]+)/);
        return textMatch ? textMatch[0] : '';
    }

    /**
     * Match regex patterns and move the position forward
     *
     * @param pattern - The reg exp pattern to found in the xml
     */
    private match(pattern: RegExp): RegExpMatchArray | null {
        const match = RegExp(pattern).exec(this.xmlString.slice(this.pos));
        if (match) {
            this.pos += match.index + match[0].length;
        }
        return match;
    }

    /**
     * Peek at the next character (or character at an offset)
     *
     * @param offset - The offset added to the actual pos to find the next caractere
     */
    private peek(offset: number = 0): string {
        return this.pos + offset < this.xmlString.length ? this.xmlString[this.pos + offset] : '';
    }

    private manageParsing(textContent: string, children: XmlElement[], element: XmlElement): void {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition, no-constant-condition
        while (true) {
            const nextChar = this.peek();

            if (nextChar !== '<') {
                // Text node
                textContent += this.parseText();

                if (textContent.trim()) {
                    element.text = textContent.trim();
                }

                continue;
            }

            if (this.isClosingTag(element)) {
                // Closing tag
                const closingTag = this.getClosingTag(element);
                if (closingTag![1] !== element.tag) {
                    throw new Error(`Mismatched tag. Expected ${element.tag} but got ${closingTag![1]}.`);
                }
                break;
            } else if (this.isCData()) {
                // CDATA section
                textContent += this.parseCData();
            } else if (!element.selfClosing) {
                // Nested element (child)
                const child = this.parseElement();
                children.push(child);
            }
        }
    }

    private getClosingTag(element: XmlElement): string[] | null {
        return element.selfClosing ? ['', element.tag] : this.match(/<\/(\w+)>/);
    }

    private isClosingTag(element: XmlElement): boolean | undefined {
        return this.peek(1) === '/' || element.selfClosing;
    }

    private isCData(): boolean {
        return this.peek(1) === '!' && this.xmlString.slice(this.pos, this.pos + 9) === '<![CDATA[';
    }
}
