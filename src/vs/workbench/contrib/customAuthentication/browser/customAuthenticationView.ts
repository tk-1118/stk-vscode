/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { localize } from '../../../../nls.js';
import { $, addDisposableListener, EventType } from '../../../../base/browser/dom.js';
import { ViewPane } from '../../../browser/parts/views/viewPane.js';
import { IKeybindingService } from '../../../../platform/keybinding/common/keybinding.js';
import { IContextMenuService } from '../../../../platform/contextview/browser/contextView.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { IViewDescriptorService } from '../../../common/views.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { IOpenerService } from '../../../../platform/opener/common/opener.js';
import { IThemeService } from '../../../../platform/theme/common/themeService.js';
import { IHoverService } from '../../../../platform/hover/browser/hover.js';
import { IAccessibleViewInformationService } from '../../../services/accessibility/common/accessibleViewInformationService.js';
import { ICustomAuthenticationService } from '../../../services/authentication/common/customAuthentication.js';
import { IAuthenticationService, AuthenticationSession } from '../../../services/authentication/common/authentication.js';

export class CustomAuthenticationView extends ViewPane {
	static readonly ID = 'workbench.view.customAuthentication.main';
	static readonly NAME = localize('customAuthenticationView', "Custom Authentication");

	private session: AuthenticationSession | undefined;
	private loginButton: HTMLButtonElement | undefined;
	private logoutButton: HTMLButtonElement | undefined;
	private statusElement: HTMLElement | undefined;
	private captchaImageElement: HTMLImageElement | undefined;
	private captchaKey: string = '';
	private customAuthenticationService: ICustomAuthenticationService;
	private authenticationService: IAuthenticationService;

	constructor(
		@IKeybindingService keybindingService: IKeybindingService,
		@IContextMenuService contextMenuService: IContextMenuService,
		@IConfigurationService configurationService: IConfigurationService,
		@IContextKeyService contextKeyService: IContextKeyService,
		@IViewDescriptorService viewDescriptorService: IViewDescriptorService,
		@IInstantiationService instantiationService: IInstantiationService,
		@IOpenerService openerService: IOpenerService,
		@IThemeService themeService: IThemeService,
		@IHoverService hoverService: IHoverService,
		@ICustomAuthenticationService customAuthenticationService: ICustomAuthenticationService,
		@IAuthenticationService authenticationService: IAuthenticationService,
		@IAccessibleViewInformationService accessibleViewInformationService?: IAccessibleViewInformationService,
	) {
		super({
			id: CustomAuthenticationView.ID,
			title: CustomAuthenticationView.NAME,
		}, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, hoverService, accessibleViewInformationService);

		this.customAuthenticationService = customAuthenticationService;
		this.authenticationService = authenticationService;

		console.log('CustomAuthenticationView constructor', this.customAuthenticationService, this.authenticationService);

		// Listen for login status changes
		this._register(this.customAuthenticationService.onDidChangeLoginStatus(async (loggedIn: boolean) => {
			this.session = await this.customAuthenticationService.getCurrentSession();
			this.updateView();
		}));
	}

	protected override renderBody(container: HTMLElement): void {
		console.log('CustomAuthenticationView renderBody called');
		super.renderBody(container);

		// Add custom authentication view content
		const content = $('.custom-authentication-view-content');
		content.style.padding = '20px';

		const title = $('.custom-authentication-title');
		title.textContent = localize('customAuthenticationTitle', 'Custom Authentication');
		title.style.fontSize = '24px';
		title.style.fontWeight = 'bold';
		title.style.marginBottom = '20px';

		// Status element
		this.statusElement = $('.custom-authentication-status');
		this.statusElement.style.marginBottom = '20px';
		this.statusElement.style.padding = '10px';
		this.statusElement.style.borderRadius = '4px';

		// Login form container
		const loginFormContainer = $('.login-form-container');
		loginFormContainer.style.marginBottom = '20px';

		// Username input
		const usernameLabel = document.createElement('label');
		usernameLabel.textContent = 'Username:';
		usernameLabel.style.display = 'block';
		usernameLabel.style.marginBottom = '5px';

		const usernameInput = document.createElement('input');
		usernameInput.type = 'text';
		usernameInput.placeholder = 'Enter username';
		usernameInput.style.width = '100%';
		usernameInput.style.padding = '8px';
		usernameInput.style.marginBottom = '10px';
		usernameInput.style.border = '1px solid #ccc';
		usernameInput.style.borderRadius = '4px';

		// Password input
		const passwordLabel = document.createElement('label');
		passwordLabel.textContent = 'Password:';
		passwordLabel.style.display = 'block';
		passwordLabel.style.marginBottom = '5px';

		const passwordInput = document.createElement('input');
		passwordInput.type = 'password';
		passwordInput.placeholder = 'Enter password';
		passwordInput.style.width = '100%';
		passwordInput.style.padding = '8px';
		passwordInput.style.marginBottom = '10px';
		passwordInput.style.border = '1px solid #ccc';
		passwordInput.style.borderRadius = '4px';

		// Captcha container
		const captchaContainer = $('.captcha-container');
		captchaContainer.style.display = 'flex';
		captchaContainer.style.alignItems = 'center';
		captchaContainer.style.marginBottom = '10px';

		// Captcha image
		this.captchaImageElement = document.createElement('img');
		this.captchaImageElement.style.width = '100px';
		this.captchaImageElement.style.height = '40px';
		this.captchaImageElement.style.marginRight = '10px';
		this.captchaImageElement.style.border = '1px solid #ccc';
		this.captchaImageElement.style.borderRadius = '4px';
		this.captchaImageElement.style.cursor = 'pointer';

		// Refresh captcha button
		const refreshCaptchaButton = document.createElement('button');
		refreshCaptchaButton.textContent = 'Refresh';
		refreshCaptchaButton.style.padding = '5px 10px';
		refreshCaptchaButton.style.borderRadius = '4px';
		refreshCaptchaButton.style.border = '1px solid #ccc';
		refreshCaptchaButton.style.backgroundColor = '#f0f0f0';
		refreshCaptchaButton.style.cursor = 'pointer';

		// Captcha input
		const captchaLabel = document.createElement('label');
		captchaLabel.textContent = 'Captcha:';
		captchaLabel.style.display = 'block';
		captchaLabel.style.marginBottom = '5px';

		const captchaInput = document.createElement('input');
		captchaInput.type = 'text';
		captchaInput.placeholder = 'Enter captcha';
		captchaInput.style.width = '100%';
		captchaInput.style.padding = '8px';
		captchaInput.style.marginBottom = '10px';
		captchaInput.style.border = '1px solid #ccc';
		captchaInput.style.borderRadius = '4px';

		// Add event listener to refresh captcha
		this._register(addDisposableListener(refreshCaptchaButton, EventType.CLICK, async () => {
			await this.refreshCaptcha();
		}));

		// Add event listener to captcha image to refresh
		if (this.captchaImageElement) {
			this._register(addDisposableListener(this.captchaImageElement, EventType.CLICK, async () => {
				await this.refreshCaptcha();
			}));
		}

		// Add captcha elements to container
		captchaContainer.appendChild(this.captchaImageElement!);
		captchaContainer.appendChild(refreshCaptchaButton);

		// Buttons container
		const buttonsContainer = $('.custom-authentication-buttons');
		buttonsContainer.style.marginTop = '20px';

		// Login button
		this.loginButton = document.createElement('button');
		this.loginButton.textContent = localize('login', 'Login');
		this.loginButton.style.marginRight = '10px';
		this.loginButton.style.padding = '8px 16px';
		this.loginButton.style.borderRadius = '4px';
		this.loginButton.style.border = '1px solid #ccc';
		this.loginButton.style.backgroundColor = '#007acc';
		this.loginButton.style.color = 'white';
		this.loginButton.style.cursor = 'pointer';

		// Logout button
		this.logoutButton = document.createElement('button');
		this.logoutButton.textContent = localize('logout', 'Logout');
		this.logoutButton.style.padding = '8px 16px';
		this.logoutButton.style.borderRadius = '4px';
		this.logoutButton.style.border = '1px solid #ccc';
		this.logoutButton.style.backgroundColor = '#d9534f';
		this.logoutButton.style.color = 'white';
		this.logoutButton.style.cursor = 'pointer';

		// Add event listeners
		if (this.loginButton) {
			this._register(addDisposableListener(this.loginButton, EventType.CLICK, async () => {
				// allow-any-unicode-next-line
				// 获取验证码
				await this.refreshCaptcha();

				// allow-any-unicode-next-line
				// 获取表单数据
				const credentials = {
					username: usernameInput.value,
					password: passwordInput.value,
					captcha: captchaInput.value,
					captchaKey: this.captchaKey
				};

				const result: any = await this.customAuthenticationService.login(credentials);
				if (result.error) {
					console.error('Login failed:', result.error);
				}
			}));
		}

		if (this.logoutButton) {
			this._register(addDisposableListener(this.logoutButton, EventType.CLICK, async () => {
				await this.customAuthenticationService.logout();
			}));
		}

		// Add form elements to container
		loginFormContainer.appendChild(usernameLabel);
		loginFormContainer.appendChild(usernameInput);
		loginFormContainer.appendChild(passwordLabel);
		loginFormContainer.appendChild(passwordInput);
		loginFormContainer.appendChild(captchaLabel);
		loginFormContainer.appendChild(captchaInput);
		loginFormContainer.appendChild(captchaContainer);

		// Add buttons to container
		if (this.loginButton) {
			buttonsContainer.appendChild(this.loginButton);
		}
		if (this.logoutButton) {
			buttonsContainer.appendChild(this.logoutButton);
		}

		// Add elements to content
		content.appendChild(title);
		content.appendChild(this.statusElement);
		content.appendChild(loginFormContainer);
		content.appendChild(buttonsContainer);

		// Add content to container
		container.appendChild(content);

		// Initialize view
		console.log('CustomAuthenticationView about to call initializeView');
		this.initializeView();

		// Load initial captcha
		this.refreshCaptcha();
	}

	private async initializeView(): Promise<void> {
		console.log('CustomAuthenticationView initializeView called');
		const loggedIn = await this.customAuthenticationService.isLoggedIn();
		console.log('CustomAuthenticationView initializeView loggedIn:', loggedIn);
		if (loggedIn) {
			this.session = await this.customAuthenticationService.getCurrentSession();
		}
		this.updateView();
	}

	private updateView(): void {
		console.log('CustomAuthenticationView updateView called, session:', this.session);
		if (!this.statusElement) {
			return;
		}

		if (this.session) {
			this.statusElement.textContent = localize('loggedInAs', 'Logged in as: {0}', this.session.account.label);
			this.statusElement.style.backgroundColor = '#dff0d8';
			this.statusElement.style.color = '#3c763d';
			if (this.loginButton) {
				this.loginButton.style.display = 'none';
			}
			if (this.logoutButton) {
				this.logoutButton.style.display = 'inline-block';
			}
		} else {
			this.statusElement.textContent = localize('notLoggedIn', 'Not logged in');
			this.statusElement.style.backgroundColor = '#f2dede';
			this.statusElement.style.color = '#a94442';
			if (this.loginButton) {
				this.loginButton.style.display = 'inline-block';
			}
			if (this.logoutButton) {
				this.logoutButton.style.display = 'none';
			}
		}
	}

	/**
	 * Refreshes the captcha image
	 */
	private async refreshCaptcha(): Promise<void> {
		try {
			const captchaResponse = await this.customAuthenticationService.getCaptcha();
			this.captchaKey = captchaResponse.key;
			if (this.captchaImageElement) {
				this.captchaImageElement.src = `${captchaResponse.image}`;
			}
		} catch (e) {
			console.error('Failed to refresh captcha:', e);
		}
	}

	protected override layoutBody(height: number, width: number): void {
		super.layoutBody(height, width);
		// Custom layout logic can be added here
	}
}
