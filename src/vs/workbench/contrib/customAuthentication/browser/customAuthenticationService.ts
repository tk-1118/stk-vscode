/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Emitter, Event } from '../../../../base/common/event.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { createDecorator } from '../../../../platform/instantiation/common/instantiation.js';
import { IAuthenticationService, AuthenticationSession } from '../../../services/authentication/common/authentication.js';

export const ICustomAuthenticationService = createDecorator<ICustomAuthenticationService>('customAuthenticationService');

export interface ICustomAuthenticationService {
	readonly _serviceBrand: undefined;

	readonly onDidChangeLoginStatus: Event<boolean>;

	/**
	 * Checks if the user is currently logged in
	 */
	isLoggedIn(): Promise<boolean>;

	/**
	 * Gets the current user's session
	 */
	getCurrentSession(): Promise<AuthenticationSession | undefined>;

	/**
	 * Logs the user in
	 */
	login(): Promise<boolean>;

	/**
	 * Logs the user out
	 */
	logout(): Promise<void>;
}

export class CustomAuthenticationService extends Disposable implements ICustomAuthenticationService {
	declare readonly _serviceBrand: undefined;

	private readonly _onDidChangeLoginStatus = this._register(new Emitter<boolean>());
	readonly onDidChangeLoginStatus: Event<boolean> = this._onDidChangeLoginStatus.event;

	private _isLoggedIn = false;

	constructor(
		@IAuthenticationService private readonly authenticationService: IAuthenticationService
	) {
		super();
		console.log('CustomAuthenticationService constructor called');
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
		try {
			const sessions = await this.authenticationService.getSessions('custom-auth-provider');
			return sessions[0]; // Return the first session if available
		} catch (e) {
			return undefined;
		}
	}

	async login(): Promise<boolean> {
		try {
			await this.authenticationService.createSession('custom-auth-provider', []);
			this._isLoggedIn = true;
			this._onDidChangeLoginStatus.fire(true);
			return true;
		} catch (e) {
			console.error('Login failed:', e);
			return false;
		}
	}

	async logout(): Promise<void> {
		try {
			const sessions = await this.authenticationService.getSessions('custom-auth-provider');
			for (const session of sessions) {
				await this.authenticationService.removeSession('custom-auth-provider', session.id);
			}
			this._isLoggedIn = false;
			this._onDidChangeLoginStatus.fire(false);
		} catch (e) {
			console.error('Logout failed:', e);
		}
	}
}
