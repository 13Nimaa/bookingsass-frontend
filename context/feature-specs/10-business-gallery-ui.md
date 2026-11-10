# Salon Profile — Gallery Image Upload UI

Implement a new **Salon Gallery** section on the existing salon/business profile page, based on the supplied screenshot.

Before implementation, use the `apple-design-skill` by Emi Kowalski. Read and apply the skill's design principles and recommendations to this specific UI task. Do not just imitate Apple's visual appearance; use the skill to improve interaction clarity, visual hierarchy, spacing, usability, and component quality.

## 1. Placement and Page Structure

Add a new section titled:

«گالری تصاویر سالن»

Place it directly below the salon profile image and above the existing business information rows (city, address, description).

Preserve the existing page structure and all current functionality.

The new section must feel like a natural part of the existing profile page, not a separately embedded component.

## 2. Gallery Layout

Create a responsive image gallery with a clean grid layout.

### Mobile layout
- Use a 3-column grid.
- Images should have a consistent square aspect ratio (1:1).
- Use approximately 10–12px spacing between items.
- Keep the gallery aligned with the existing page content margins.
- Each thumbnail should have consistent dimensions and rounded corners that match the existing UI.

### Desktop layout
- Use a 4–5 column grid depending on available width.
- Maintain consistent image dimensions and spacing.
- Do not stretch images to fill unused space.

## 3. Add Image Tile

Include a dedicated upload tile as part of the gallery grid.

The tile should:
- Use a subtle surface consistent with the existing UI.
- Display a prominent plus icon.
- Show the label «افزودن تصویر».
- Have a clear interactive state.
- Look like an intentional gallery item, not a generic form input.

When clicked, it should open the native file picker.

Support image selection through the existing upload conventions.

## 4. Uploaded Image Thumbnails

Each uploaded image should appear as a thumbnail.

Provide:
- A subtle remove action on each image.
- A clear visual indication when an image is being uploaded.
- A graceful error state if an upload fails.
- A preview of the selected image before or during upload, following existing project conventions.

The remove action must be easy to discover without visually dominating the image.

If appropriate, allow clicking a thumbnail to view it in a larger preview.

## 5. Empty State

When the salon has no gallery images:

- Keep the «گالری تصاویر سالن» heading visible.
- Display a compact, attractive empty state.
- Use a subtle image/gallery icon.
- Show a short message: «هنوز تصویری به گالری اضافه نکرده‌اید».
- Provide a clear «افزودن تصویر» action.

Avoid large illustrations or excessive empty-state decoration. The empty state should remain compact and fit naturally into the existing profile page.

## 6. Upload Feedback and Validation

Use the existing upload behavior and validation conventions.

- Accept image formats supported by the existing application.
- Respect existing file-size limits.
- Show upload progress or a loading indicator when supported.
- Prevent duplicate submissions while an upload is in progress.
- Display validation and upload errors in Persian.
- Do not invent upload limits, API endpoints, or backend response fields.

If the backend upload functionality already exists, connect the UI to it using the existing API contract.

If it does not exist, implement only the UI and report the missing upload contract. Do not modify the backend in this task.

## 7. Visual Design and Apple Design Skill

Apply the `apple-design-skill` recommendations specifically to:

- Visual hierarchy of the gallery section.
- Consistent thumbnail sizing.
- Precise spacing and alignment.
- Clear affordance for adding and removing images.
- Feedback during upload.
- Empty and error states.
- Touch target sizes on mobile.
- Subtle, purposeful transitions.

Important constraints:

- Preserve the existing project's exact colors and design tokens.
- Do not change global CSS variables or theme configuration.
- Do not introduce Apple's color palette or a new visual identity.
- Preserve existing typography and shared component styling.
- Do not redesign the profile page.
- Avoid unnecessary shadows, gradients, borders, and decorative elements.

## 8. Responsive and Accessibility Requirements

- The gallery must work naturally on mobile and desktop.
- Use appropriate accessible labels for upload and remove actions.
- Ensure touch targets are comfortable on mobile.
- Support keyboard interaction where applicable.
- Prevent layout shifts while images are loading.
- Handle long image lists without breaking the page layout.

## 9. Scope Restrictions

- Do not change the existing profile image/avatar functionality.
- Do not modify the city, address, or description fields.
- Do not redesign the page header or bottom navigation.
- Do not change the existing design system.
- Do not modify unrelated features.
- Do not implement backend changes or database migrations.

## Acceptance Criteria

1. A dedicated gallery section appears between the profile image and business information.
2. The gallery uses a consistent responsive grid.
3. Users can select images through the add-image tile.
4. Uploaded images appear as thumbnails.
5. Remove, loading, and error states are visually clear.
6. The empty state looks intentional and polished.
7. The UI follows the existing project design system.
8. The Apple Design Skill has been applied to the actual implementation.
9. Existing profile functionality remains unchanged.

After implementation, provide a screenshot of the updated mobile profile page and briefly explain the design decisions influenced by the Apple Design Skill. Report changed files and relevant checks.

Implement only this feature.