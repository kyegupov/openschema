import {Schema, Type, printShorthand} from './schema';
import {JSONSchema4} from 'json-schema';
import fs = require('fs');

function parseToplevel(s: JSONSchema4): Schema {
    let ret: Schema = {types:[]};
    ret.rootType = parseType(s, ret, 'root');
    if (!ret.rootType) {
        throw new Error("No rootType in schema");
    }
    return ret;
}

function depluralize(s: string): string {
    if (s.endsWith('s')) {
        return s.substr(0, s.length - 1);
    }
    return s;
}

function parseType(js: JSONSchema4, os: Schema, nameHint: string): string {
    switch (js.type) {
        case "object": {
            // TODO: snake case to camel
            let speculativeNameBase = depluralize(nameHint.charAt(0).toUpperCase() + nameHint.substr(1));
            let speculativeName = speculativeNameBase;
            let i = 1;
            while (os.types.filter(t => t.name == speculativeName).length) {
                i++;
                speculativeName = speculativeNameBase + i;
            }
            let typ: Type = {name: speculativeName, kind: "struct", fields: []};
            for (let name of Object.keys(js.properties!)) {
                // console.log(name);
                let field = js.properties![name];
                let optional = (!js.required || js.required.filter(f => f==name).length == 0) ? "?" : "";
                if (typeof field.type === 'string') {
                    if (field.type == 'array') {
                        let typeName = parseType(field.items!, os, name);
                        typ.fields.push({name: name, type: typeName + '[]' + optional});
                    } else if (field.type == 'object') {
                        let typeName = parseType(field, os, name);
                        typ.fields.push({name: name, type: typeName + optional});
                    } else {
                        // TODO: refs
                        // Primitive
                        typ.fields.push({name: name, type: field.type});
                    }
                } else {
                    throw new Error(`Unknown field type: ${field.type}`);
                }
            }
            os.types.push(typ);
            return typ.name;
        }
        case "integer":
        case "string":
        case "boolean":
            return js.type;
        default: {
            throw new Error(`Unknown type type: ${js.type}`);
        }
    }
}

fs.readFile('schema.json', 'utf8', (err, content) => console.log(printShorthand(parseToplevel(JSON.parse(content)))));