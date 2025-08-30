/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { createDecorator } from '../../../../platform/instantiation/common/instantiation.js';
import { IApiConfiguration } from './apiService.js';

export const IApiConfigurationService = createDecorator<IApiConfigurationService>('apiConfigurationService');

export interface IApiConfigurationService {
	readonly _serviceBrand: undefined;

	/**
	 * // allow-any-unicode-next-line
	 * 获取API配置
	 */
	getConfiguration(): IApiConfiguration;

	/**
	 * // allow-any-unicode-next-line
	 * 更新API配置
	 */
	updateConfiguration(configuration: Partial<IApiConfiguration>): void;

	/**
	 * // allow-any-unicode-next-line
	 * 重置为默认配置
	 */
	resetToDefault(): void;

	/**
	 * // allow-any-unicode-next-line
	 * 设置认证令牌
	 */
	setAuthToken(token: string): void;

	/**
	 * // allow-any-unicode-next-line
	 * 移除认证令牌
	 */
	removeAuthToken(): void;
}

export class ApiConfigurationService implements IApiConfigurationService {
	declare readonly _serviceBrand: undefined;

	private defaultConfiguration: IApiConfiguration = {
		baseUrl: 'http://49.232.13.110:83',
		defaultHeaders: {
			'Content-Type': 'application/json',
			'Authorization': 'Basic YWRtaW46YWRtaW5fc2VjcmV0',
			'Tenant-Id': '000000'
		},
		timeout: 5000
	};

	private configuration: IApiConfiguration;

	constructor() {
		this.configuration = { ...this.defaultConfiguration };
	}

	getConfiguration(): IApiConfiguration {
		return { ...this.configuration };
	}

	updateConfiguration(configuration: Partial<IApiConfiguration>): void {
		this.configuration = {
			...this.configuration,
			...configuration
		};
	}

	resetToDefault(): void {
		this.configuration = { ...this.defaultConfiguration };
	}

	/**
	 * // allow-any-unicode-next-line
	 * 设置认证令牌
	 */
	setAuthToken(token: string): void {
		if (!this.configuration.defaultHeaders) {
			this.configuration.defaultHeaders = {};
		}
		this.configuration.defaultHeaders['Authorization'] = `Bearer ${token}`;
	}

	/**
	 * // allow-any-unicode-next-line
	 * 移除认证令牌
	 */
	removeAuthToken(): void {
		if (this.configuration.defaultHeaders) {
			delete this.configuration.defaultHeaders['Authorization'];
		}
	}
}
