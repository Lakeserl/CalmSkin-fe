---
description: Generate a new Angular service
argument-hint: [path/service-name]
---

Generate a new Angular service at $1:

1. Create the service using Angular CLI:
   ```bash
   ng generate service $1
   ```

2. The service will include:
   - TypeScript service class with @Injectable decorator
   - Spec file for testing
   - providedIn: 'root' for singleton pattern (by default)

3. Provide guidance on:
   - How to inject the service into components
   - Common service patterns (HTTP calls, state management, business logic)
   - Best practices for service organization

4. Suggest appropriate location based on service type:
   - Core services (singleton, app-wide) → `core/services/`
   - Feature-specific services → `features/{feature-name}/services/`
   - Shared utilities → `shared/services/`

If the user didn't specify a path, ask them what type of service it is and suggest the appropriate location.