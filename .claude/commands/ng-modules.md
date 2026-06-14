---
description: Generate a new Angular feature module
argument-hint: [module-name] [--routing]
---

Generate a new Angular feature module named $1:

1. Create the module with routing (if requested):
   ```bash
   ng generate module $1 --routing
   ```

   Or without routing:
   ```bash
   ng generate module $1
   ```

2. The module will include:
   - NgModule class with @NgModule decorator
   - Routing module (if --routing flag used)
   - Proper imports and exports structure

3. Set up recommended structure:
   ```
   src/app/features/$1/
   ├── components/
   ├── services/
   ├── models/
   ├── $1.module.ts
   └── $1-routing.module.ts (if routing enabled)
   ```

4. Provide guidance on:
   - How to lazy-load the module in app routing
   - How to organize feature components
   - When to use shared vs feature modules
   - How to export components for use in other modules

5. If creating a feature module, suggest:
   - Creating a landing/container component
   - Setting up routing for the feature
   - Adding it to the main app routing with lazy loading

Ask the user if they want routing enabled and what type of module this is (feature, shared, or core).