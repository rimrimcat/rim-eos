// Imports
import Fuse from 'fuse.js';

// Constants by validateValue
export const PART = 'part' as const;
export const INTEGER = 'integer' as const;
export const FLOAT_PERCENT = 'float_percent' as const;
export const FLOAT_PERCENT_3D = 'float_percent_3d' as const; // stat screen
export const HEADER = 'header' as const;
export const INVALID = '???' as const;

// Maps
const part_map = {
	helmet: 'Helmet',
	spaulders: 'Spaulders',
	armor: 'Armor',
	armbands: 'Armbands',
	belt: 'Belt',
	legguards: 'Legguards',
	gloves: 'Gloves',
	boots: 'Boots',
	visor: 'Visor',
	eyepiece: 'Visor',
	engine: 'Engine',
	combatengine: 'Engine',
	exoskeleton: 'Exoskeleton',
	reactor: 'Reactor',
	microreactor: 'Reactor'
} as const;

const header_map = {
	// Attack
	atk: 'Atk',
	flameatk: 'Flame Atk',
	frostatk: 'Frost Atk',
	voltatk: 'Volt Atk',
	physatk: 'Phys Atk',
	eleatk: 'Ele Atk',
	altatk: 'Alt Atk',

	// Attack Percent
	flameatkpercent: 'Flame Atk %',
	frostatkpercent: 'Frost Atk %',
	voltatkpercent: 'Volt Atk %',
	physatkpercent: 'Phys Atk %',
	eleatkpercent: 'Ele Atk %',
	altatkpercent: 'Alt Atk %',

	// Damage Percent
	flamedmgpercent: 'Flame Dmg %',
	frostdmgpercent: 'Frost Dmg %',
	voltdmgpercent: 'Volt Dmg %',
	physdmgpercent: 'Phys Dmg %',
	eledmgpercent: 'Ele Dmg %',
	altdmgpercent: 'Alt Dmg %',

	// Crit
	crit: 'Crit',
	critpercent: 'Crit %'
} as const;

// Used by GearTable
const validation = {
	part: PART,
	atk: INTEGER,
	ele_atk: INTEGER,
	total_atk: INTEGER,
	ele_atk_percent: FLOAT_PERCENT,
	ele_dmg_percent: FLOAT_PERCENT,
	crit: INTEGER,
	crit_percent: FLOAT_PERCENT,
	header: HEADER
} as const;

export function validateValue(inputName: string, inputValue: string): string {
	const validation_type = validation[inputName] || inputName;

	if (validation_type) {
		try {
			switch (validation_type) {
				case INTEGER: {
					if (!inputValue.trim()) {
						return '0';
					}

					const intValue = parseInt(inputValue, 10);

					if (isNaN(intValue)) {
						return INVALID;
					}
					return String(intValue);
				}

				case FLOAT_PERCENT: {
					if (!inputValue.trim()) {
						return '0%';
					}

					if (isNaN(Number(inputValue))) {
						return INVALID;
					}
					return String(Number(inputValue)) + '%';
				}

				case FLOAT_PERCENT_3D: {
					if (!inputValue.trim()) {
						return '0.000%';
					}

					if (isNaN(Number(inputValue))) {
						return INVALID;
					}
					return String(Number(inputValue).toFixed(3)) + '%';
				}

				case PART: {
					if (!inputValue.trim()) {
						return 'Helmet';
					}

					const fuse = new Fuse(Object.keys(part_map), {
						includeScore: true,
						threshold: 0.3,
						distance: 100
					});

					const result_part = fuse.search(inputValue.trim().toLowerCase());
					if (result_part.length > 0) {
						return part_map[result_part[0].item];
					}
					return INVALID;
				}

				case HEADER: {
					if (!inputValue.trim()) {
						return INVALID;
					}

					const fuse = new Fuse(Object.keys(header_map), {
						includeScore: true,
						threshold: 0.3,
						distance: 100
					});

					const result_hdr = fuse.search(inputValue.trim().toLowerCase());
					if (result_hdr.length > 0) {
						return header_map[result_hdr[0].item];
					}

					return INVALID;
				}

				default:
					// ???
					console.error('Default path');
					return inputValue;
			}
		} catch (e) {
			return INVALID;
		}
	}

	console.error('Not validated.');
	return inputValue;
}
