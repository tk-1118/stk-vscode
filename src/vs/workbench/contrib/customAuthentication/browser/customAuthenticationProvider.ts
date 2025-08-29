/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Emitter, Event } from '../../../../base/common/event.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { IAuthenticationProvider, AuthenticationSession, AuthenticationSessionsChangeEvent } from '../../../services/authentication/common/authentication.js';
import { IQuickInputService } from '../../../../platform/quickinput/common/quickInput.js';
import { IStorageService, StorageScope, StorageTarget } from '../../../../platform/storage/common/storage.js';
import { localize } from '../../../../nls.js';

interface ICustomAuthSession extends AuthenticationSession {
	// Custom session properties can be added here
}

export class CustomAuthenticationProvider extends Disposable implements IAuthenticationProvider {
	readonly id = 'custom-auth-provider';
	readonly label = localize('customAuthProvider', "Custom Authentication");
	readonly supportsMultipleAccounts = false;

	private _sessions: ICustomAuthSession[] = [];
	private _onDidChangeSessions = this._register(new Emitter<AuthenticationSessionsChangeEvent>());
	readonly onDidChangeSessions: Event<AuthenticationSessionsChangeEvent> = this._onDidChangeSessions.event;

	constructor(
		@IQuickInputService private readonly quickInputService: IQuickInputService,
		@IStorageService private readonly storageService: IStorageService
	) {
		super();
		console.log('CustomAuthenticationProvider constructor called');
		this.loadSessions();
		console.log('CustomAuthenticationProvider constructor finished');
	}

	private loadSessions(): void {
		console.log('CustomAuthenticationProvider loadSessions called');
		try {
			const storedSessions = this.storageService.get('custom-auth.sessions', StorageScope.APPLICATION, '[]');
			console.log('CustomAuthenticationProvider loadSessions storedSessions:', storedSessions);
			this._sessions = JSON.parse(storedSessions);
			console.log('CustomAuthenticationProvider loadSessions sessions:', this._sessions);
		} catch (e) {
			console.error('CustomAuthenticationProvider loadSessions error:', e);
			this._sessions = [];
		}
	}

	private saveSessions(): void {
		this.storageService.store(
			'custom-auth.sessions',
			JSON.stringify(this._sessions),
			StorageScope.APPLICATION,
			StorageTarget.MACHINE
		);
	}

	async getSessions(scopes?: string[]): Promise<readonly AuthenticationSession[]> {
		return this._sessions;
	}

	async createSession(scopes: string[]): Promise<AuthenticationSession> {
		// Show login UI
		const username = await this.quickInputService.input({
			prompt: localize('enterUsername', "Enter your username"),
			placeHolder: localize('usernamePlaceholder', "Username")
		});

		if (!username) {
			throw new Error(localize('loginCancelled', "Login cancelled"));
		}

		const password = await this.quickInputService.input({
			prompt: localize('enterPassword', "Enter your password"),
			placeHolder: localize('passwordPlaceholder', "Password"),
			password: true
		});

		if (!password) {
			throw new Error(localize('loginCancelled', "Login cancelled"));
		}

		// In a real implementation, you would authenticate with a server here
		// For this example, we'll just create a mock session
		const session: ICustomAuthSession = {
			id: `session-${Date.now()}`,
			accessToken: `token-${Date.now()}`,
			account: {
				label: username,
				id: `account-${username}`
			},
			scopes: scopes || []
		};

		this._sessions.push(session);
		this.saveSessions();
		this._onDidChangeSessions.fire({ added: [session], removed: [], changed: [] });

		return session;
	}

	async removeSession(sessionId: string): Promise<void> {
		const index = this._sessions.findIndex(session => session.id === sessionId);
		if (index !== -1) {
			const removed = this._sessions.splice(index, 1);
			this.saveSessions();
			this._onDidChangeSessions.fire({ added: [], removed, changed: [] });
		}
	}
}
