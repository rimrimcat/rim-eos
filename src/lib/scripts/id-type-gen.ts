import fs from 'fs';
import path from 'path';

const projectRoot = process.cwd();
const out_file = path.join(projectRoot, 'src/lib/generated/ids.d.ts');

const weapon_effects_path = path.join(projectRoot, 'static/json/weapon_effect');
const reso_effects_path = path.join(projectRoot, 'static/json/reso_effect');
const weapons_path = path.join(projectRoot, 'static/json/weapon');
const matrix_effects_path = path.join(projectRoot, 'static/json/matrix_effect');

const weapon_effects_ids = fs
	.readdirSync(weapon_effects_path)
	.filter((file) => file.endsWith('.json'))
	.map((file) => path.basename(file, '.json'));
const reso_effects_ids = fs
	.readdirSync(reso_effects_path)
	.filter((file) => file.endsWith('.json'))
	.map((file) => path.basename(file, '.json'));
const weapons_ids = fs
	.readdirSync(weapons_path)
	.filter((file) => file.endsWith('.json'))
	.map((file) => path.basename(file, '.json'));
const matrix_effects_ids = fs
	.readdirSync(matrix_effects_path)
	.filter((file) => file.endsWith('.json'))
	.map((file) => path.basename(file, '.json'));

const typeDef = `// Auto-generated file

export type WeaponEffectsIds = ${weapon_effects_ids.map((id) => `"${id}"`).join(' | ')};
export type ResoEffectsIds = ${reso_effects_ids.map((id) => `"${id}"`).join(' | ')};
export type WeaponsIds = ${weapons_ids.map((id) => `"${id}"`).join(' | ')};
export type MatrixEffectsIds = ${matrix_effects_ids.map((id) => `"${id}"`).join(' | ')};

`;

fs.writeFileSync(out_file, typeDef);
console.log('✅ Id types generated successfully.');
