import fs from 'fs';
import path from 'path';
import * as TJS from 'typescript-json-schema';

const projectRoot = process.cwd();

const settings: TJS.PartialArgs = {
	required: true,
	noExtraProps: true
};

const inputTypes = path.join(projectRoot, 'src/lib/scripts/json-types.ts');
const schemaDir = path.join(projectRoot, 'src/lib/schemas');

if (!fs.existsSync(schemaDir)) {
	fs.mkdirSync(schemaDir, { recursive: true });
}

const program = TJS.getProgramFromFiles([inputTypes], {
	strictNullChecks: true
});

const schema_reso_effects = TJS.generateSchema(program, 'ResoEffects', settings);
const schema_effects = TJS.generateSchema(program, 'Effects', settings);

fs.writeFileSync(
	path.join(schemaDir, 'reso_effects.schema.json'),
	JSON.stringify(schema_reso_effects, null, 2)
);
fs.writeFileSync(
	path.join(schemaDir, 'effects.schema.json'),
	JSON.stringify(schema_effects, null, 2)
);

console.log('JSON schemas generated successfully.');
