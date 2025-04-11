type Format = 'int' | 'float3d';

export function formatValue(format: Format, value: string): string {
	switch (format) {
		case 'int':
			return String(parseInt(value, 10));
		case 'float3d':
			return String(Number(value).toFixed(3)) + '%';
	}
}
