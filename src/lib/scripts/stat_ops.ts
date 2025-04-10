import type { GearView } from './gears';
import type { StatGearTitan, StatGearUser } from './stats';

export type StatData = {
	[key in StatGearUser]?: number;
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
					this.data[stat.stat.replace('titan_', '') as StatGearUser] = stat.value;
				});
			} else {
				this.data = stat;
			}
		}
	}

	get(stat: StatGearUser): number {
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
				new_data[key as StatGearUser] = otherValue;
			} else {
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
}
