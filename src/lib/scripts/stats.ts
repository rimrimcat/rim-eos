import type {
	AllStats,
	GearView,
	StatData,
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
	dmg_percent: 'Dmg',
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
	titan_atk_percent: 'Titan ATK',
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
	final_dmg_increase_percent: 'Final Dmg Increase',
	ele_dmg_taken_percent: 'Ele Dmg Taken',
	phys_dmg_taken_percent: 'Phys Dmg Taken',
	flame_dmg_taken_percent: 'Flame Dmg Taken',
	frost_dmg_taken_percent: 'Frost Dmg Taken',
	volt_dmg_taken_percent: 'Volt Dmg Taken',
	alt_dmg_taken_percent: 'Alt Dmg Taken'
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

export const ALL_STATS_LIST = [
	'hp',
	'hp_percent',
	'atk',
	'flame_atk',
	'frost_atk',
	'volt_atk',
	'phys_atk',
	'alt_atk',
	'atk_percent',
	'flame_atk_percent',
	'frost_atk_percent',
	'volt_atk_percent',
	'phys_atk_percent',
	'alt_atk_percent',
	'dmg_percent',
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
	'phys_res_percent',
	'titan_hp',
	'titan_hp_percent',
	'titan_atk',
	'titan_flame_atk',
	'titan_frost_atk',
	'titan_volt_atk',
	'titan_phys_atk',
	'titan_alt_atk',
	'titan_atk_percent',
	'titan_flame_atk_percent',
	'titan_frost_atk_percent',
	'titan_volt_atk_percent',
	'titan_phys_atk_percent',
	'titan_alt_atk_percent',
	'titan_dmg_percent',
	'titan_flame_dmg_percent',
	'titan_frost_dmg_percent',
	'titan_volt_dmg_percent',
	'titan_phys_dmg_percent',
	'titan_alt_dmg_percent',
	'titan_crit',
	'titan_crit_percent',
	'titan_res',
	'titan_flame_res',
	'titan_frost_res',
	'titan_volt_res',
	'titan_alt_res',
	'titan_phys_res',
	'titan_res_percent',
	'titan_flame_res_percent',
	'titan_frost_res_percent',
	'titan_volt_res_percent',
	'titan_alt_res_percent',
	'titan_phys_res_percent'
];

const KEYS_ATK: StatGearUser[] = ['phys_atk', 'flame_atk', 'frost_atk', 'volt_atk', 'alt_atk'];
const KEYS_ATK_PERCENT: StatGearUser[] = [
	'phys_atk_percent',
	'flame_atk_percent',
	'frost_atk_percent',
	'volt_atk_percent',
	'alt_atk_percent'
];

export class StatCollection {
	public data: StatData = {};

	constructor();
	constructor(stat: StatData);
	constructor(stat: GearView);
	constructor(stat: StatGearUser, value: number);
	constructor(stat: StatGearTitan, value: number);
	constructor(stat?: StatKey | StatGearTitan | StatData | GearView, value?: number) {
		if (stat === undefined) {
			this.data = {};
		} else if (typeof stat === 'string') {
			this.data = {};
			this.data[stat.replace('titan_', '') as StatGearUser] = value ?? 0;
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

	/**
	 * Calculates the base stat assuming that this encompasses all buffs.
	 * @param {string[]} final_stats - Stats as seen on the character screen.
	 * @returns Calculated base stats
	 */
	calc_loadout_base_stats(final_stats: string[]): number[] {
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

		return base_stats;
	}

	/**
	 * Calculates the real base stats
	 * @param {number[]} base_atk_stats - Base atk stats as seen on the character screen.
	 * @returns
	 */
	calc_real_base_stats(final_stats: string[], base_atk_stats: number[]): number[] {
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
					final_base_stats.push(Math.max(...final_base_stats.slice(3, 7)));
					break;
				case 8: // end
					final_base_stats.push(1400);
					break;
				case 9: // end_regen
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

		return final_base_stats;
	}

	/**
	 * Calculates the extra atk percent stats required to reach the final stats, given the base_atk_stats.
	 * @param {string[]} final_stats - Final stats as seen on the character screen.
	 * @param {number[]} base_atk_stats - Base atk stats as seen on the character screen.
	 * @returns Calculated extra stats.
	 */
	calc_extra_atk_from(final_stats: string[], base_atk_stats: number[]): StatCollection {
		// iterate through base_atk_stats
		const new_data: StatData = {};

		for (let i = 0; i < base_atk_stats.length - 1; i++) {
			new_data[KEYS_ATK_PERCENT[i]] =
				(parseInt(final_stats[i + 3]) / (base_atk_stats[i] + this.get(KEYS_ATK[i])) -
					(1 + this.get(KEYS_ATK_PERCENT[i]) / 100)) *
				100;
		}

		return new StatCollection(new_data);
	}
}
