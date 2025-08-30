# API Service Documentation

## Overview

This directory contains the API service implementation for the application. It provides a unified way to manage HTTP requests, interceptors, and configuration for all parts of the application that need to communicate with backend services.

## Directory Structure

```
api/
├── common/
│   ├── apiService.ts              # Basic API service interface and implementation
│   ├── enhancedApiService.ts      # Enhanced API service with interceptors and configuration
│   ├── configurationService.ts    # API configuration management
│   ├── interceptorService.ts      # Interceptor service for requests and responses
│   ├── defaultInterceptors.ts     # Default interceptors (auth, logging, etc.)
│   ├── api.contribution.ts        # API service registration
│   └── interceptor.contribution.ts # Interceptor registration
└── README.md                      # This file
```

## Services

### IApiService

Basic API service that provides methods for common HTTP requests:
- `get<T>(url, options)`
- `post<T>(url, data, options)`
- `put<T>(url, data, options)`
- `delete<T>(url, options)`
- `patch<T>(url, data, options)`

### IEnhancedApiService

Enhanced API service that extends `IApiService` with:
- Configuration management
- Request/response interceptors
- Automatic authentication token handling

### IApiConfigurationService

Service for managing API configuration:
- Base URL
- Default headers
- Timeout settings
- Authentication token management

### IInterceptorService

Service for managing request and response interceptors:
- `addRequestInterceptor(interceptor)`
- `addResponseInterceptor(interceptor)`
- `applyRequestInterceptors(url, options)`
- `applyResponseInterceptors(response)`

## Usage

### In Custom Authentication

The custom authentication service uses the enhanced API service to communicate with the authentication backend:

```typescript
// In CustomAuthenticationService
constructor(
    @IAuthenticationService private readonly authenticationService: IAuthenticationService,
    @IEnhancedApiService private readonly apiService: IEnhancedApiService,
    @IApiConfigurationService private readonly apiConfigService: IApiConfigurationService
) {}

async login(credentials: ILoginCredentials): Promise<ILoginResult> {
    // Call API to authenticate
    const response = await this.apiService.post<ILoginResponse>('/auth/login', credentials);

    if (response.data.success) {
        // Create authentication session
        const session = await this.authenticationService.createSession('custom-auth-provider', []);

        // Set authentication token
        this.apiConfigService.setAuthToken(response.data.token);

        return { success: true, session };
    }

    return { success: false, error: response.data.message };
}
```

### In Business Design

The business design feature uses the business design API service:

```typescript
// In BusinessDesignView
constructor(
    @IInstantiationService instantiationService: IInstantiationService
) {
    // Get API service instance
    this.businessDesignApiService = instantiationService.invokeFunction((accessor) => {
        return accessor.get(IBusinessDesignApiService);
    });
}

private async loadBusinessDesigns(): Promise<void> {
    try {
        // Call API to get business designs
        this.businessDesigns = await this.businessDesignApiService.getBusinessDesigns();
        this.renderBusinessDesigns();
    } catch (error) {
        console.error('Failed to load business designs:', error);
    }
}
```

## Interceptors

### Default Interceptors

1. **AuthRequestInterceptor**: Automatically adds authentication tokens to requests
2. **LoggingRequestInterceptor**: Logs outgoing requests
3. **LoggingResponseInterceptor**: Logs incoming responses
4. **ErrorHandlingResponseInterceptor**: Handles API errors globally

### Custom Interceptors

You can create custom interceptors by implementing the `IRequestInterceptor` or `IResponseInterceptor` interfaces:

```typescript
export class CustomRequestInterceptor implements IRequestInterceptor {
    interceptRequest<T>(url: string, options: IRequestOptions): IRequestOptions {
        // Modify request options
        return options;
    }
}

export class CustomResponseInterceptor implements IResponseInterceptor {
    interceptResponse<T>(response: IResponse<T>): IResponse<T> {
        // Modify response
        return response;
    }
}
```

Then register them with the interceptor service:

```typescript
const customRequestInterceptor = new CustomRequestInterceptor();
interceptorService.addRequestInterceptor(customRequestInterceptor);

const customResponseInterceptor = new CustomResponseInterceptor();
interceptorService.addResponseInterceptor(customResponseInterceptor);
```

## Configuration

The API service can be configured through the `IApiConfigurationService`:

```typescript
// Set base URL
apiConfigService.updateConfiguration({
    baseUrl: 'https://api.example.com'
});

// Set default headers
apiConfigService.updateConfiguration({
    defaultHeaders: {
        'X-Custom-Header': 'value'
    }
});

// Set timeout
apiConfigService.updateConfiguration({
    timeout: 10000
});
