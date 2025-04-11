import type { GearView } from './gears';
import type { StatGearTitan, StatGearUser, StatNonGear } from './stats';

export type StatData = {
	[key in StatGearUser | StatNonGear]?: number;
};

export class StatCollection {
	private data: StatData = {};

	constructor();
	constructor(stat: StatData);
	constructor(stat: GearView);
	constructor(stat: StatGearUser, value: number);
	constructor(stat: StatGearTitan, value: number);
	constructor(stat?: StatGearUser | StatGearTitan | StatData | GearView, value?: number) {
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
						// console.log('adding titan stat', stat.stat, 'with value', stat.value);
						this.data[stat.stat.replace('titan_', '') as StatGearUser] = stat.value;
					}
				});
			} else {
				this.data = stat;
			}
		}
	}

	get(stat: StatGearUser | StatNonGear): number {
		return this.data[stat] ?? 0;
	}

	clone_data(): StatData {
		return { ...this.data };
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

	calc_base_from(final_stats: string[]): number[] {
		if (Object.keys(this.data).length === 0) {
			return final_stats.map((value) => parseFloat(value));
		}

		// value correspond to index in StatGearFinal
		const base_stats: number[] = [];

		for (let i = 0; i < final_stats.length; i++) {
			switch (i) {
				case 0: // hp
					base_stats.push(
						parseInt(final_stats[i]) / (1 + this.get('hp_percent') / 100) - this.get('hp')
					);
					break;
				case 1: // crit
					base_stats.push(parseInt(final_stats[i]) - this.get('crit'));
					break;
				case 2: // crit_percent
					base_stats.push(parseFloat(final_stats[i]) - this.get('crit_percent'));
					break;
				case 3: // phys_atk
					base_stats.push(
						parseInt(final_stats[i]) /
							(1 + this.get('phys_atk_percent') / 100 + this.get('atk_percent') / 100) -
							(this.get('phys_atk') + this.get('atk'))
					);
					break;
				case 4: // flame_atk
					base_stats.push(
						parseInt(final_stats[i]) /
							(1 + this.get('flame_atk_percent') / 100 + this.get('atk_percent') / 100) -
							(this.get('flame_atk') + this.get('atk'))
					);
					break;
				case 5: // frost_atk
					base_stats.push(
						parseInt(final_stats[i]) /
							(1 + this.get('frost_atk_percent') / 100 + this.get('atk_percent') / 100) -
							(this.get('frost_atk') + this.get('atk'))
					);
					break;
				case 6: // volt_atk
					base_stats.push(
						parseInt(final_stats[i]) /
							(1 + this.get('volt_atk_percent') / 100 + this.get('atk_percent') / 100) -
							(this.get('volt_atk') + this.get('atk'))
					);
					break;
				case 7: {
					// alt_atk
					const alt_atk = Math.max(...base_stats.slice(3, 7));
					base_stats.push(alt_atk / (1 + this.get('alt_atk_percent') / 100) - this.get('alt_atk'));
					break;
				}
				case 8: // end
					base_stats.push(parseInt(final_stats[i]));
					break;
				case 9: // end_regen
					base_stats.push(parseFloat(final_stats[i]));
					break;
				case 10: // crit_damage
					base_stats.push(parseFloat(final_stats[i]) - this.get('crit_dmg'));
					break;
				case 11: // phys_res
					base_stats.push(parseInt(final_stats[i]) - this.get('phys_res') - this.get('res'));
					break;
				case 12: // flame_res
					base_stats.push(parseInt(final_stats[i]) - this.get('flame_res') - this.get('res'));
					break;
				case 13: // frost_res
					base_stats.push(parseInt(final_stats[i]) - this.get('frost_res') - this.get('res'));
					break;
				case 14: // volt_res
					base_stats.push(parseInt(final_stats[i]) - this.get('volt_res') - this.get('res'));
					break;
				case 15: // alt_res
					base_stats.push(parseInt(final_stats[i]) - this.get('alt_res') - this.get('res'));
					break;
			}
		}

		return base_stats;
	}
}
