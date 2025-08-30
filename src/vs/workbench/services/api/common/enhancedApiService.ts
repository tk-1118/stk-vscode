/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { createDecorator } from '../../../../platform/instantiation/common/instantiation.js';
import { IApiService, IRequestOptions, IResponse, IApiConfiguration } from './apiService.js';
import { IInterceptorService } from './interceptorService.js';
import { IApiConfigurationService } from './configurationService.js';

export const IEnhancedApiService = createDecorator<IEnhancedApiService>('enhancedApiService');

export interface IEnhancedApiService extends IApiService {
	readonly _serviceBrand: undefined;

	/**
	 * // allow-any-unicode-next-line
	 * 设置API配置
	 */
	setConfiguration(configuration: IApiConfiguration): void;
}

export class EnhancedApiService implements IEnhancedApiService {
	declare readonly _serviceBrand: undefined;

	constructor(
		@IApiConfigurationService private readonly configurationService: IApiConfigurationService,
		@IInterceptorService private readonly interceptorService: IInterceptorService
	) { }

	setConfiguration(configuration: IApiConfiguration): void {
		this.configurationService.updateConfiguration(configuration);
	}

	async get<T>(url: string, options?: IRequestOptions): Promise<IResponse<T>> {
		return this.request<T>('GET', url, undefined, options);
	}

	async post<T>(url: string, data?: any, options?: IRequestOptions): Promise<IResponse<T>> {
		return this.request<T>('POST', url, data, options);
	}

	async put<T>(url: string, data?: any, options?: IRequestOptions): Promise<IResponse<T>> {
		return this.request<T>('PUT', url, data, options);
	}

	async delete<T>(url: string, options?: IRequestOptions): Promise<IResponse<T>> {
		return this.request<T>('DELETE', url, undefined, options);
	}

	async patch<T>(url: string, data?: any, options?: IRequestOptions): Promise<IResponse<T>> {
		return this.request<T>('PATCH', url, data, options);
	}

	private async request<T>(
		method: string,
		url: string,
		data?: any,
		options?: IRequestOptions
	): Promise<IResponse<T>> {
		// 获取配置
		const config = this.configurationService.getConfiguration();

		// 构建完整URL
		const fullUrl = this.buildUrl(config.baseUrl, url);

		// 合并默认选项和传入选项
		const defaultOptions: IRequestOptions = {
			headers: config.defaultHeaders,
			timeout: config.timeout
		};

		const mergedOptions: IRequestOptions = {
			...defaultOptions,
			...options
		};

		// 应用请求拦截器
		const interceptedOptions = await this.interceptorService.applyRequestInterceptors<T>(fullUrl, mergedOptions);

		// 创建请求配置
		const fetchOptions: RequestInit = {
			method,
			headers: interceptedOptions.headers,
			...(data && { body: JSON.stringify(data) })
		};

		// 发送请求
		const response = await fetch(fullUrl, fetchOptions);

		// 处理响应
		const responseData = await this.handleResponse<T>(response, interceptedOptions.responseType);

		const apiResponse: IResponse<T> = {
			data: responseData,
			status: response.status,
			statusText: response.statusText,
			headers: this.parseHeaders(response.headers)
		};

		// 应用响应拦截器
		const interceptedResponse = await this.interceptorService.applyResponseInterceptors<T>(apiResponse);

		return interceptedResponse;
	}

	private buildUrl(baseUrl: string, url: string): string {
		// 如果URL已经是完整URL，则直接返回
		if (url.startsWith('http://') || url.startsWith('https://')) {
			return url;
		}

		// 确保baseUrl以/结尾，url不以/开头
		const normalizedBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
		const normalizedUrl = url.startsWith('/') ? url.slice(1) : url;

		return `${normalizedBaseUrl}/${normalizedUrl}`;
	}

	private async handleResponse<T>(response: Response, responseType?: string): Promise<T> {
		// 检查响应状态
		if (!response.ok) {
			throw new Error(`HTTP ${response.status}: ${response.statusText}`);
		}

		// 根据响应类型处理数据
		switch (responseType) {
			case 'json':
				return await response.json();
			case 'text':
				return await response.text() as unknown as T;
			case 'arraybuffer':
				return await response.arrayBuffer() as unknown as T;
			default:
				return await response.json();
		}
	}

	private parseHeaders(headers: Headers): Record<string, string> {
		const result: Record<string, string> = {};
		headers.forEach((value, key) => {
			result[key] = value;
		});
		return result;
	}
}
