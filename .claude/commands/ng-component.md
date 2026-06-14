---
description: Generate a new Angular component
argument-hint: [path/component-name]
---

Generate a new Angular component at $1:

1. Create the component using Angular CLI:
   ```bash
   ng generate component $1
   ```

2. The component will include:
   - TypeScript component class
   - HTML template
   - CSS/SCSS stylesheet
   - Spec file for testing

3. Provide guidance on:
   - How to use the component in templates
   - Common component patterns (inputs, outputs, lifecycle hooks)
   - Where to import it if needed

If the user didn't specify a path, ask them where they want to create it (e.g., `features/user/components/user-profile` or `shared/components/button`).