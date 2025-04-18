type Format = 'int' | 'float3d' | 'float2d';

export function formatValue(format: Format, value: string | number): string {
	if (typeof value === 'number') {
		switch (format) {
			case 'int':
				return value.toFixed(0);
			case 'float3d':
				return value.toFixed(3) + '%';
			case 'float2d':
				return value.toFixed(2) + '%';
		}
	} else {
		switch (format) {
			case 'int':
				return String(parseInt(value, 10));
			case 'float3d':
				return String(Number(value).toFixed(3)) + '%';
			case 'float2d':
				return String(Number(value).toFixed(2)) + '%';
		}
	}
}
