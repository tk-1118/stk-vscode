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
import { ICustomAuthenticationService } from './customAuthenticationService.js';
import { IAuthenticationService, AuthenticationSession } from '../../../services/authentication/common/authentication.js';

export class CustomAuthenticationView extends ViewPane {
	static readonly ID = 'workbench.view.customAuthentication.main';
	static readonly NAME = localize('customAuthenticationView', "Custom Authentication");

	private session: AuthenticationSession | undefined;
	private loginButton: HTMLButtonElement | undefined;
	private logoutButton: HTMLButtonElement | undefined;
	private statusElement: HTMLElement | undefined;
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
				await this.customAuthenticationService.login();
			}));
		}

		if (this.logoutButton) {
			this._register(addDisposableListener(this.logoutButton, EventType.CLICK, async () => {
				await this.customAuthenticationService.logout();
			}));
		}

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
		content.appendChild(buttonsContainer);

		// Add content to container
		container.appendChild(content);

		// Initialize view
		console.log('CustomAuthenticationView about to call initializeView');
		this.initializeView();
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

	protected override layoutBody(height: number, width: number): void {
		super.layoutBody(height, width);
		// Custom layout logic can be added here
	}
}
