import type {
	MatrixEffectsIds,
	ResoEffectsIds,
	WeaponEffectsIds,
	WeaponsIds
} from '../generated/ids';
import type { Elements, StatData, StatKey } from './stat-types';

export type ResoElement = Elements | 'none';
export type ResoRole = 'atk' | 'fort' | 'bene' | 'none';
export type ResoExtra = 'armor-dissolve' | 'force-impact';
export type ResoTriggers = ResoElement | ResoRole | ResoExtra;
export type OrderedResoTriggers = [ResoElement, ResoRole, ...ResoTriggers[]];

export type Target = 'self' | 'ally' | 'team' | 'enemy';
export type ResoTriggerCounts = { [key in ResoTriggers]?: number };

export type BaseEffect = {
	id: string;
	target?: Target; // defaults to self
	duration?: number; // cooldown and duration only matter if not 100% uptime or if onfield
	cooldown?: number;

	require_reso?: ResoTriggers;
	require_reso_not?: ResoTriggers;
	require_reso_count?: number; // defaults to 2

	require_teamplay?: boolean; // defaults to false

	require_weapon?: WeaponsIds;

	notes?: string;
};

export type WeaponEffect = BaseEffect & {
	id: WeaponEffectsIds;
	stats: StatData;
	require_adv?: number; // required advancement (esp. for weapons)
	require_adv_not?: number; // for advancement that modifies original effects
	require_boss?: boolean; // effects that only activate against bosses
	require_offhand?: boolean; // effects that only activate when offhand
};

export type ResoEffect = BaseEffect & {
	id: ResoEffectsIds;
	stats: StatData;
	require_reso: ResoTriggers;
};

export type MatrixStatData = {
	[key in StatKey]?: [number, number, number, number];
};
export type MatrixExprData = {
	[key in StatKey]?: [
		ResoTriggers | string,
		ResoTriggers | string,
		ResoTriggers | string,
		ResoTriggers | string
	];
};

export type MatrixEffect = BaseEffect & {
	id: MatrixEffectsIds;
	stats: MatrixStatData | MatrixExprData;
};

export type MatrixFinalEffect = BaseEffect & {
	id: MatrixEffectsIds;
	stats: StatData;
	advancement: number;
};
