# Story 2.6: Implement Horizontal Gallery for Journey Stages

Status: ready-for-dev

## Story

As a **visitor**,
I want **to swipe or click through multiple images within each production journey stage**,
So that **I can see more details and perspectives of each step in the production process**.

## Acceptance Criteria

1. **Given** I am viewing a journey stage, **When** that stage has multiple images configured, **Then** I see left/right navigation arrows to browse images

2. **Given** a stage has multiple images, **When** I click the right arrow or swipe left, **Then** the next image is displayed with a smooth transition

3. **Given** a stage has multiple images, **When** I click the left arrow or swipe right, **Then** the previous image is displayed with a smooth transition

4. **Given** I am at the first image, **Then** the left arrow is hidden or disabled

5. **Given** I am at the last image, **Then** the right arrow is hidden or disabled

6. **Given** a stage has multiple images, **Then** dot indicators below show how many images exist and which is currently active

7. **Given** I am using a keyboard, **When** the gallery is focused, **Then** I can use left/right arrow keys to navigate

8. **Given** I am using a screen reader, **Then** the gallery is announced as a carousel with proper ARIA attributes

9. **Given** a stage has only one image, **Then** no gallery controls are displayed (current behavior preserved)

10. **Given** the gallery is displayed, **Then** an optional image counter shows "2 of 6" format

## Tasks / Subtasks

- [ ] Task 1: Create HorizontalGallery Component (AC: #1, #2, #3, #6, #10)
  - [ ] 1.1 Create `src/components/ui/HorizontalGallery.tsx`
  - [ ] 1.2 Define TypeScript interface matching UX spec props
  - [ ] 1.3 Implement image container with CSS transitions
  - [ ] 1.4 Add left/right navigation arrow buttons
  - [ ] 1.5 Implement dot indicators for image position
  - [ ] 1.6 Add optional image counter display ("2 of 6")
  - [ ] 1.7 Export from `src/components/ui/index.ts`

- [ ] Task 2: Implement Navigation Logic (AC: #2, #3, #4, #5)
  - [ ] 2.1 Create state for current image index
  - [ ] 2.2 Implement next/previous navigation functions
  - [ ] 2.3 Hide/disable left arrow when at first image
  - [ ] 2.4 Hide/disable right arrow when at last image
  - [ ] 2.5 Add smooth CSS transition between images (300-400ms)

- [ ] Task 3: Add Touch/Swipe Support (AC: #2, #3)
  - [ ] 3.1 Implement touch event handlers (touchstart, touchmove, touchend)
  - [ ] 3.2 Detect swipe direction (left = next, right = previous)
  - [ ] 3.3 Add swipe threshold (minimum 50px movement)
  - [ ] 3.4 Ensure smooth animation during swipe

- [ ] Task 4: Add Keyboard Navigation (AC: #7)
  - [ ] 4.1 Add `tabIndex={0}` to make gallery focusable
  - [ ] 4.2 Implement `onKeyDown` handler for ArrowLeft/ArrowRight
  - [ ] 4.3 Add visible focus ring when gallery is focused
  - [ ] 4.4 Respect `useReducedMotion` for instant transitions

- [ ] Task 5: Implement Accessibility Features (AC: #8)
  - [ ] 5.1 Add `role="region"` and `aria-roledescription="carousel"`
  - [ ] 5.2 Add `aria-label` with gallery description
  - [ ] 5.3 Add `aria-live="polite"` for image change announcements
  - [ ] 5.4 Add `aria-hidden="true"` to navigation arrows (decorative)
  - [ ] 5.5 Ensure all images have descriptive alt text

- [ ] Task 6: Integrate with JourneyStage Component (AC: #1, #9)
  - [ ] 6.1 Add optional `galleryImages` prop to JourneyStage
  - [ ] 6.2 Conditionally render HorizontalGallery when multiple images exist
  - [ ] 6.3 Fall back to single image display when only one image
  - [ ] 6.4 Position gallery within the stage background layer
  - [ ] 6.5 Ensure gradient overlay works with gallery

- [ ] Task 7: Add i18n Support
  - [ ] 7.1 Add translation keys for gallery navigation (aria-labels)
  - [ ] 7.2 Add "imageOf" key: "{current} of {total}"
  - [ ] 7.3 Update all 8 locale files with new keys

- [ ] Task 8: Configure Stage Gallery Images
  - [ ] 8.1 Define gallery image arrays for stages that need multiple images
  - [ ] 8.2 Organize additional images in `public/images/journey/{stage}/` subfolders
  - [ ] 8.3 Update ProductionJourney to pass galleryImages prop

- [ ] Task 9: Testing and Validation
  - [ ] 9.1 Test arrow navigation works correctly
  - [ ] 9.2 Test swipe gestures on touch devices
  - [ ] 9.3 Test keyboard navigation
  - [ ] 9.4 Test screen reader announces carousel correctly
  - [ ] 9.5 Test single-image stages show no gallery controls
  - [ ] 9.6 Run `npm run build` - must pass
  - [ ] 9.7 Run `npm run lint` - must pass

## Dev Notes

### Component Interface (from UX Design Specification)

```typescript
interface HorizontalGalleryProps {
  images: { src: string; alt: string }[];
  showCounter?: boolean;      // Show "2 of 6" counter
  autoPlay?: boolean;         // Auto-advance images (default: false)
  interval?: number;          // Auto-play interval in ms (default: 5000)
  className?: string;         // Additional CSS classes
}
```

### Component States

| State | Description |
|-------|-------------|
| `default` | First image shown, both arrows visible (unless single image) |
| `swiping` | During touch/mouse drag interaction |
| `at-start` | First image active, left arrow hidden/disabled |
| `at-end` | Last image active, right arrow hidden/disabled |

### Visual Design

**Arrow Buttons:**
- Semi-transparent background (black/50 or white/50)
- Positioned left/right edges of gallery
- Size: 44x44px minimum (touch target)
- Icon: Chevron or arrow icon
- Hidden on hover absence, visible on hover/focus (optional progressive disclosure)

**Dot Indicators:**
- Positioned bottom center
- Active dot: solid white/primary color
- Inactive dots: white/50 or outline only
- Spacing: 8px between dots
- Size: 8-10px diameter

**Image Counter:**
- Positioned top-right or bottom-right
- Format: "2 of 6" or "2/6"
- Semi-transparent background pill

**Transitions:**
- Duration: 300-400ms
- Easing: ease-out
- Type: opacity crossfade or slide

### Integration with JourneyStage

The JourneyStage component needs to be updated to support gallery:

```typescript
// Updated JourneyStageProps
type JourneyStageProps = {
  stageNumber: number;
  videoSrc?: string;
  videoSrcMp4?: string;
  imageFallback: string;        // Primary/first image
  galleryImages?: { src: string; alt: string }[];  // NEW: Additional images
  headline: string;
  subtext: string;
  altText: string;
  priority?: boolean;
};
```

**Rendering Logic:**
```tsx
// In JourneyStage.tsx
{galleryImages && galleryImages.length > 1 ? (
  <HorizontalGallery
    images={[
      { src: imageFallback, alt: altText },
      ...galleryImages
    ]}
    showCounter={true}
  />
) : (
  <Image src={imageFallback} alt={altText} fill className="object-cover" />
)}
```

### Image Organization

For stages with multiple images:
```
public/images/journey/
  forest.jpg                    # Primary image (current)
  forest/                       # Gallery subfolder
    forest-2.jpg
    forest-3.jpg
  sawmill.jpg
  sawmill/
    sawmill-2.jpg
    sawmill-3.jpg
  ... (repeat for other stages as needed)
```

### i18n Keys to Add

Add to all locale files in `home.journey`:

```json
{
  "home": {
    "journey": {
      "galleryLabel": "Image gallery for {stageName}",
      "previousImage": "Previous image",
      "nextImage": "Next image",
      "imageOf": "{current} of {total}",
      "goToImage": "Go to image {number}"
    }
  }
}
```

### Accessibility Requirements

- `role="region"` on gallery container
- `aria-roledescription="carousel"` for screen reader context
- `aria-label="Image gallery for {stageName}"`
- `aria-live="polite"` region announces current image
- Arrow buttons: `aria-label="Previous image"` / `aria-label="Next image"`
- Dot indicators: `aria-label="Go to image {n}"`, `aria-current="true"` for active
- All images must have descriptive alt text
- Keyboard navigation: ArrowLeft/ArrowRight when focused
- Respect `prefers-reduced-motion` - disable transitions

### Performance Considerations

- Lazy load gallery images (not priority)
- Preload next/previous image when navigating
- Use `next/image` for optimization
- Consider using CSS `will-change: transform` for smooth animations
- Keep images optimized (WebP, appropriate sizing)

### Testing Checklist

- [ ] Gallery displays correctly with 2+ images
- [ ] Single image shows no gallery controls
- [ ] Left/right arrows navigate correctly
- [ ] Arrows hide/disable at boundaries
- [ ] Dot indicators update on navigation
- [ ] Counter displays correct values
- [ ] Swipe gestures work on touch devices
- [ ] Keyboard navigation works when focused
- [ ] Screen reader announces carousel properly
- [ ] Reduced motion disables animations
- [ ] Gradient overlay remains over gallery
- [ ] Text content stays readable
- [ ] Build passes with no errors
- [ ] Lint passes with no warnings

### References

- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#HorizontalGallery]
- [Source: _bmad-output/planning-artifacts/epics.md#line-200]
- [Source: _bmad-output/implementation-artifacts/2-3-implement-journeystage-component.md]
- [Source: _bmad-output/implementation-artifacts/2-4-populate-8-production-journey-stages.md]

## File List

**To Create:**
- `src/components/ui/HorizontalGallery.tsx` - Gallery component with navigation
- `src/components/ui/index.ts` - Export barrel (if not exists, modify)
- `public/images/journey/{stage}/` - Subfolders for additional images per stage

**To Modify:**
- `src/components/features/home/JourneyStage.tsx` - Add galleryImages prop support
- `src/components/features/home/ProductionJourney.tsx` - Pass gallery images to stages
- `src/messages/en.json` - Add gallery i18n keys
- `src/messages/fi.json` - Add gallery i18n keys
- `src/messages/sv.json` - Add gallery i18n keys
- `src/messages/no.json` - Add gallery i18n keys
- `src/messages/da.json` - Add gallery i18n keys
- `src/messages/nl.json` - Add gallery i18n keys
- `src/messages/de.json` - Add gallery i18n keys
- `src/messages/es.json` - Add gallery i18n keys

## Dev Agent Record

### Agent Model Used

(To be filled during implementation)

### Completion Notes List

(To be filled during implementation)

### Change Log

| Date | Change | Author |
|------|--------|--------|
| 2026-01-16 | Story created based on UX Design Specification HorizontalGallery component | Claude |
