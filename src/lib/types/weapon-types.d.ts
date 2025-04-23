import type {
	MatrixEffectsIds,
	MatrixIds,
	RelicEffectsIds,
	RelicIds,
	ResoEffectsIds,
	TraitEffectsIds,
	TraitsIds,
	WeaponEffectsIds,
	WeaponSettingsIds,
	WeaponsIds
} from '../generated/ids';
import type { StatCollection } from '../scripts/stats';
import type {
	FinalizedMatrixEffect,
	FinalizedTraitEffect,
	OrderedResoTriggers,
	RelicEffect,
	WeaponEffect
} from './effect-types';
import type { StatBuffs, StatGearUser } from './stat-types';

/**
 * BaseStatType naming convetion:
 *   [third stat]-[atk value]
 *   third stat: crit, res
 *   atk value: low, med, high
 */
export type BaseStatType =
	| 'crit-low'
	| 'crit-med'
	| 'crit-high'
	| 'res-low'
	| 'res-med'
	| 'res-high';
export type BaseStatValue = {
	[key in StatGearUser | StatBuffs]?: [number, number];
};

export type WeaponSetting = {
	id: WeaponSettingsIds;
	icon: string;
	resonances?: OrderedResoTriggers;
	effects?: WeaponEffectsIds[];
	reso_effects?: ResoEffectsIds[]; // would merge with weapon
	notes?: string;
};

export type SettingAssignment = 'manual' | 'voidpiercer';

export type SettingSkill = {
	choices: WeaponSettingsIds[];
	default: WeaponSettingsIds;
	assignment: SettingAssignment;
	type: 'skill';
};

export type SettingElement = {
	choices: WeaponSettingsIds[];
	default: WeaponSettingsIds;
	assignment: SettingAssignment;
	type: 'element';
};

export type SettingView = (SettingElement | SettingSkill) & {
	choice: WeaponSetting;
};

export type Weapon = {
	id: WeaponsIds;
	name: string;
	base_stat: BaseStatType;
	resonances: OrderedResoTriggers;
	effects: WeaponEffectsIds[];
	reso_effects?: ResoEffectsIds[];

	settings?: (SettingElement | SettingSkill)[];

	/** Priority for being main dps when on atk reso */
	onfield_atk_priority?: number;

	/** How often to switch to weapon to maximize the buffs (in seconds)
	 *  This is usually just equal to the skill cooldown or shortest buff duration
	 */
	rotation_period?: number;

	/**
	 * Time taken to proc all weapon buffs before switching out
	 */
	short_rotation_duration?: number;
};

export type UserWeapon = {
	id: WeaponsIds;
	advancement?: number;
	setting?: WeaponSettingsIds[]; // must refer to ids
};

export type WeaponView = {
	id: WeaponsIds;
	name: string;
	resonances: OrderedResoTriggers;
	setting_view: SettingView[];

	base_stat: StatCollection;
	effects: WeaponEffect[];
	stat: StatCollection;

	advancement: number;
	onfield_atk_priority?: number;
	rotation_period?: number;
	short_rotation_duration?: number;
};

export type Matrix = {
	id: MatrixIds;
	name: string;
	effects: MatrixEffectsIds[];
};

export type UserMatrix = {
	id: MatrixIds;
	advancement?: number;
};

export type MatrixView = {
	id: MatrixIds;
	name: string;

	effects: FinalizedMatrixEffect[];
	stat: StatCollection;

	advancement: number;
};

export type Relic = {
	id: RelicIds;
	name: string;
	effects: RelicEffectsIds[];
};

export type UserRelic = {
	id: RelicIds;
	advancement?: number;
};

export type RelicView = {
	id: RelicIds;
	name: string;
	effects: RelicEffect[];
	stat: StatCollection;

	advancement: number;
};

export type Trait = {
	id: TraitIds;
	name: string;
	effects: TraitEffectsIds[];
};

export type UserTrait = TraitIds;

export type TraitView = {
	id: TraitsIds;
	name: string;
	effects: FinalizedTraitEffect[];
	stat: StatCollection;
};
