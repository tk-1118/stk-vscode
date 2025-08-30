/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IEnhancedApiService } from '../../../services/api/common/enhancedApiService.js';

// allow-any-unicode-next-line
// API 端点
export const AUTH_API_ENDPOINTS = {
	CAPTCHA: '/zz-infra/zz-auth/oauth/captcha',
	USER_INFO: '/zz-infra/zz-auth/sp/query-platform-account-role',
	TOKEN: '/zz-infra/oauth/token'
};

// allow-any-unicode-next-line
// 响应接口
export interface ICaptchaResponse {
	key: string;
	image: string;
}

export interface IUserInfoResponse {
	data: {
		tokenPreCode: string;
		orgUserOrgRoleList: Array<{
			userList: Array<{
				id: string;
				roleList: Array<{
					id: string;
				}>;
			}>;
		}>;
	};
}

export interface ITokenResponse {
	access_token: string;
	refresh_token: string;
	account: string;
	avatar: string;
	dept_id: string;
	dept_name: string;
	dept_sn: string;
	detail: string;
	expires_in: number;
	jti: string;
	license: string;
	nick_name: string;
	oauth_id: string;
	org_group_id: string;
	org_group_name: string;
	org_id: string;
	org_name: string;
	org_sn: string;
	org_type: string;
	org_user_sn: string;
	post_id: string;
	real_name: string;
	role_id: string;
	role_name: string;
	scope: string;
	status: string;
	tenant_id: string;
	tenant_type: string;
	token_type: string;
	user_id: string;
	user_name: string;
	user_type: string;
}

export interface ILoginResult {
	tokenResponse: ITokenResponse;
	token: string;
	refreshToken: string;
	userId: string;
	roleId: string;
}

export interface ILoginCredentials {
	username: string;
	password: string;
	captcha: string;
	captchaKey: string;
}

export class CustomAuthApi {
	constructor(
		private readonly apiService: IEnhancedApiService,
	) { }

	public async getCaptcha(): Promise<ICaptchaResponse> {
		const response = await this.apiService.get<ICaptchaResponse>(AUTH_API_ENDPOINTS.CAPTCHA);
		return response.data;
	}

	public async queryPlatformAccountRole(
		username: string,
		password: string,
		captcha: string,
		captchaKey: string
	): Promise<IUserInfoResponse> {
		// 构建请求URL参数
		const searchParams = new URLSearchParams({
			account: username,
			password: password, // allow-any-unicode-next-line
			// 注意：这里不进行MD5加密，实际应用中应该加密
			userType: '1'
		});

		// allow-any-unicode-next-line
		// 构建请求头
		const headers = {
			'Tenant-Id': '000000',
			'Captcha-Key': captchaKey,
			'Captcha-Code': captcha
		};

		// allow-any-unicode-next-line
		// 合并headers到API服务的默认headers中
		const mergedHeaders = { ...headers };

		const response = await this.apiService.get<IUserInfoResponse>(
			`${AUTH_API_ENDPOINTS.USER_INFO}?${searchParams.toString()}`,
			{ headers: mergedHeaders, responseType: 'json' }
		);

		return response.data;
	}

	public async getToken(
		userId: string,
		roleId: string,
		tokenPreCode: string
	): Promise<ITokenResponse> {
		const params = {
			userId,
			roleId,
			tokenPreCode,
			scope: 'all',
			loginType: 'sp_pwd',
			grant_type: 'org_user'
		};

		const headers = {
			'Content-Type': 'application/json',
			'Tenant-Id': '000000'
		};

		const response = await this.apiService.post<ITokenResponse>(
			AUTH_API_ENDPOINTS.TOKEN,
			params,
			{ headers }
		);

		return response.data;
	}

	public async login(
		username: string,
		password: string,
		captcha: string,
		captchaKey: string
	): Promise<ILoginResult> {
		try {
			// allow-any-unicode-next-line
			// 1. 查询平台账号角色
			const userInfoResponse = await this.queryPlatformAccountRole(
				username,
				password,
				captcha,
				captchaKey
			);

			if (!userInfoResponse || !userInfoResponse.data) {
				throw new Error('用户信息获取失败'); // allow-any-unicode-next-line
			}

			const tokenPreCode = userInfoResponse.data.tokenPreCode;
			const orgUserOrgRoleList = userInfoResponse.data.orgUserOrgRoleList;

			if (!orgUserOrgRoleList || !orgUserOrgRoleList[0] || !orgUserOrgRoleList[0].userList || !orgUserOrgRoleList[0].userList[0]) {
				throw new Error('用户角色信息获取失败'); // allow-any-unicode-next-line
			}

			const roleId = orgUserOrgRoleList[0].userList[0].roleList.map((item) => item.id).join(',');
			const userId = orgUserOrgRoleList[0].userList[0].id;

			// allow-any-unicode-next-line
			// 2. 获取token
			const tokenResponse = await this.getToken(userId, roleId, tokenPreCode);

			if (!tokenResponse) {
				throw new Error('获取授权失败'); // allow-any-unicode-next-line
			}

			// allow-any-unicode-next-line
			// 3. 返回登录结果
			return {
				tokenResponse: tokenResponse,
				token: tokenResponse.access_token,
				refreshToken: tokenResponse.refresh_token,
				userId,
				roleId
			};
		} catch (error) {
			console.error('Login failed:', error);
			throw error;
		}
	}
}
