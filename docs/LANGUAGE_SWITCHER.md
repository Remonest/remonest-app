# Language Switcher Documentation

## Overview
The language switcher allows users to toggle between Indonesian (ID) and English (EN) on the landing page. It's implemented using React Context for state management and includes both desktop and mobile interfaces.

## Installation
The feature uses `next-intl` package which has been installed:
```bash
npm install next-intl
```

## File Structure
```
src/
├── components/
│   └── landing/
│       ├── header.tsx          # Updated with language switcher
│       └── language-switcher.tsx  # New component
├── lib/
│   └── translations.ts          # Translation context and data
└── app/
    └── (main)/
        └── page.tsx             # Updated with TranslationProvider
```

## Components

### LanguageSwitcher
A button component that toggles between EN and ID languages.

**Props:**
- `currentLanguage?: 'en' | 'id'` - Current active language
- `onLanguageChange: (language: 'en' | 'id') => void` - Callback when language changes

**Usage:**
```tsx
import { LanguageSwitcher } from "@/components/landing/language-switcher";

<LanguageSwitcher
  currentLanguage="en"
  onLanguageChange={(lang) => console.log(lang)}
/>
```

### TranslationProvider
Context provider that manages language state and provides translations to child components.

**Usage:**
```tsx
import { TranslationProvider } from "@/lib/translations";

<TranslationProvider>
  <YourApp />
</TranslationProvider>
```

### useTranslations Hook
Custom hook to access translations and language state within components.

**Returns:**
- `language: 'en' | 'id'` - Current language
- `setLanguage: (language: 'en' | 'id') => void` - Function to change language
- `t: Translations` - Translation object

**Usage:**
```tsx
import { useTranslations } from "@/lib/translations";

function MyComponent() {
  const { language, setLanguage, t } = useTranslations();
  
  return (
    <div>
      <h1>{t.header.features}</h1>
      <button onClick={() => setLanguage('id')}>Switch to Indonesian</button>
    </div>
  );
}
```

## Translation Structure

The translation object is organized by sections:

```typescript
interface Translations {
  header: {
    features: string;
    howItWorks: string;
    successStories: string;
    logIn: string;
    getStartedFree: string;
    menu: string;
  };
  hero: {
    badge: string;
    title: string;
    titleHighlight: string;
    description: string;
    getStartedFree: string;
    seeHowItWorks: string;
    stats: {
      remoteRoles: string;
      learningModules: string;
      atsReady: string;
    };
  };
  // ... more sections
}
```

## Adding New Translations

### Step 1: Update Translation Type
Add new keys to the `Translations` interface in `src/lib/translations.ts`:

```typescript
interface Translations {
  // existing sections
  myNewSection: {
    title: string;
    description: string;
  };
}
```

### Step 2: Add English Translations
Update the `en` object in `translations`:

```typescript
const translations: Record<Language, Translations> = {
  en: {
    // existing translations
    myNewSection: {
      title: "My Title",
      description: "My Description",
    },
  },
  // ...
};
```

### Step 3: Add Indonesian Translations
Update the `id` object in `translations`:

```typescript
id: {
  // existing translations
  myNewSection: {
    title: "Judul Saya",
    description: "Deskripsi Saya",
  },
},
```

### Step 4: Use in Component
Import and use the hook in your component:

```tsx
import { useTranslations } from "@/lib/translations";

function MyComponent() {
  const { t } = useTranslations();
  
  return (
    <div>
      <h1>{t.myNewSection.title}</h1>
      <p>{t.myNewSection.description}</p>
    </div>
  );
}
```

## Usage in Header Component

The header component has been updated to:
1. Use the `useTranslations` hook
2. Display the language switcher on desktop (next to theme toggle)
3. Display the language switcher in mobile menu
4. Use translations for all text content

**Desktop Layout:**
- Navigation links with translations
- Language switcher + theme toggle
- Login/Get Started buttons with translations

**Mobile Layout:**
- Hamburger menu opens dropdown
- Navigation links with translations
- Language switcher in center of menu
- Login/Get Started buttons with translations

## Styling

The language switcher uses:
- `Button` component from `@/components/ui/button`
- Default theme colors
- Consistent spacing with other header elements

**CSS Classes:**
- `h-8 px-2.5` - Height and padding
- `text-xs font-medium` - Typography
- `rounded-md` - Border radius
- `variant="default"` - Active language (primary color)
- `variant="ghost"` - Inactive language (transparent)

## Future Enhancements

Potential improvements:
1. Add more languages beyond ID/EN
2. Persist language preference in localStorage
3. Add URL-based language routing (e.g., /en/page, /id/page)
4. Add RTL (right-to-left) support
5. Lazy load translations for better performance
6. Add missing translations to other landing page sections

## Troubleshooting

### Issue: "useTranslations must be used within a TranslationProvider"
**Solution:** Ensure your app or page component is wrapped with `<TranslationProvider>`.

### Issue: Translations not updating
**Solution:** Check that you're using the `t` object from the `useTranslations` hook, not importing translations directly.

### Issue: Missing translation keys
**Solution:** Add the missing keys to both `en` and `id` translation objects in `src/lib/translations.ts`.

## Testing

To test the language switcher:
1. Start the dev server: `npm run dev`
2. Navigate to the landing page
3. Click the EN/ID buttons in the header
4. Verify all text updates correctly
5. Test on mobile: resize browser and test mobile menu
6. Verify the language switcher appears in the mobile menu

## Accessibility

The language switcher includes:
- ARIA labels for screen readers
- Keyboard navigation support
- Clear visual distinction between active/inactive languages
- Consistent button sizing for touch targets