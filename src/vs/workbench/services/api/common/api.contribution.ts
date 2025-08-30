/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { InstantiationType, registerSingleton } from '../../../../platform/instantiation/common/extensions.js';
import { IInterceptorService, InterceptorService } from './interceptorService.js';
import { IApiConfigurationService, ApiConfigurationService } from './configurationService.js';
import { IEnhancedApiService, EnhancedApiService } from './enhancedApiService.js';

// allow-any-unicode-next-line
// 注册API配置服务
registerSingleton(IApiConfigurationService, ApiConfigurationService, InstantiationType.Eager);

// allow-any-unicode-next-line
// 注册拦截器服务
registerSingleton(IInterceptorService, InterceptorService, InstantiationType.Eager);

// allow-any-unicode-next-line
// 注册增强API服务
registerSingleton(IEnhancedApiService, EnhancedApiService, InstantiationType.Eager);

// allow-any-unicode-next-line
// 注册拦截器贡献
import './interceptor.contribution.js';
