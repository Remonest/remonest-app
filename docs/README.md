# Documentation

This directory contains documentation for the Remonest application features.

## Available Documentation

- **[Language Switcher](./LANGUAGE_SWITCHER.md)** - Complete guide to implementing and using the Indonesian/English language switcher feature
- **[Project](./PROJECT.md)** - Project overview, architecture, and development guidelines
- **[Implementation Guide](./IMPLEMENTATION.md)** - Detailed implementation guide for the Remonest platform
- **[Job Board Implementation](./JOB_BOARD_IMPLEMENTATION.md)** - Guide to the job board feature implementation

## Getting Started

### Adding New Features

When adding a new feature to the landing page or app, follow this pattern:

1. **Plan the Feature**
   - Define what needs to be translated
   - Identify all user-facing text
   - Plan component structure

2. **Update Translation Types**
   ```typescript
   // src/lib/translations.ts
   interface Translations {
     newFeature: {
       title: string;
       description: string;
     };
   }
   ```

3. **Add Translations**
   ```typescript
   const translations = {
     en: {
       newFeature: {
         title: "English Title",
         description: "English Description",
       },
     },
     id: {
       newFeature: {
         title: "Judul Indonesia",
         description: "Deskripsi Indonesia",
       },
     },
   };
   ```

4. **Implement Component**
   ```tsx
   import { useTranslations } from "@/lib/translations";
   
   function NewFeature() {
     const { t } = useTranslations();
     return <h1>{t.newFeature.title}</h1>;
   }
   ```

## Documentation Guidelines

### Structure
- Use clear, descriptive titles
- Include code examples for all major concepts
- Provide both desktop and mobile considerations
- Add troubleshooting sections

### Code Examples
- Show import statements
- Include type definitions
- Provide both simple and advanced usage
- Use TypeScript examples

### Testing
- Include testing instructions
- Provide expected behavior
- List common issues and solutions

## Architecture Overview

### Language System
- **Context:** React Context for global language state
- **Hook:** `useTranslations` for component access
- **Provider:** `TranslationProvider` for app-wide support
- **Data:** Centralized translation objects

### Component Integration
1. Landing page wrapped with `TranslationProvider`
2. Components use `useTranslations` hook
3. Language state managed centrally
4. Updates propagate automatically

## Contributing

When adding documentation:
1. Create separate files for major features
2. Update this README with new documentation links
3. Follow existing formatting
4. Include code examples
5. Test all examples

## Support

For issues or questions about:
- **Language Switcher:** See [Language Switcher Documentation](./LANGUAGE_SWITCHER.md)
- **Other Features:** Check the codebase or create an issue

## Quick Reference

### Key Files
- `src/lib/translations.ts` - Translation data and context
- `src/components/landing/language-switcher.tsx` - Language toggle component
- `src/components/landing/header.tsx` - Header with language support
- `src/app/(main)/page.tsx` - Main landing page

### Common Tasks
- **Add translation:** Update `translations.ts`
- **Use translation:** Import `useTranslations` hook
- **Change language:** Call `setLanguage` from hook
- **Add language:** Extend `Language` type and translation objects