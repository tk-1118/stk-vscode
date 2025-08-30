/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IEnhancedApiService } from '../../../services/api/common/enhancedApiService.js';
import { createDecorator } from '../../../../platform/instantiation/common/instantiation.js';

export const IBusinessDesignApiService = createDecorator<IBusinessDesignApiService>('businessDesignApiService');

export interface IBusinessDesignApiService {
	readonly _serviceBrand: undefined;

	/**
	 * // allow-any-unicode-next-line
	 * 获取业务设计列表
	 */
	getBusinessDesigns(): Promise<IBusinessDesign[]>;

	/**
	 * // allow-any-unicode-next-line
	 * 创建新的业务设计
	 */
	createBusinessDesign(design: IBusinessDesign): Promise<IBusinessDesign>;

	/**
	 * // allow-any-unicode-next-line
	 * 更新业务设计
	 */
	updateBusinessDesign(id: string, design: IBusinessDesign): Promise<IBusinessDesign>;

	/**
	 * // allow-any-unicode-next-line
	 * 删除业务设计
	 */
	deleteBusinessDesign(id: string): Promise<void>;

	/**
	 * // allow-any-unicode-next-line
	 * 获取业务设计详情
	 */
	getBusinessDesignById(id: string): Promise<IBusinessDesign>;
}

export interface IBusinessDesign {
	id: string;
	name: string;
	description: string;
	createdAt: string;
	updatedAt: string;
	// allow-any-unicode-next-line
	// 可以根据需要添加更多字段
}

export class BusinessDesignApiService implements IBusinessDesignApiService {
	declare readonly _serviceBrand: undefined;

	constructor(
		@IEnhancedApiService private readonly apiService: IEnhancedApiService
	) { }

	async getBusinessDesigns(): Promise<IBusinessDesign[]> {
		const response = await this.apiService.get<IBusinessDesign[]>('/business-designs');
		return response.data;
	}

	async createBusinessDesign(design: IBusinessDesign): Promise<IBusinessDesign> {
		const response = await this.apiService.post<IBusinessDesign>('/business-designs', design);
		return response.data;
	}

	async updateBusinessDesign(id: string, design: IBusinessDesign): Promise<IBusinessDesign> {
		const response = await this.apiService.put<IBusinessDesign>(`/business-designs/${id}`, design);
		return response.data;
	}

	async deleteBusinessDesign(id: string): Promise<void> {
		await this.apiService.delete(`/business-designs/${id}`);
	}

	async getBusinessDesignById(id: string): Promise<IBusinessDesign> {
		const response = await this.apiService.get<IBusinessDesign>(`/business-designs/${id}`);
		return response.data;
	}
}
