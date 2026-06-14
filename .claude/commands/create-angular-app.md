---
description: Create a new Angular application with routing and guards
argument-hint: [app-name]
---

Create a new Angular application named $1 with the following structure:

1. Use Angular CLI to create the app with routing and SCSS:
   ```bash
   ng new $1 --routing --style=scss
   ```

2. Generate essential structure:
   ```bash
   cd $1
   ng generate guard auth/guards/auth
   ng generate service auth/services/auth
   ng generate module core
   ng generate module shared
   ng generate component core/components/layout
   ```

3. Create a basic folder structure:
   - `src/app/core/` - Core functionality (singletons, guards, interceptors)
   - `src/app/shared/` - Shared components, directives, pipes
   - `src/app/features/` - Feature modules
   - `src/app/auth/` - Authentication logic

4. Initialize git repository if not already done

5. Create a README.md explaining the project structure and how to run it

After creation, provide the user with:
- Next steps to run the application
- Explanation of the folder structure
- Common commands they might need