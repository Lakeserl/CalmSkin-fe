# Generate Angular Component Unit Test

Generate a unit test file for the specified Angular component that follows the test structure and setup pattern from C:\repos\ecoehs-frontend\ehs\src\app\admin\pages\permission-group-filter\permission-group-filter.component.spec.ts

## Instructions

1. Ask the user for the full path to the component file they want to create a test for (e.g., C:\repos\ecoehs-frontend\ehs\src\app\admin\pages\my-component\my-component.component.ts)

2. Read the component file to identify:
   - Component class name
   - Constructor dependencies (services, router, activated route, etc.)
   - Any models or interfaces used
   - Observable patterns or async operations

3. Generate a spec file following this structure:

### Import Section
- Import the component being tested
- Import ComponentFixture and TestBed from @angular/core/testing
- Import all services/dependencies identified in the component constructor
- Import NO_ERRORS_SCHEMA from @angular/core
- Import any models/interfaces used
- Import RxJS operators (of, Observable, etc.) as needed

### Describe Block Setup
```typescript
describe('ComponentName', () => {
  let component: ComponentName;
  let fixture: ComponentFixture<ComponentName>;

  // Declare mock spy objects for each service
  let mockServiceName: jasmine.SpyObj<ServiceName>;

  // Mock ActivatedRoute if needed
  const mockActivatedRoute = {
    snapshot: {
      paramMap: {
        get: jasmine.createSpy('get').and.returnValue('defaultValue'),
      },
    },
  };

  // Define mock data constants as needed
  const mockData = { ... };
```

### beforeEach (async) Block
```typescript
beforeEach(async () => {
  // Create spy objects for each service
  mockServiceName = jasmine.createSpyObj('ServiceName', ['method1', 'method2']);

  // Configure default return values for mocked methods
  mockServiceName.method1.and.returnValue(of(mockData));

  await TestBed.configureTestingModule({
    declarations: [ComponentName],
    imports: [],
    providers: [
      { provide: ServiceName, useValue: mockServiceName },
      // Add all dependencies
    ],
    schemas: [NO_ERRORS_SCHEMA],
  }).compileComponents();
});
```

### beforeEach (sync) Block
```typescript
beforeEach(() => {
  fixture = TestBed.createComponent(ComponentName);
  component = fixture.componentInstance;
  fixture.detectChanges();
});
```

### Test Cases
```typescript
it('should create', () => {
  expect(component).toBeTruthy();
});

// Add additional test cases based on component methods
// Use done() callback for async operations with observables
// Follow arrange-act-assert pattern
```

4. Place the spec file in the same directory as the component file with the naming convention: `component-name.component.spec.ts`

5. Ensure:
   - All service dependencies have corresponding mock spy objects
   - Mock methods return observables where appropriate (using `of()`)
   - NO_ERRORS_SCHEMA is included to prevent template errors
   - The basic 'should create' test is always included
   - Follow TDD best practices with clear arrange/act/assert sections
   - Use proper TypeScript typing for all mocks and data

6. After generating the test file, provide a summary of:
   - What dependencies were mocked
   - What test cases were created
   - Any additional test cases the user might want to add based on component functionality