# 🎨 Splash Screen Implementation

A comprehensive, dynamic splash screen system for the Jewelry CRM platform with multi-tenant branding, seasonal content, and smooth animations.

## ✨ Features

### 🎯 Core Features
- **Multi-tenant Branding**: Each tenant can have custom logos, colors, and themes
- **Seasonal Content**: Automatic festive content for Diwali, Akshay Tritiya, and Wedding Season
- **Smooth Animations**: Powered by Framer Motion with staggered animations
- **Responsive Design**: Works perfectly on all devices and screen sizes
- **Accessibility**: ARIA labels, keyboard navigation, and screen reader support
- **Loading Progress**: Visual progress indicator with customizable duration
- **Performance Optimized**: Lightweight SVG assets and efficient animations

### 🎨 Branding Customization
- **Custom Logos**: Upload and display tenant-specific logos
- **Theme Colors**: 5 preset themes + custom color picker
- **Typography**: Customizable fonts and text styling
- **Background Gradients**: Beautiful gradient backgrounds
- **Shimmer Effects**: Subtle animations for premium feel

### 🌟 Seasonal Content
- **Diwali** (Oct 20 - Nov 15): Festive sparkles and diyas
- **Akshay Tritiya** (Apr 30 - May 15): Gold coins and auspicious symbols
- **Wedding Season** (Nov 1 - Dec 31): Wedding bells and hearts

## 🏗 Architecture

### Components Structure
```
src/
├── components/
│   ├── SplashScreen.tsx          # Main splash screen component
│   └── BrandingSettings.tsx      # Branding configuration UI
├── contexts/
│   ├── BrandingContext.tsx       # Branding state management
│   └── SplashProvider.tsx        # Splash screen state management
└── public/
    └── seasonal/                 # Seasonal SVG assets
        ├── diwali-sparkle.svg
        ├── gold-auspicious.svg
        └── wedding-bells.svg
```

### Context Providers
```tsx
// App structure with providers
<QueryClientProvider>
  <BrandingProvider>
    <SplashProvider>
      <AuthProvider>
        {children}
      </AuthProvider>
    </SplashProvider>
  </BrandingProvider>
</QueryClientProvider>
```

## 🚀 Usage

### Basic Implementation
```tsx
import { useSplash } from '@/contexts/SplashProvider';

function MyComponent() {
  const { triggerSplash } = useSplash();
  
  const handleShowSplash = () => {
    triggerSplash(3000); // Show for 3 seconds
  };
  
  return (
    <button onClick={handleShowSplash}>
      Show Splash Screen
    </button>
  );
}
```

### Branding Configuration
```tsx
import { useBranding } from '@/contexts/BrandingContext';

function BrandingComponent() {
  const { branding, updateBranding } = useBranding();
  
  const updateTheme = async () => {
    await updateBranding({
      name: 'Royal Jewellers',
      tagline: 'Where Elegance Meets Excellence',
      theme: {
        background: 'from-amber-50 to-yellow-100',
        text: 'text-amber-800',
        accent: 'text-amber-600',
        primary: '#f59e0b',
        secondary: '#92400e'
      }
    });
  };
}
```

## 🎨 Customization

### Theme Presets
```tsx
const themePresets = [
  {
    name: 'Default',
    background: 'from-primary-50 to-secondary-100',
    text: 'text-primary-800',
    accent: 'text-primary-600',
    primary: '#ed751a',
    secondary: '#64748b'
  },
  {
    name: 'Royal Gold',
    background: 'from-amber-50 to-yellow-100',
    text: 'text-amber-800',
    accent: 'text-amber-600',
    primary: '#f59e0b',
    secondary: '#92400e'
  },
  // ... more presets
];
```

### Seasonal Content Configuration
```tsx
const seasonalContent = [
  {
    id: 'diwali',
    name: 'Diwali',
    startDate: '2025-10-20',
    endDate: '2025-11-15',
    title: 'Diwali Special',
    subtitle: 'Illuminate your business with our festive collection',
    backgroundColor: 'from-amber-50 to-orange-100',
    textColor: 'text-amber-800',
    accentColor: 'text-amber-600',
    image: '/seasonal/diwali-sparkle.svg'
  },
  // ... more seasonal content
];
```

## 📱 Demo Pages

### Splash Demo
Visit `/splash-demo` to see the splash screen in action with:
- Different tenant branding options
- Seasonal content preview
- Interactive controls
- Feature showcase

### Branding Settings
Use the `BrandingSettings` component for:
- Platform admin configuration
- Business admin customization
- Real-time preview
- Theme management

## 🔧 Configuration

### Environment Variables
```env
# Optional: Default tenant ID
NEXT_PUBLIC_DEFAULT_TENANT_ID=default

# Optional: Splash screen duration (ms)
NEXT_PUBLIC_SPLASH_DURATION=3000
```

### Tailwind Configuration
The splash screen uses custom Tailwind classes. Ensure your `tailwind.config.js` includes:
```js
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: { /* your primary colors */ },
        secondary: { /* your secondary colors */ },
        // ... other color schemes
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        // ... other animations
      }
    }
  }
};
```

## 🎯 User Roles & Permissions

### Platform Admin
- Configure default platform branding
- Set global theme presets
- Manage seasonal content
- Override tenant branding

### Business Admin
- Customize store-specific branding
- Upload custom logos
- Set store colors and themes
- Enable/disable seasonal content

### Other Users
- Experience branded splash screen
- See seasonal content when enabled
- Smooth transitions to main app

## 🚀 Performance

### Optimization Features
- **Lazy Loading**: Components load only when needed
- **SVG Assets**: Lightweight, scalable seasonal icons
- **Efficient Animations**: Hardware-accelerated transforms
- **Minimal Bundle**: Tree-shaking for unused features
- **Caching**: Branding data cached in context

### Loading Times
- **Initial Load**: < 100ms for branding data
- **Splash Animation**: 3s default duration
- **Asset Loading**: Optimized SVG files < 5KB each
- **Transition**: 500ms smooth fade-out

## 🧪 Testing

### Component Testing
```tsx
import { render, screen } from '@testing-library/react';
import { SplashScreen } from '@/components/SplashScreen';

test('renders splash screen with branding', () => {
  render(<SplashScreen onComplete={() => {}} />);
  expect(screen.getByRole('status')).toBeInTheDocument();
});
```

### Context Testing
```tsx
import { renderHook } from '@testing-library/react';
import { useBranding } from '@/contexts/BrandingContext';

test('provides branding data', () => {
  const { result } = renderHook(() => useBranding());
  expect(result.current.branding).toBeDefined();
});
```

## 🐛 Troubleshooting

### Common Issues

**Splash screen not showing**
- Check if `SplashProvider` is wrapped around your app
- Verify `initialShow` prop is set to `true`
- Ensure branding context is loaded

**Branding not updating**
- Check network requests for branding data
- Verify tenant ID is correctly set
- Clear browser cache if needed

**Animations not working**
- Ensure Framer Motion is installed
- Check for CSS conflicts
- Verify browser supports required features

### Debug Mode
Enable debug logging by setting:
```tsx
localStorage.setItem('splash-debug', 'true');
```

## 📈 Future Enhancements

### Planned Features
- [ ] **Video Backgrounds**: Support for video splash screens
- [ ] **Custom Animations**: User-defined animation sequences
- [ ] **A/B Testing**: Splash screen variants for optimization
- [ ] **Analytics**: Track splash screen engagement
- [ ] **Offline Support**: Cached branding for offline use
- [ ] **PWA Integration**: Native app-like splash experience

### API Integration
- [ ] **Backend Sync**: Real-time branding updates
- [ ] **CDN Assets**: Optimized asset delivery
- [ ] **Analytics API**: User behavior tracking
- [ ] **Admin API**: Branding management endpoints

## 📄 License

This splash screen implementation is part of the Jewelry CRM platform and follows the same licensing terms.

---

**Created by**: Jewelry CRM Team  
**Last Updated**: 2025-07-24  
**Version**: 1.0.0 