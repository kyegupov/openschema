export interface Schema {
    version?: string;
    namespace?: string;
    doc?: string;
    types: Type[];
    rootType?: string;
}

export type Type = Struct;

interface BaseNode {
    name: string;
    doc?: string;
}

interface Struct extends BaseNode {
    kind: "struct";
    fields: Field[];
}

interface Field extends BaseNode {
    type: string; // TODO: inlined types ?
}

function ind(indent: number) {
    return '    '.repeat(indent);
}

export function printShorthand(s: Schema, indent: number = 0): string {
    let chunks: string[] = [];
    // TODO: metadata
    printTypeShorthand(chunks, s.types.filter(t => t.name == s.rootType)[0]);
    for (let t of s.types.filter(t => t.name != s.rootType)) {
        printTypeShorthand(chunks, t);
    }
    return chunks.join('');
}

export function printTypeShorthand(chunks: string[], t: Type, indent: number = 0) {
    switch (t.kind) {
        case "struct": {
            chunks.push(ind(indent));
            chunks.push(`struct ${t.name} {\n`);
            for (let f of t.fields) {
                chunks.push(ind(indent + 1));
                // TODO: doc
                // if (typeof f.type === 'string') {
                    chunks.push(`${f.name} ${f.type}\n`) 
                // } else {
                    // chunks.push(f.name + ' ' + printShorthand(f.type, indent + 1)) 
                // }  
            }
            chunks.push(ind(indent));
            chunks.push(`}\n`);
        }
    }
}