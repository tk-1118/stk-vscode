/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { createDecorator } from '../../../../platform/instantiation/common/instantiation.js';

export const IApiService = createDecorator<IApiService>('apiService');

export interface IApiService {
	readonly _serviceBrand: undefined;

	/**
	 * // allow-any-unicode-next-line
	 * 发送GET请求
	 */
	get<T>(url: string, options?: IRequestOptions): Promise<IResponse<T>>;

	/**
	 * // allow-any-unicode-next-line
	 * 发送POST请求
	 */
	post<T>(url: string, data?: any, options?: IRequestOptions): Promise<IResponse<T>>;

	/**
	 * // allow-any-unicode-next-line
	 * 发送PUT请求
	 */
	put<T>(url: string, data?: any, options?: IRequestOptions): Promise<IResponse<T>>;

	/**
	 * // allow-any-unicode-next-line
	 * 发送DELETE请求
	 */
	delete<T>(url: string, options?: IRequestOptions): Promise<IResponse<T>>;

	/**
	 * // allow-any-unicode-next-line
	 * 发送PATCH请求
	 */
	patch<T>(url: string, data?: any, options?: IRequestOptions): Promise<IResponse<T>>;
}

export interface IRequestOptions {
	headers?: Record<string, string>;
	timeout?: number;
	responseType?: 'json' | 'text' | 'arraybuffer';
}

export interface IResponse<T> {
	data: T;
	status: number;
	statusText: string;
	headers: Record<string, string>;
}

export interface IApiConfiguration {
	baseUrl: string;
	defaultHeaders?: Record<string, string>;
	timeout?: number;
}

export class ApiService implements IApiService {
	declare readonly _serviceBrand: undefined;

	private configuration: IApiConfiguration;

	constructor(configuration: IApiConfiguration) {
		this.configuration = configuration;
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
		// allow-any-unicode-next-line
		// 合并配置
		const config = {
			baseUrl: this.configuration.baseUrl,
			defaultHeaders: this.configuration.defaultHeaders || {},
			timeout: this.configuration.timeout || 5000
		};

		// allow-any-unicode-next-line
		// 构建完整URL
		const fullUrl = this.buildUrl(config.baseUrl, url);

		// allow-any-unicode-next-line
		// 合并请求选项
		const requestOptions: IRequestOptions = {
			headers: { ...config.defaultHeaders, ...options?.headers },
			timeout: options?.timeout || config.timeout,
			responseType: options?.responseType || 'json'
		};

		// allow-any-unicode-next-line
		// 创建请求配置
		const fetchOptions: RequestInit = {
			method,
			headers: requestOptions.headers,
			...(data && { body: JSON.stringify(data) })
		};

		// allow-any-unicode-next-line
		// 发送请求
		const response = await fetch(fullUrl, fetchOptions);

		// allow-any-unicode-next-line
		// 处理响应
		const responseData = await this.handleResponse<T>(response, requestOptions.responseType);

		return {
			data: responseData,
			status: response.status,
			statusText: response.statusText,
			headers: this.parseHeaders(response.headers)
		};
	}

	private buildUrl(baseUrl: string, url: string): string {
		// allow-any-unicode-next-line
		// 如果URL已经是完整URL，则直接返回
		if (url.startsWith('http://') || url.startsWith('https://')) {
			return url;
		}

		// allow-any-unicode-next-line
		// 确保baseUrl以/结尾，url不以/开头
		const normalizedBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
		const normalizedUrl = url.startsWith('/') ? url.slice(1) : url;

		return `${normalizedBaseUrl}/${normalizedUrl}`;
	}

	private async handleResponse<T>(response: Response, responseType?: string): Promise<T> {
		// allow-any-unicode-next-line
		// 检查响应状态
		if (!response.ok) {
			throw new Error(`HTTP ${response.status}: ${response.statusText}`);
		}

		// allow-any-unicode-next-line
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
