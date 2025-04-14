import Ajv, { type ValidateFunction } from 'ajv';
import fs from 'fs';
import path from 'path';

const ajv = new Ajv();

// Paths to the schema and JSON directories
const schemaDir = path.join(process.cwd(), 'src/lib/schemas');
const jsonBaseDir = path.join(process.cwd(), 'static/json');

// Define types for validation errors and results
type ValidationError = {
	message: string;
	paramName?: string;
	schemaPath?: string;
	[key: string]: unknown;
};

type ValidationResult = {
	valid: boolean;
	errors: ValidationError[] | null;
	data: unknown;
};

type SchemaValidator = {
	name: string;
	validate: ValidateFunction;
};

/**
 * Loads all schemas from the schema directory
 */
function loadSchemas(): SchemaValidator[] {
	try {
		const schemaFiles = fs.readdirSync(schemaDir);
		const validators: SchemaValidator[] = [];

		for (const file of schemaFiles) {
			if (file.endsWith('.schema.json')) {
				const schemaName = file.replace('.schema.json', '');
				const schemaPath = path.join(schemaDir, file);
				const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
				validators.push({
					name: schemaName,
					validate: ajv.compile(schema)
				});
			}
		}

		return validators;
	} catch (error) {
		console.error('Error loading schemas:', error instanceof Error ? error.message : String(error));
		return [];
	}
}

/**
 * Validates JSON files in a directory against a specific validator
 */
function validateJsonFilesForSchema(
	schemaName: string,
	validator: ValidateFunction
): ValidationResult[] {
	const results: ValidationResult[] = [];
	const jsonDir = path.join(jsonBaseDir, schemaName);

	if (!fs.existsSync(jsonDir)) {
		console.log(`No JSON directory found for schema ${schemaName} at ${jsonDir}`);
		return results;
	}

	try {
		const files = fs.readdirSync(jsonDir);

		console.log(`Current schema: ${schemaName}`);

		for (const file of files) {
			if (file.endsWith('.json')) {
				const filePath = path.join(jsonDir, file);
				try {
					const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
					const valid = validator(data);
					results.push({
						valid,
						errors: validator.errors as ValidationError[] | null,
						data
					});

					if (valid) {
						console.log(`✅ ${path.basename(filePath)}`);
					} else {
						console.error(`❌ ${path.basename(filePath)}:`);
						console.error(JSON.stringify(validator.errors, null, 2));
					}
				} catch (error) {
					results.push({
						valid: false,
						errors: [
							{
								message: `Error reading or parsing file: ${error instanceof Error ? error.message : String(error)}`
							}
						],
						data: null
					});
					console.error(`❌ ${path.basename(filePath)}: Error reading/parsing file`);
				}
			}
		}
	} catch (error) {
		console.error(
			`Error reading JSON directory for ${schemaName}:`,
			error instanceof Error ? error.message : String(error)
		);
	}

	return results;
}

/**
 * Main validation function that coordinates schema loading and validation
 */
function runValidation() {
	const validators = loadSchemas();
	let hasErrors = false;

	if (validators.length === 0) {
		console.error('No schemas found in', schemaDir);
		process.exit(1);
	}

	console.log(`Found ${validators.length} schemas:`);
	validators.forEach((v) => console.log(`- ${v.name}`));

	for (const validator of validators) {
		const results = validateJsonFilesForSchema(validator.name, validator.validate);

		const invalidResults = results.filter((r) => !r.valid);
		if (invalidResults.length > 0) {
			hasErrors = true;
		}
	}

	if (hasErrors) {
		console.error('Validation completed with errors');
		process.exit(1);
	} else {
		console.log('All files validated successfully');
		process.exit(0);
	}
}

// Run the validation when this script is executed
if (import.meta.url === `file://${process.argv[1]}`) {
	runValidation();
}
