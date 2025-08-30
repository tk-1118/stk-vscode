/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { createDecorator } from '../../../../platform/instantiation/common/instantiation.js';
import { CancellationToken } from '../../../../base/common/cancellation.js';

export const IInterceptorService = createDecorator<IInterceptorService>('interceptorService');

export interface IRequestOptions {
	headers?: Record<string, string>;
	timeout?: number;
	cancellationToken?: CancellationToken;
	responseType?: 'json' | 'text' | 'arraybuffer';
	method?: string;
}

export interface IResponse<T> {
	data: T;
	status: number;
	statusText: string;
	headers: Record<string, string>;
}

export interface IInterceptorService {
	readonly _serviceBrand: undefined;

	/**
	 * // allow-any-unicode-next-line
	 * 添加请求拦截器
	 */
	addRequestInterceptor(interceptor: IRequestInterceptor): void;

	/**
	 * // allow-any-unicode-next-line
	 * 添加响应拦截器
	 */
	addResponseInterceptor(interceptor: IResponseInterceptor): void;

	/**
	 * // allow-any-unicode-next-line
	 * 移除请求拦截器
	 */
	removeRequestInterceptor(interceptor: IRequestInterceptor): void;

	/**
	 * // allow-any-unicode-next-line
	 * 移除响应拦截器
	 */
	removeResponseInterceptor(interceptor: IResponseInterceptor): void;

	/**
	 * // allow-any-unicode-next-line
	 * 应用请求拦截器
	 */
	applyRequestInterceptors<T>(url: string, options: IRequestOptions): Promise<IRequestOptions>;

	/**
	 * // allow-any-unicode-next-line
	 * 应用响应拦截器
	 */
	applyResponseInterceptors<T>(response: IResponse<T>): Promise<IResponse<T>>;
}

export interface IRequestInterceptor {
	/**
	 * 拦截请求
	 * @param url 请求URL
	 * @param options 请求选项
	 * @returns 修改后的请求选项
	 */
	interceptRequest<T>(url: string, options: IRequestOptions): Promise<IRequestOptions> | IRequestOptions;
}

export interface IResponseInterceptor {
	/**
	 * 拦截响应
	 * @param response 响应数据
	 * @returns 修改后的响应数据
	 */
	interceptResponse<T>(response: IResponse<T>): Promise<IResponse<T>> | IResponse<T>;
}

export class InterceptorService implements IInterceptorService {
	declare readonly _serviceBrand: undefined;

	private requestInterceptors: IRequestInterceptor[] = [];
	private responseInterceptors: IResponseInterceptor[] = [];

	addRequestInterceptor(interceptor: IRequestInterceptor): void {
		this.requestInterceptors.push(interceptor);
	}

	addResponseInterceptor(interceptor: IResponseInterceptor): void {
		this.responseInterceptors.push(interceptor);
	}

	removeRequestInterceptor(interceptor: IRequestInterceptor): void {
		const index = this.requestInterceptors.indexOf(interceptor);
		if (index !== -1) {
			this.requestInterceptors.splice(index, 1);
		}
	}

	removeResponseInterceptor(interceptor: IResponseInterceptor): void {
		const index = this.responseInterceptors.indexOf(interceptor);
		if (index !== -1) {
			this.responseInterceptors.splice(index, 1);
		}
	}

	async applyRequestInterceptors<T>(url: string, options: IRequestOptions): Promise<IRequestOptions> {
		let modifiedOptions = { ...options };

		// 依次应用所有请求拦截器
		for (const interceptor of this.requestInterceptors) {
			modifiedOptions = await Promise.resolve(interceptor.interceptRequest(url, modifiedOptions));
		}

		return modifiedOptions;
	}

	async applyResponseInterceptors<T>(response: IResponse<T>): Promise<IResponse<T>> {
		let modifiedResponse = { ...response };

		// 依次应用所有响应拦截器（逆序）
		for (let i = this.responseInterceptors.length - 1; i >= 0; i--) {
			modifiedResponse = await Promise.resolve(this.responseInterceptors[i].interceptResponse(modifiedResponse));
		}

		return modifiedResponse;
	}
}
