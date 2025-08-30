/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { IInterceptorService } from './interceptorService.js';
import { AuthRequestInterceptor, LoggingRequestInterceptor, LoggingResponseInterceptor } from './defaultInterceptors.js';

// allow-any-unicode-next-line
// 注册默认拦截器
export class InterceptorContribution {
	constructor(
		@IInstantiationService private readonly instantiationService: IInstantiationService,
		@IInterceptorService private readonly interceptorService: IInterceptorService
	) {
		this.registerDefaultInterceptors();
	}

	private registerDefaultInterceptors(): void {
		// allow-any-unicode-next-line
		// 注册认证请求拦截器
		const authInterceptor = this.instantiationService.createInstance(AuthRequestInterceptor);
		this.interceptorService.addRequestInterceptor(authInterceptor);

		// allow-any-unicode-next-line
		// 注册日志请求拦截器
		const loggingRequestInterceptor = new LoggingRequestInterceptor();
		this.interceptorService.addRequestInterceptor(loggingRequestInterceptor);

		// allow-any-unicode-next-line
		// 注册日志响应拦截器
		const loggingResponseInterceptor = new LoggingResponseInterceptor();
		this.interceptorService.addResponseInterceptor(loggingResponseInterceptor);
	}
}
