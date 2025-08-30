/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Event } from '../../../../base/common/event.js';
import { createDecorator } from '../../../../platform/instantiation/common/instantiation.js';
import { AuthenticationSession } from './authentication.js';

export interface ILoginCredentials {
	username: string;
	password: string;
	captcha: string;
	captchaKey: string;
}

export interface ILoginResult {
	tokenResponse: any;
	token: string;
	refreshToken: string;
	userId: string;
	roleId: string;
	session?: AuthenticationSession;
	error?: string;
}

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
	login(credentials: ILoginCredentials): Promise<ILoginResult>;

	/**
	 * Logs the user out
	 */
	logout(): Promise<void>;

	/**
	 * Gets captcha for login
	 */
	getCaptcha(): Promise<{ key: string; image: string }>;
}
