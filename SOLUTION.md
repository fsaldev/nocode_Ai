# Technical Assessment Solution

**Candidate Name**: _Farukh saleem________________________
**Date**: ___________10/27/2925______________
**Time Spent**: ______4___ hours

---

## Executive Summary

Provide a brief overview (3-5 sentences) of the main issues you found and your overall assessment of the codebase.

```
## **Executive Summary**

The primary issues identified in the codebase revolved around authentication flow inconsistencies, type safety errors, and data handling mismatches between server and client. The initial use of `localStorage` for token management introduced race conditions and unreliable session handling, which were resolved by transitioning to secure HttpOnly cookies. Data serialization mismatches and missing logout/session validation endpoints were also addressed to ensure consistent, secure, and predictable user experiences. Additionally, TypeScript build issues and hydration warnings were fixed to improve code stability and maintainability. Overall, the refactored implementation enhances security, reliability, and developer experience across both client and server layers.

```

---

# Part 1: Issues Found & Fixed

### Issue #1: Unauthorized (401) on First Login

**Severity**: High  
**Category**: Authentication / Race Condition  
**Location**: `server\context.ts
               lib\trpc-client.tsx
               app\api\auth\login\route.ts
               app\page.tsx`  

**Description**:  
```
A race condition occurred where the TRPCProvider initialized before the authentication token was available in localStorage. As a result, the first tRPC request (project.list) was sent without the authorization header, leading to a 401 Unauthorized response.
```

**Impact**:  
```
Users encountered a 401 error upon their first login, disrupting the initial user experience and blocking access to dashboard data until a manual refresh.
```

**Root Cause**:  
```
The tRPC client initialized before the authentication token was written to localStorage, causing the first API request to lack authorization headers.
```

**Solution**:  
```
Replaced localStorage-based authentication with secure HttpOnly cookies for storing tokens.  
Cookies are automatically sent with every API request, ensuring proper authentication and removing race conditions.
```

**Trade-offs**:  
```
Requires backend and frontend coordination for cookie management.  
However, this approach significantly improves security and reliability.
```

---

### Issue #2: 400 Bad Request (Invalid Input Type)

**Severity**: Medium  
**Category**: Validation / API Contract  
**Location**: `server/routes/project.ts`  

**Description**:  
```
The project.list procedure’s input schema required an object but received undefined when the client made a query without parameters.
```

**Impact**:  
```
API calls to project.list failed with a 400 Bad Request error, breaking project data fetching.
```

**Root Cause**:  
```
The zod schema used for validating input expected an object but the client provided no arguments, resulting in a type mismatch.
```

**Solution**:  
```
Made the input schema optional and provided default values to ensure compatibility with calls that don’t require explicit input.
```

**Trade-offs**:  
```
Slightly reduces strictness of validation, but improves developer experience and prevents unnecessary runtime errors.
```

---

### Issue #3: “No Projects Yet” Displayed Despite Data

**Severity**: High  
**Category**: Data Serialization / Client Configuration  
**Location**: `app/page.tsx`  

**Description**:  
```
The UI displayed “No Projects Yet” even when data existed on the server due to improper data deserialization on the client.
```

**Impact**:  
```
Users saw incorrect empty states, causing confusion and misreporting of data availability.
```

**Root Cause**:  
```
The superjson transformer was configured only on the server side, leading to mismatched serialization formats between client and server.
```

**Solution**:  
```
Added `transformer: superjson` to the tRPC client configuration to ensure consistent serialization on both ends.
```

**Trade-offs**:  
```
Minimal — adds a dependency on `superjson` on both server and client, but ensures reliable data handling.
```

---

### Issue #4: Missing Logout Handling

**Severity**: Medium  
**Category**: Authentication / Session Management  
**Location**: `app/api/auth/logout/route.ts`  

**Description**:  
```
There was no API endpoint to clear the authentication cookie, preventing proper user logout.
```

**Impact**:  
```
Users remained authenticated even after attempting to log out, posing a potential security and privacy risk.
```

**Root Cause**:  
```
The backend did not expose a logout route that invalidates or clears the authentication token.
```

**Solution**:  
```
Implemented `/api/auth/logout` endpoint to clear the `auth_token` cookie, ensuring proper session termination.
```

**Trade-offs**:  
```
None significant — improves security and aligns with cookie-based authentication best practices.
```

---

### Issue #5: Redirected Back to Login After Successful Authentication

**Severity**: High  
**Category**: Authentication / State Management  
**Location**: `components\auth-wrapper.tsx
               app\api\auth\me\route.ts`  

**Description**:  
```
After successful authentication, users were redirected back to the login page due to outdated validation logic.
```

**Impact**:  
```
Users experienced broken login flow and were unable to access authenticated routes despite being logged in.
```

**Root Cause**:  
```
The AuthWrapper component validated sessions using localStorage, which was deprecated after switching to cookie-based authentication.
```

**Solution**:  
```
Updated AuthWrapper to validate sessions by calling the new `/api/auth/me` endpoint.  
This endpoint verifies the `auth_token` cookie on the server for session validity.
```

**Trade-offs**:  
```
Adds a lightweight server call for session verification but ensures accurate authentication state.
```

### Issue #6: TypeScript Build Error in useGenerationPolling

**Severity**: High  
**Category**: TypeScript / Build  
**Location**:  
`lib/hooks/useGenerationPolling.ts`  

**Description**:  
```
The hook failed to compile because `setStatus(gen.status)` triggered a type error.  
The variable `gen.status` was inferred as a plain string instead of the expected union type 
"pending" | "processing" | "completed" | "failed".
```

**Impact**:  
```
The TypeScript build failed, breaking the generation polling functionality and blocking deployment.
```

**Root Cause**:  
```
The TypeScript type inference did not correctly match the expected union type, leading to a mismatch 
between the API response and the local state definition.
```

**Solution**:  
```
Introduced a `GenerationStatus` type and safely cast `gen.status`.  
Enhanced the hook by adding `projectId`, cleanup via `clearInterval`, and functional state updates 
to prevent stale closures during polling.
```

**Trade-offs**:  
```
Adds minor verbosity due to type casting but ensures complete type safety, cleaner reactivity, 
and predictable polling behavior.
```
### Issue #7: React Hydration Mismatch Warning

**Severity**: Low  
**Category**: Rendering / Hydration  
**Location**:  
`app/layout.tsx`  

**Description**:  
```
During hydration, the client and server HTML attributes didn’t match due to injected browser 
extension attributes (data-gr-ext-installed, cz-shortcut-listen, etc.).
```

**Impact**:  
```
Console displayed hydration mismatch warnings, potentially leading to unstable or unpredictable 
UI rendering during development.
```

**Root Cause**:  
```
Injected attributes from browser extensions caused discrepancies between server-rendered and 
client-rendered DOM, triggering React hydration mismatch warnings.
```

**Solution**:  
```
Added `suppressHydrationWarning={true}` to the <body> tag to safely ignore non-critical attribute 
mismatches caused by external scripts or extensions.
```

**Trade-offs**:  
```
Minor suppression of hydration warnings, but ensures clean console output and stable hydration 
behavior in both development and production builds.
```

### Areas for discussion

```
[Topics you'd like to discuss in a follow-up interview]
```

---

## Summary Checklist

- [ ] Critical issues identified and fixed
- [ ] Performance improvements implemented
- [ ] Memory leaks addressed
- [ ] Concurrency issues resolved
- [ ] Security concerns noted
- [ ] Scaling strategy documented
- [ ] Code tested and working
- [ ] Trade-offs documented

---

## Closing Thoughts

Any final comments about the assessment, your approach, or the codebase?

```
This assessment provided a well-rounded opportunity to debug and improve critical areas such as authentication, state management, and type safety. My approach focused on achieving production-level reliability by replacing fragile client-side token handling with secure cookie-based authentication and ensuring strong type contracts across the stack. Each fix was implemented with long-term maintainability and scalability in mind, while preserving clarity and simplicity in the codebase. Overall, the project now follows cleaner architecture principles, offering a more stable, secure, and developer-friendly foundation for future growth.
```

---

**Thank you for completing this assessment!**
