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

const schema_reso_effects = TJS.generateSchema(program, 'ResoEffect', settings);
const schema_weapon_effects = TJS.generateSchema(program, 'WeaponEffect', settings);
const schema_matrix_effects = TJS.generateSchema(program, 'MatrixEffect', settings);
const schema_relic_effects = TJS.generateSchema(program, 'RelicEffect', settings);
const schema_trait_effects = TJS.generateSchema(program, 'TraitEffect', settings);
const schema_weapons = TJS.generateSchema(program, 'Weapon', settings);
const schema_matrix = TJS.generateSchema(program, 'Matrix', settings);
const schema_relic = TJS.generateSchema(program, 'Relic', settings);
const schema_trait = TJS.generateSchema(program, 'Trait', settings);

fs.writeFileSync(
	path.join(schemaDir, 'reso_effect.schema.json'),
	JSON.stringify(schema_reso_effects, null, 2)
);
fs.writeFileSync(
	path.join(schemaDir, 'weapon_effect.schema.json'),
	JSON.stringify(schema_weapon_effects, null, 2)
);
fs.writeFileSync(
	path.join(schemaDir, 'matrix_effect.schema.json'),
	JSON.stringify(schema_matrix_effects, null, 2)
);
fs.writeFileSync(
	path.join(schemaDir, 'relic_effect.schema.json'),
	JSON.stringify(schema_relic_effects, null, 2)
);
fs.writeFileSync(
	path.join(schemaDir, 'trait_effect.schema.json'),
	JSON.stringify(schema_trait_effects, null, 2)
);
fs.writeFileSync(
	path.join(schemaDir, 'weapon.schema.json'),
	JSON.stringify(schema_weapons, null, 2)
);
fs.writeFileSync(
	path.join(schemaDir, 'matrix.schema.json'),
	JSON.stringify(schema_matrix, null, 2)
);
fs.writeFileSync(path.join(schemaDir, 'relic.schema.json'), JSON.stringify(schema_relic, null, 2));
fs.writeFileSync(path.join(schemaDir, 'trait.schema.json'), JSON.stringify(schema_trait, null, 2));

console.log('✅ JSON schemas generated successfully.');
