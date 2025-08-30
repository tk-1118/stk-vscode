/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Emitter, Event } from '../../../../base/common/event.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { IAuthenticationService, AuthenticationSession } from '../../../services/authentication/common/authentication.js';
import { IEnhancedApiService } from '../../../services/api/common/enhancedApiService.js';
import { IApiConfigurationService } from '../../../services/api/common/configurationService.js';
import { CustomAuthApi, ILoginCredentials, ILoginResult as ICustomLoginResult } from './customAuthApi.js';
import { ICustomAuthenticationService, ILoginResult } from '../../../services/authentication/common/customAuthentication.js';

export class CustomAuthenticationService extends Disposable implements ICustomAuthenticationService {
	declare readonly _serviceBrand: undefined;

	private readonly _onDidChangeLoginStatus = this._register(new Emitter<boolean>());
	readonly onDidChangeLoginStatus: Event<boolean> = this._onDidChangeLoginStatus.event;

	private _isLoggedIn = false;
	private _currentSession: AuthenticationSession | undefined;
	private _authApi: CustomAuthApi;

	constructor(
		@IAuthenticationService private readonly authenticationService: IAuthenticationService,
		@IEnhancedApiService private readonly apiService: IEnhancedApiService,
		@IApiConfigurationService private readonly apiConfigService: IApiConfigurationService
	) {
		super();
		console.log('CustomAuthenticationService constructor called');

		// allow-any-unicode-next-line
		// 创建认证API实例
		this._authApi = new CustomAuthApi(this.apiService);

		// Check initial login status
		this.checkLoginStatus();
		console.log('CustomAuthenticationService constructor finished');
	}

	private async checkLoginStatus(): Promise<void> {
		console.log('CustomAuthenticationService checkLoginStatus called');
		try {
			const sessions = await this.authenticationService.getSessions('custom-auth-provider');
			console.log('CustomAuthenticationService checkLoginStatus sessions:', sessions);
			this._isLoggedIn = sessions.length > 0;
			if (this._isLoggedIn) {
				this._currentSession = sessions[0];
			}
			this._onDidChangeLoginStatus.fire(this._isLoggedIn);
			console.log('CustomAuthenticationService checkLoginStatus finished, isLoggedIn:', this._isLoggedIn);
		} catch (e) {
			console.error('CustomAuthenticationService checkLoginStatus error:', e);
			this._isLoggedIn = false;
			this._onDidChangeLoginStatus.fire(false);
		}
	}

	async isLoggedIn(): Promise<boolean> {
		return this._isLoggedIn;
	}

	async getCurrentSession(): Promise<AuthenticationSession | undefined> {
		return this._currentSession;
	}

	async login(credentials: ILoginCredentials): Promise<ILoginResult> {
		try {
			// allow-any-unicode-next-line
			// 调用API进行登录
			const loginResult = await this._authApi.login(
				credentials.username,
				credentials.password,
				credentials.captcha,
				credentials.captchaKey
			);

			// allow-any-unicode-next-line
			// 创建认证会话
			const session = await this.authenticationService.createSession('custom-auth-provider', []);

			// allow-any-unicode-next-line
			// 设置认证令牌
			this.apiConfigService.setAuthToken(loginResult.token);

			this._isLoggedIn = true;
			this._currentSession = session;
			this._onDidChangeLoginStatus.fire(true);

			// allow-any-unicode-next-line
			// 返回扩展的登录结果
			const extendedResult: any = {
				tokenResponse: loginResult.tokenResponse,
				token: loginResult.token,
				refreshToken: loginResult.refreshToken,
				userId: loginResult.userId,
				roleId: loginResult.roleId,
				session: session
			};

			return extendedResult;
		} catch (e) {
			console.error('Login failed:', e);

			// allow-any-unicode-next-line
			// 返回扩展的登录结果（包含错误信息）
			const extendedResult: any = {
				tokenResponse: null as any,
				token: '',
				refreshToken: '',
				userId: '',
				roleId: '',
				session: undefined,
				error: e instanceof Error ? e.message : 'Unknown error'
			};

			return extendedResult;
		}
	}

	async logout(): Promise<void> {
		try {
			// allow-any-unicode-next-line
			// 调用API进行登出
			// allow-any-unicode-next-line
			// 这里可以调用登出API，如果有的话
		} catch (e) {
			console.error('Logout API call failed:', e);
		}

		try {
			const sessions = await this.authenticationService.getSessions('custom-auth-provider');
			for (const session of sessions) {
				await this.authenticationService.removeSession('custom-auth-provider', session.id);
			}
			this._isLoggedIn = false;
			this._currentSession = undefined;
			this._onDidChangeLoginStatus.fire(false);

			// allow-any-unicode-next-line
			// 移除认证令牌
			this.apiConfigService.removeAuthToken();
		} catch (e) {
			console.error('Logout failed:', e);
		}
	}

	async getCaptcha(): Promise<{ key: string; image: string }> {
		return this._authApi.getCaptcha();
	}
}
