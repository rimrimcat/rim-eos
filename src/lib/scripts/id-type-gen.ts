import fs from 'fs';
import path from 'path';

const projectRoot = process.cwd();
const out_file = path.join(projectRoot, 'src/lib/generated/ids.d.ts');

const effects_path = path.join(projectRoot, 'static/json/effects');
const reso_effects_path = path.join(projectRoot, 'static/json/reso_effects');
const weapons_path = path.join(projectRoot, 'static/json/weapons');

const effects_ids = fs
	.readdirSync(effects_path)
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

const typeDef = `// Auto-generated file

export type EffectsIds = ${effects_ids.map((id) => `"${id}"`).join(' | ')};
export type ResoEffectsIds = ${reso_effects_ids.map((id) => `"${id}"`).join(' | ')};
export type WeaponsIds = ${weapons_ids.map((id) => `"${id}"`).join(' | ')};

`;

fs.writeFileSync(out_file, typeDef);
console.log('✅ Id types generated successfully.');
