#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const Handlebars = require('handlebars');

// Read contacts database
const contactsData = fs.readFileSync('./contacts.json', 'utf-8');
const contacts = JSON.parse(contactsData).contacts;

// Configuration for templates and variants
const templates = [
	{
		name: 'original',
		templatePath: './templates/original.html',
		outputDir: './original',
	},
	{
		name: 'beter',
		templatePath: './templates/beter.html',
		outputDir: './beter',
	},
	{
		name: 'kerst',
		templatePath: './templates/kerst.html',
		outputDir: './kerst',
	},
	{
		name: 'newyear',
		templatePath: './templates/newyear.html',
		outputDir: './newyear',
	},
	{
		name: 'sinterklaas',
		templatePath: './templates/sinterklaas.html',
		outputDir: './sinterklaas',
	},
];

// Create output directories if they don't exist
templates.forEach((template) => {
	if (!fs.existsSync(template.outputDir)) {
		fs.mkdirSync(template.outputDir, { recursive: true });
	}
});

// Register Handlebars helpers if needed
Handlebars.registerHelper('toUpperCase', (str) => {
	return str ? str.toUpperCase() : '';
});

Handlebars.registerHelper('toLowerCase', (str) => {
	return str ? str.toLowerCase() : '';
});

// Generate signatures for each contact and template
templates.forEach((template) => {
	if (!fs.existsSync(template.templatePath)) {
		console.warn(`⚠️  Template not found: ${template.templatePath}`);
		return;
	}

	const templateContent = fs.readFileSync(template.templatePath, 'utf-8');
	const compiledTemplate = Handlebars.compile(templateContent);

	contacts.forEach((contact) => {
		try {
			const html = compiledTemplate(contact);
			const outputPath = path.join(
				template.outputDir,
				`${contact.id}.html`
			);
			fs.writeFileSync(outputPath, html);
			console.log(`✅ Generated: ${outputPath}`);
		} catch (error) {
			console.error(
				`❌ Error generating ${contact.id} for ${template.name}:`,
				error.message
			);
		}
	});
});

console.log('\n🎉 All signatures generated successfully!');
