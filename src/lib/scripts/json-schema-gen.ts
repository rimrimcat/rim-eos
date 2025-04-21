import fs from 'fs';
import path from 'path';
import * as TJS from 'typescript-json-schema';

const projectRoot = process.cwd();

const settings: TJS.PartialArgs = {
	required: true,
	noExtraProps: true,
	ignoreErrors: true
};

const compilerOptions: TJS.CompilerOptions = {
	strictNullChecks: true
};

const schemaDir = path.join(projectRoot, 'src/lib/schemas');

if (!fs.existsSync(schemaDir)) {
	fs.mkdirSync(schemaDir, { recursive: true });
}

const program = TJS.getProgramFromFiles(
	[path.join(projectRoot, 'src/lib/types/index.d.ts')],
	compilerOptions
);

function toSnakeCase(name: string): string {
	return name
		.replace(/([a-z0-9])([A-Z])/g, '$1_$2')
		.replace(/([A-Z])([A-Z][a-z])/g, '$1_$2')
		.toLowerCase();
}
const typesToGenerate = [
	'ResoEffect',
	'WeaponEffect',
	'MatrixEffect',
	'RelicEffect',
	'TraitEffect',
	'Weapon',
	'Matrix',
	'Relic',
	'Trait'
];

for (const typeName of typesToGenerate) {
	try {
		const schema = TJS.generateSchema(program, typeName, settings);
		if (!schema) {
			console.warn(`⚠️ Schema for ${typeName} is undefined.`);
			continue;
		}
		const snakeName = toSnakeCase(typeName);
		const filePath = path.join(schemaDir, `${snakeName}.schema.json`);
		fs.writeFileSync(filePath, JSON.stringify(schema, null, 2));
		console.log(`✅ ${filePath} generated.`);
	} catch (error) {
		console.error(`❌ Failed to generate schema for type: ${typeName}`);
		console.error(error);
	}
}

console.log('✅ JSON schemas generated successfully.');
