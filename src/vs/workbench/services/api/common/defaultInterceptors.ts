/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IRequestInterceptor, IResponseInterceptor, IRequestOptions, IResponse } from './interceptorService.js';
import { ICustomAuthenticationService } from '../../../services/authentication/common/customAuthentication.js';

/**
 * 认证请求拦截器
 * 自动为请求添加认证令牌
 */
export class AuthRequestInterceptor implements IRequestInterceptor {
	constructor(
		@ICustomAuthenticationService private readonly customAuthService: ICustomAuthenticationService
	) { }

	async interceptRequest<T>(url: string, options: IRequestOptions): Promise<IRequestOptions> {
		// 检查是否需要添加认证头
		const isLoggedIn = await this.customAuthService.isLoggedIn();
		if (isLoggedIn) {
			const session = await this.customAuthService.getCurrentSession();
			if (session) {
				// 添加认证头
				const headers = {
					...options.headers,
					'Authorization': `Bearer ${session.accessToken}`
				};

				return {
					...options,
					headers
				};
			}
		}

		return options;
	}
}

/**
 * 日志请求拦截器
 * 记录请求信息
 */
export class LoggingRequestInterceptor implements IRequestInterceptor {
	interceptRequest<T>(url: string, options: IRequestOptions): IRequestOptions {
		console.log(`[API Request] ${options.method || 'GET'} ${url}`, options);
		return options;
	}
}

/**
 * 日志响应拦截器
 * 记录响应信息
 */
export class LoggingResponseInterceptor implements IResponseInterceptor {
	interceptResponse<T>(response: IResponse<T>): IResponse<T> {
		console.log(`[API Response] ${response.status} ${response.statusText}`, response);
		return response;
	}
}

/**
 * 错误处理响应拦截器
 * 统一处理API错误
 */
export class ErrorHandlingResponseInterceptor implements IResponseInterceptor {
	interceptResponse<T>(response: IResponse<T>): IResponse<T> {
		// 检查是否有错误
		if (response.status >= 400) {
			console.error(`API Error: ${response.status} ${response.statusText}`, response);
			// 可以在这里添加全局错误处理逻辑
		}

		return response;
	}
}

/**
 * 超时请求拦截器
 * 为请求添加超时控制
 */
export class TimeoutRequestInterceptor implements IRequestInterceptor {
	private defaultTimeout: number;

	constructor(defaultTimeout: number = 5000) {
		this.defaultTimeout = defaultTimeout;
	}

	interceptRequest<T>(url: string, options: IRequestOptions): IRequestOptions {
		// 如果没有设置超时，则使用默认超时
		if (!options.timeout) {
			return {
				...options,
				timeout: this.defaultTimeout
			};
		}

		return options;
	}
}
