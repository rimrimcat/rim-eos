import type {
	AllStats,
	AtkStats5Number,
	BaseStats14,
	BaseStats14Number,
	BaseStats16,
	BaseStats16Number,
	Elements,
	GearView,
	LumpedKey,
	LumpedStatData,
	StatData,
	StatGearFinal,
	StatGearFinalUseful,
	StatGearTitan,
	StatGearUser,
	StatKey
} from '../types/index';

export const STAT_LABELS: Record<AllStats, string> = {
	hp: 'HP',
	hp_percent: 'HP',
	crit: 'Crit',
	crit_percent: 'Crit',
	res: 'Res',
	res_percent: 'Res',
	atk: 'ATK',
	atk_percent: 'ATK',
	ele_dmg_percent: 'Ele Dmg',
	phys_atk: 'Phys Atk',
	phys_atk_percent: 'Phys Atk',
	phys_dmg_percent: 'Phys Dmg',
	phys_res: 'Phys Res',
	phys_res_percent: 'Phys Res',
	flame_atk: 'Flame Atk',
	flame_atk_percent: 'Flame Atk',
	flame_dmg_percent: 'Flame Dmg',
	flame_res: 'Flame Res',
	flame_res_percent: 'Flame Res',
	frost_atk: 'Frost Atk',
	frost_atk_percent: 'Frost Atk',
	frost_dmg_percent: 'Frost Dmg',
	frost_res: 'Frost Res',
	frost_res_percent: 'Frost Res',
	volt_atk: 'Volt Atk',
	volt_atk_percent: 'Volt Atk',
	volt_dmg_percent: 'Volt Dmg',
	volt_res: 'Volt Res',
	volt_res_percent: 'Volt Res',
	alt_atk: 'Alt Atk',
	alt_atk_percent: 'Alt Atk',
	alt_dmg_percent: 'Alt Dmg',
	alt_res: 'Alt Res',
	alt_res_percent: 'Alt Res',
	// Titan stats
	titan_hp: 'Titan HP',
	titan_hp_percent: 'Titan HP',
	titan_atk: 'Titan ATK',
	titan_flame_atk: 'Titan Flame Atk',
	titan_frost_atk: 'Titan Frost Atk',
	titan_volt_atk: 'Titan Volt Atk',
	titan_phys_atk: 'Titan Phys Atk',
	titan_alt_atk: 'Titan Alt Atk',
	titan_flame_atk_percent: 'Titan Flame Atk',
	titan_frost_atk_percent: 'Titan Frost Atk',
	titan_volt_atk_percent: 'Titan Volt Atk',
	titan_phys_atk_percent: 'Titan Phys Atk',
	titan_alt_atk_percent: 'Titan Alt Atk',
	titan_flame_dmg_percent: 'Titan Flame Dmg',
	titan_frost_dmg_percent: 'Titan Frost Dmg',
	titan_volt_dmg_percent: 'Titan Volt Dmg',
	titan_phys_dmg_percent: 'Titan Phys Dmg',
	titan_alt_dmg_percent: 'Titan Alt Dmg',
	titan_crit: 'Titan Crit',
	titan_crit_percent: 'Titan Crit',
	titan_res: 'Titan Res',
	titan_flame_res: 'Titan Flame Res',
	titan_frost_res: 'Titan Frost Res',
	titan_volt_res: 'Titan Volt Res',
	titan_alt_res: 'Titan Alt Res',
	titan_phys_res: 'Titan Phys Res',
	titan_res_percent: 'Titan Res',
	titan_flame_res_percent: 'Titan Flame Res',
	titan_frost_res_percent: 'Titan Frost Res',
	titan_volt_res_percent: 'Titan Volt Res',
	titan_alt_res_percent: 'Titan Alt Res',
	titan_phys_res_percent: 'Titan Phys Res',
	// other stat screen stuff
	end: 'Endurance',
	end_regen: 'Endurance Regen',
	// buffs
	crit_dmg_percent: 'Crit Dmg',
	final_dmg_percent: 'Final Dmg',
	crit_res_reduction_percent: 'Crit Res Red',
	res_reduction_percent: 'Res Reduction',
	healing_percent: 'Healing',
	shield_dmg_reduction_ignore_percent: 'Shield Red Ignore',
	shatter: 'Shatter',
	// Resistance affecting
	res_ignore_percent: 'Res Ignore',
	phys_res_ignore_percent: 'Phys Res Ignore',
	flame_res_ignore_percent: 'Flame Res Ignore',
	frost_res_ignore_percent: 'Frost Res Ignore',
	volt_res_ignore_percent: 'Volt Res Ignore',
	alt_res_ignore_percent: 'Alt Res Ignore',
	final_dmg_taken_percent: 'Final Dmg Taken',
	ele_dmg_taken_percent: 'Ele Dmg Taken',
	phys_dmg_taken_percent: 'Phys Dmg Taken',
	flame_dmg_taken_percent: 'Flame Dmg Taken',
	frost_dmg_taken_percent: 'Frost Dmg Taken',
	volt_dmg_taken_percent: 'Volt Dmg Taken',
	alt_dmg_taken_percent: 'Alt Dmg Taken',
	// Attack Improvements
	base_atk_improvement_percent: 'Base Atk',
	base_phys_atk_improvement_percent: 'Base Phys Atk',
	base_flame_atk_improvement_percent: 'Base Flame Atk',
	base_frost_atk_improvement_percent: 'Base Frost Atk',
	base_volt_atk_improvement_percent: 'Base Volt Atk',
	base_alt_atk_improvement_percent: 'Base Alt Atk',
	relic_phys_dmg_percent: 'Relic Phys Dmg',
	relic_flame_dmg_percent: 'Relic Flame Dmg',
	relic_frost_dmg_percent: 'Relic Frost Dmg',
	relic_volt_dmg_percent: 'Relic Volt Dmg',
	relic_alt_dmg_percent: 'Relic Alt Dmg'
};

export const USER_STATS_LIST: StatGearUser[] = [
	'hp',
	'hp_percent',
	'atk',
	'flame_atk',
	'frost_atk',
	'volt_atk',
	'phys_atk',
	'alt_atk',
	'flame_atk_percent',
	'frost_atk_percent',
	'volt_atk_percent',
	'phys_atk_percent',
	'alt_atk_percent',
	'flame_dmg_percent',
	'frost_dmg_percent',
	'volt_dmg_percent',
	'phys_dmg_percent',
	'alt_dmg_percent',
	'crit',
	'crit_percent',
	'res',
	'flame_res',
	'frost_res',
	'volt_res',
	'alt_res',
	'phys_res',
	'res_percent',
	'flame_res_percent',
	'frost_res_percent',
	'volt_res_percent',
	'alt_res_percent',
	'phys_res_percent'
];

const KEYS_ATK: StatGearUser[] = ['phys_atk', 'flame_atk', 'frost_atk', 'volt_atk', 'alt_atk'];
const KEYS_ATK_PERCENT: StatGearUser[] = [
	'phys_atk_percent',
	'flame_atk_percent',
	'frost_atk_percent',
	'volt_atk_percent',
	'alt_atk_percent'
];
const STAT_GEAR_FINAL_KEYS: StatGearFinalUseful[] = [
	'hp',
	'crit',
	'crit_percent',
	'phys_atk',
	'flame_atk',
	'frost_atk',
	'volt_atk',
	'alt_atk',
	'crit_dmg_percent',
	'phys_res',
	'flame_res',
	'frost_res',
	'volt_res',
	'alt_res'
];

export const TEMPLATE_USER_ATTRIBUTES: { key: StatGearFinal }[] = [
	{ key: 'hp' },
	{ key: 'crit' },
	{ key: 'crit_percent' },
	{ key: 'phys_atk' },
	{ key: 'flame_atk' },
	{ key: 'frost_atk' },
	{ key: 'volt_atk' },
	{ key: 'alt_atk' },
	{ key: 'end' },
	{ key: 'end_regen' },
	{ key: 'crit_dmg_percent' },
	{ key: 'phys_res' },
	{ key: 'flame_res' },
	{ key: 'frost_res' },
	{ key: 'volt_res' },
	{ key: 'alt_res' }
];

export function getCritRate(crit: number, flat_rate_percent: number = 0, lvl: number = 100) {
	let crit_constant = 0;

	if (lvl >= 80) {
		crit_constant = -3.71 * lvl ** 2 + 1151 * lvl - 49787;
	} else if (lvl > 40) {
		crit_constant = -0.163 * lvl ** 2 + 285 * lvl - 3215;
	} else if (lvl > 10) {
		crit_constant = -4 * lvl ** 2 + 408 * lvl - 2078;
	} else {
		console.error('Invalid level!');
		crit_constant = 10000000;
	}

	return Math.min(crit / crit_constant + flat_rate_percent / 100, 1);
}

/**
 * StatCollection class allows for easy addition and subtraction of stats.
 */
export class StatCollection {
	public data: StatData = {};

	constructor();
	constructor(stat: StatData);
	constructor(stat: GearView);
	constructor(stat: BaseStats14);
	constructor(stat: BaseStats14Number);
	constructor(stat: StatKey, value: number);
	constructor(stat: StatGearTitan, value: number);
	constructor(
		stat?: StatKey | StatGearTitan | StatData | GearView | BaseStats14 | BaseStats14Number,
		value?: number
	) {
		if (stat === undefined) {
			this.data = {};
		} else if (typeof stat === 'string') {
			this.data = {};
			this.data[stat.replace('titan_', '') as StatGearUser] = value ?? 0;
		} else if (Array.isArray(stat)) {
			this.data = {};

			if (stat.length === 14) {
				if (typeof stat[0] === 'string') {
					for (let i = 0; i < 14; i++) {
						this.data[STAT_GEAR_FINAL_KEYS[i]] = parseFloat(stat[i] as string);
					}
				} else {
					for (let i = 0; i < 14; i++) {
						this.data[STAT_GEAR_FINAL_KEYS[i]] = stat[i] as number;
					}
				}
			} else {
				throw new Error('Invalid base stats length!');
			}
		} else if (typeof stat === 'object') {
			if ('derived' in stat) {
				this.data = {};
				const gearView = stat as GearView;

				gearView.derived.forEach((stat) => {
					if (stat.stat.startsWith('titan_')) {
						this.data[stat.stat.replace('titan_', '') as StatGearUser] = stat.value;
					}
				});
			} else {
				this.data = stat;
			}
		}
	}

	get(stat: StatKey): number {
		return this.data[stat] ?? 0;
	}

	put(stat: StatKey, value: number) {
		this.data[stat] = value;
	}

	pop(stat: StatKey) {
		const value = this.data[stat];
		delete this.data[stat];
		return value;
	}

	clone_data(): StatData {
		return { ...this.data };
	}

	clone(): StatCollection {
		return new StatCollection(this.data);
	}

	add(other: StatCollection): StatCollection {
		const new_data: StatData = this.clone_data();

		for (const key in other.data) {
			const otherValue = other.data[key as StatGearUser] ?? 0;
			if (!(key in new_data)) {
				// console.log(key, 'assigning as', otherValue);
				new_data[key as StatGearUser] = otherValue;
			} else {
				// console.log(key, new_data[key as StatGearUser], '+', otherValue);
				new_data[key as StatGearUser] = (new_data[key as StatGearUser] ?? 0) + otherValue;
			}
		}

		return new StatCollection(new_data);
	}

	subtract(other: StatCollection): StatCollection {
		const new_data: StatData = this.clone_data();

		for (const key in other.data) {
			const otherValue = other.data[key as StatGearUser] ?? 0;
			if (!(key in new_data)) {
				new_data[key as StatGearUser] = -otherValue;
			} else {
				new_data[key as StatGearUser] = (new_data[key as StatGearUser] ?? 0) - otherValue;
			}
		}

		return new StatCollection(new_data);
	}

	to_displayed_stats(): BaseStats14Number {
		const new_d = this.clone_data();
		new_d.hp = this.get('hp') * (1 + this.get('hp_percent') / 100);
		new_d.crit = this.get('crit');
		new_d.crit_percent = this.get('crit_percent');
		new_d.phys_atk =
			(this.get('atk') + this.get('phys_atk')) *
			(1 + (this.get('atk_percent') + this.get('phys_atk_percent')) / 100);
		new_d.flame_atk =
			(this.get('atk') + this.get('flame_atk')) *
			(1 + (this.get('atk_percent') + this.get('flame_atk_percent')) / 100);
		new_d.frost_atk =
			(this.get('atk') + this.get('frost_atk')) *
			(1 + (this.get('atk_percent') + this.get('frost_atk_percent')) / 100);
		new_d.volt_atk =
			(this.get('atk') + this.get('volt_atk')) *
			(1 + (this.get('atk_percent') + this.get('volt_atk_percent')) / 100);
		new_d.alt_atk =
			(Math.max(new_d.phys_atk, new_d.flame_atk, new_d.frost_atk, new_d.volt_atk) +
				this.get('alt_atk')) *
			(1 + this.get('alt_atk_percent') / 100);
		new_d.crit_dmg_percent = this.get('crit_dmg_percent');
		new_d.phys_res =
			(this.get('res') + this.get('phys_res')) *
			(1 + this.get('res_percent') / 100 + this.get('phys_res_percent') / 100);
		new_d.flame_res =
			(this.get('res') + this.get('flame_res')) *
			(1 + this.get('res_percent') / 100 + this.get('flame_res_percent') / 100);
		new_d.frost_res =
			(this.get('res') + this.get('frost_res')) *
			(1 + this.get('res_percent') / 100 + this.get('frost_res_percent') / 100);
		new_d.volt_res =
			(this.get('res') + this.get('volt_res')) *
			(1 + this.get('res_percent') / 100 + this.get('volt_res_percent') / 100);
		new_d.alt_res =
			(this.get('res') + this.get('alt_res')) *
			(1 + this.get('res_percent') / 100 + this.get('alt_res_percent') / 100);

		const base_stats: number[] = [];

		for (const key of STAT_GEAR_FINAL_KEYS) {
			base_stats.push((new_d as { [key in StatGearFinalUseful]: number })[key]);
		}

		return base_stats as BaseStats14Number;
	}

	/**
	 * Calculates the base stat assuming that this encompasses all buffs.
	 * @param {BaseStats16} final_stats - Stats as seen on the character screen.
	 * @returns Calculated base stats
	 */
	calc_loadout_base_stats(final_stats: BaseStats16): BaseStats16Number {
		// value correspond to index in StatGearFinal
		const base_stats: number[] = [];

		for (let i = 0; i < final_stats.length; i++) {
			switch (i) {
				case 0: // hp
					base_stats.push(parseInt(final_stats[i]) / (1 + this.get('hp_percent') / 100));
					break;
				case 1: // crit
					base_stats.push(parseInt(final_stats[i]));
					break;
				case 2: // crit_percent
					base_stats.push(parseFloat(final_stats[i]) - this.get('crit_percent'));
					break;
				case 3: // phys_atk
					base_stats.push(
						parseInt(final_stats[i]) /
							(1 + this.get('phys_atk_percent') / 100 + this.get('atk_percent') / 100)
					);
					break;
				case 4: // flame_atk
					base_stats.push(
						parseInt(final_stats[i]) /
							(1 + this.get('flame_atk_percent') / 100 + this.get('atk_percent') / 100)
					);
					break;
				case 5: // frost_atk
					base_stats.push(
						parseInt(final_stats[i]) /
							(1 + this.get('frost_atk_percent') / 100 + this.get('atk_percent') / 100)
					);
					break;
				case 6: // volt_atk
					base_stats.push(
						parseInt(final_stats[i]) /
							(1 + this.get('volt_atk_percent') / 100 + this.get('atk_percent') / 100)
					);
					break;
				case 7: {
					// alt_atk, shouldnt matter anyway
					base_stats.push(Math.max(...base_stats.slice(3, 7)));
					break;
				}
				case 8: // end
					base_stats.push(parseInt(final_stats[i]));
					break;
				case 9: // end_regen
					base_stats.push(parseFloat(final_stats[i]));
					break;
				case 10: // crit_damage
					base_stats.push(parseFloat(final_stats[i]) - this.get('crit_dmg_percent'));
					break;
				case 11: // phys_res
					base_stats.push(parseInt(final_stats[i]) / (1 + this.get('phys_res_percent') / 100));
					break;
				case 12: // flame_res
					base_stats.push(parseInt(final_stats[i]) / (1 + this.get('flame_res_percent') / 100));
					break;
				case 13: // frost_res
					base_stats.push(parseInt(final_stats[i]) / (1 + this.get('frost_res_percent') / 100));
					break;
				case 14: // volt_res
					base_stats.push(parseInt(final_stats[i]) / (1 + this.get('volt_res_percent') / 100));
					break;
				case 15: // alt_res
					base_stats.push(parseInt(final_stats[i]) / (1 + this.get('alt_res_percent') / 100));
					break;
			}
		}

		return base_stats as BaseStats16Number;
	}

	/**
	 * Calculates the real base stats
	 * @param {number[]} base_atk_stats - Base atk stats as seen on the character screen.
	 * @returns
	 */
	calc_real_base_stats(
		final_stats: BaseStats16,
		base_atk_stats: AtkStats5Number
	): BaseStats14Number {
		// iterate through base_atk_stats
		const final_base_stats: number[] = [];

		for (let i = 0; i < final_stats.length; i++) {
			switch (i) {
				case 0: // hp
					final_base_stats.push(
						parseInt(final_stats[i]) / (1 + this.get('hp_percent') / 100) - this.get('hp')
					);
					break;
				case 1: // crit
					final_base_stats.push(parseInt(final_stats[i]) - this.get('crit'));
					break;
				case 2: // crit_percent
					final_base_stats.push(parseFloat(final_stats[i]) - this.get('crit_percent'));
					break;
				case 3: // phys_atk
					final_base_stats.push(base_atk_stats[0] - this.get(KEYS_ATK[0]) - this.get('atk'));
					break;
				case 4: // flame_atk
					final_base_stats.push(base_atk_stats[1] - this.get(KEYS_ATK[1]) - this.get('atk'));
					break;
				case 5: // frost_atk
					final_base_stats.push(base_atk_stats[2] - this.get(KEYS_ATK[2]) - this.get('atk'));
					break;
				case 6: // volt_atk
					final_base_stats.push(base_atk_stats[3] - this.get(KEYS_ATK[3]) - this.get('atk'));
					break;
				case 7: // alt atk
					final_base_stats.push(0);
					break;
				case 10: // crit_damage
					final_base_stats.push(50);
					break;
				case 11: // phys_res
					final_base_stats.push(
						parseInt(final_stats[i]) / (1 + this.get('phys_res_percent') / 100) -
							this.get('phys_res')
					);
					break;
				case 12: // flame_res
					final_base_stats.push(
						parseInt(final_stats[i]) / (1 + this.get('flame_res_percent') / 100) -
							this.get('flame_res')
					);
					break;
				case 13: // frost_res
					final_base_stats.push(
						parseInt(final_stats[i]) / (1 + this.get('frost_res_percent') / 100) -
							this.get('frost_res')
					);
					break;
				case 14: // volt_res
					final_base_stats.push(
						parseInt(final_stats[i]) / (1 + this.get('volt_res_percent') / 100) -
							this.get('volt_res')
					);
					break;
				case 15: // alt_res
					final_base_stats.push(
						parseInt(final_stats[i]) / (1 + this.get('alt_res_percent') / 100) - this.get('alt_res')
					);
					break;
				default:
					break;
			}
		}

		// round stats to nearest integer
		final_base_stats.forEach((value, index) => {
			if (index === 2 || index === 8) {
				return;
			}

			final_base_stats[index] = Math.round(value);
		});

		return final_base_stats as BaseStats14Number;
	}

	/**
	 * Calculates the extra atk percent stats required to reach the final stats, given the base_atk_stats.
	 * @param {BaseStats16} final_stats - Final stats as seen on the character screen.
	 * @param {number[]} base_atk_stats - Base atk stats as seen on the character screen.
	 * @returns Calculated extra stats.
	 */
	calc_extra_atk_from(final_stats: BaseStats16, base_atk_stats: AtkStats5Number): StatCollection {
		// iterate through base_atk_stats
		const new_data: StatData = {};

		for (let i = 0; i < base_atk_stats.length - 1; i++) {
			new_data[KEYS_ATK_PERCENT[i]] =
				(parseInt(final_stats[i + 3]) / base_atk_stats[i] -
					(1 + (this.get(KEYS_ATK_PERCENT[i]) + this.get('atk_percent')) / 100)) *
				100;
		}

		return new StatCollection(new_data);
	}

	/**
	 * Lumps the atk and ele_dmg stats to their respective elements
	 */
	lump() {
		const new_data: LumpedStatData = {};

		// atk
		new_data.phys_atk = this.get('phys_atk') + this.get('atk');
		new_data.flame_atk = this.get('flame_atk') + this.get('atk');
		new_data.frost_atk = this.get('frost_atk') + this.get('atk');
		new_data.volt_atk = this.get('volt_atk') + this.get('atk');
		new_data.alt_atk =
			Math.max(new_data.phys_atk, new_data.flame_atk, new_data.frost_atk, new_data.volt_atk) +
			this.get('alt_atk');

		// atk percent
		new_data.phys_atk_percent = this.get('phys_atk_percent') + this.get('atk_percent');
		new_data.flame_atk_percent = this.get('flame_atk_percent') + this.get('atk_percent');
		new_data.frost_atk_percent = this.get('frost_atk_percent') + this.get('atk_percent');
		new_data.volt_atk_percent = this.get('volt_atk_percent') + this.get('atk_percent');
		new_data.alt_atk_percent = this.get('alt_atk_percent');

		// ele_dmg
		new_data.phys_dmg_percent = this.get('phys_dmg_percent') + this.get('ele_dmg_percent');
		new_data.flame_dmg_percent = this.get('flame_dmg_percent') + this.get('ele_dmg_percent');
		new_data.frost_dmg_percent = this.get('frost_dmg_percent') + this.get('ele_dmg_percent');
		new_data.volt_dmg_percent = this.get('volt_dmg_percent') + this.get('ele_dmg_percent');
		new_data.alt_dmg_percent = this.get('alt_dmg_percent') + this.get('ele_dmg_percent');

		// relic ele_dmg
		new_data.relic_phys_dmg_percent = this.get('relic_phys_dmg_percent');
		new_data.relic_flame_dmg_percent = this.get('relic_flame_dmg_percent');
		new_data.relic_frost_dmg_percent = this.get('relic_frost_dmg_percent');
		new_data.relic_volt_dmg_percent = this.get('relic_volt_dmg_percent');
		new_data.relic_alt_dmg_percent = this.get('relic_alt_dmg_percent');

		// crit
		new_data.crit = this.get('crit');
		new_data.crit_percent = this.get('crit_percent');
		new_data.crit_dmg_percent = this.get('crit_dmg_percent');

		// dmg_percent
		new_data.final_dmg_percent = this.get('final_dmg_percent');

		return new LumpedStatCollection(new_data);
	}
}

/**
 * LumpedStatCollection allows for calculation of multipliers.
 * The reference is all stats except the one being calculated;
 * Multiplier = Stat / (Total Player Stat - Stat)
 */
export class LumpedStatCollection {
	public data: LumpedStatData = {};

	constructor(data?: LumpedStatData) {
		if (data) {
			this.data = data;
		} else {
			this.data = {};
		}
	}

	get(stat: LumpedKey): number {
		return this.data[stat] ?? 0;
	}

	clone_data(): LumpedStatData {
		return { ...this.data };
	}

	clone(): LumpedStatCollection {
		return new LumpedStatCollection(this.data);
	}

	/**
	 * Calculates the multipliers of stat collection to determine improvement over current stats
	 * @param {LumpedStatCollection} other_col - object's multipliers to calculate. Must not be part of the original collection
	 * @param {Elements} element - element of current loadout
	 */
	total_multiplier_of(other_col: LumpedStatCollection, element: Elements, level: number = 100) {
		let multiplier = 1;

		// base atk
		multiplier *= 1 + other_col.get(`${element}_atk`) / this.get(`${element}_atk`);
		// atk percent
		multiplier *=
			1 + other_col.get(`${element}_atk_percent`) / (1 + this.get(`${element}_atk_percent`));
		// ele percent
		multiplier *=
			1 + other_col.get(`${element}_dmg_percent`) / (1 + this.get(`${element}_dmg_percent`));
		// relic ele percent
		multiplier *=
			1 +
			other_col.get(`relic_${element}_dmg_percent`) /
				(1 + this.get(`relic_${element}_dmg_percent`));
		// crit
		const r0 = getCritRate(this.get('crit'), this.get('crit_percent'), level);
		const r1 = getCritRate(
			this.get('crit') + other_col.get('crit'),
			this.get('crit_percent') + other_col.get('crit_percent'),
			level
		);
		const d0 = this.get('crit_dmg_percent') / 100;
		const d1 = (this.get('crit_dmg_percent') + other_col.get('crit_dmg_percent')) / 100;
		multiplier *= (1 + r1 * d1) / (1 + r0 * d0);

		return multiplier;
	}
}
