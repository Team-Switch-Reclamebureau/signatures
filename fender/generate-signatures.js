#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const Handlebars = require('handlebars');
const sharp = require('sharp');

// Read contacts database
const contactsData = fs.readFileSync('./contacts.json', 'utf-8');
const contacts = JSON.parse(contactsData).contacts;

// Configuration for templates and variants
const templates = [
	{
		name: '2026',
		templatePath: './templates/2026.html',
		outputDir: './2026',
	},
];

const imageExtensions = new Set([
	'.avif',
	'.gif',
	'.jpeg',
	'.jpg',
	'.png',
	'.tif',
	'.tiff',
	'.webp',
]);

// Create output directories if they don't exist
templates.forEach((template) => {
	if (!fs.existsSync(template.outputDir)) {
		fs.mkdirSync(template.outputDir, { recursive: true });
	}
});

async function resizeSourceImages(template) {
	const sourceImagesDir = path.join(template.outputDir, 'source-images');
	const imgDir = path.join(template.outputDir, 'img');

	if (!fs.existsSync(sourceImagesDir)) {
		return;
	}

	if (!fs.existsSync(imgDir)) {
		fs.mkdirSync(imgDir, { recursive: true });
	}

	const sourceFiles = fs
		.readdirSync(sourceImagesDir, { withFileTypes: true })
		.filter((entry) => entry.isFile())
		.map((entry) => entry.name)
		.filter((fileName) =>
			imageExtensions.has(path.extname(fileName).toLowerCase()),
		);

	for (const fileName of sourceFiles) {
		const inputPath = path.join(sourceImagesDir, fileName);
		const outputPath = path.join(
			imgDir,
			`${path.parse(fileName).name}.jpg`,
		);

		await sharp(inputPath)
			.resize({ width: 200 })
			.flatten({ background: '#ffffff' })
			.jpeg({ quality: 90 })
			.toFile(outputPath);

		console.log(`🖼️  Resized: ${outputPath}`);
	}
}

// Register Handlebars helpers if needed
Handlebars.registerHelper('toUpperCase', (str) => {
	return str ? str.toUpperCase() : '';
});

Handlebars.registerHelper('toLowerCase', (str) => {
	return str ? str.toLowerCase() : '';
});

async function main() {
	// Generate signatures for each contact and template
	for (const template of templates) {
		if (!fs.existsSync(template.templatePath)) {
			console.warn(`⚠️  Template not found: ${template.templatePath}`);
			continue;
		}

		await resizeSourceImages(template);

		const templateContent = fs.readFileSync(template.templatePath, 'utf-8');
		const compiledTemplate = Handlebars.compile(templateContent);

		contacts.forEach((contact) => {
			try {
				const html = compiledTemplate(contact);
				const outputPath = path.join(
					template.outputDir,
					`${contact.id}.html`,
				);
				fs.writeFileSync(outputPath, html);
				console.log(`✅ Generated: ${outputPath}`);
			} catch (error) {
				console.error(
					`❌ Error generating ${contact.id} for ${template.name}:`,
					error.message,
				);
			}
		});
	}

	console.log('\n🎉 All signatures generated successfully!');
}

main().catch((error) => {
	console.error('❌ Error generating signatures:', error.message);
	process.exitCode = 1;
});
