/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { localize } from '../../../../nls.js';
import { Action, IAction } from '../../../../base/common/actions.js';
import { IThemeService } from '../../../../platform/theme/common/themeService.js';
import { IHoverService } from '../../../../platform/hover/browser/hover.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IKeybindingService } from '../../../../platform/keybinding/common/keybinding.js';
import { CompositeBarAction, CompositeBarActionViewItem, ICompositeBarActionViewItemOptions } from '../../../browser/parts/compositeBarActions.js';
import { IContextMenuService } from '../../../../platform/contextview/browser/contextView.js';
import { IAuthenticationService } from '../../../services/authentication/common/authentication.js';
import { IQuickInputService } from '../../../../platform/quickinput/common/quickInput.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { ThemeIcon } from '../../../../base/common/themables.js';
import { Codicon } from '../../../../base/common/codicons.js';
import { registerIcon } from '../../../../platform/theme/common/iconRegistry.js';
import { addDisposableListener, EventType, EventHelper, getWindow } from '../../../../base/browser/dom.js';
import { StandardMouseEvent } from '../../../../base/browser/mouseEvent.js';
import { AnchorAlignment } from '../../../../base/browser/ui/contextview/contextview.js';

// Register icon for custom login
const customLoginIcon = registerIcon('custom-login', Codicon.account, localize('customLoginIcon', 'Custom login icon'));

export class CustomLoginAction extends Action {
	static readonly ID = 'workbench.action.customLogin';
	static readonly LABEL = localize('customLogin', "Custom Login");

	constructor(
		private readonly authenticationService: IAuthenticationService,
		private readonly quickInputService: IQuickInputService,
		private readonly storageService: IStorageService
	) {
		super(CustomLoginAction.ID, CustomLoginAction.LABEL, ThemeIcon.asClassName(customLoginIcon), true);
		console.log('CustomLoginAction constructor', this.authenticationService, this.quickInputService, this.storageService);
	}

	override async run(): Promise<void> {
		// Check if we already have a session
		try {
			const sessions = await this.authenticationService.getSessions('custom-auth-provider');
			if (sessions.length > 0) {
				// Already logged in, show logout option
				await this.logout();
			} else {
				// Not logged in, show login UI
				await this.login();
			}
		} catch (e) {
			// If there's an error getting sessions, assume we're not logged in
			await this.login();
		}
	}

	private async login(): Promise<void> {
		// Show login UI
		const username = await this.quickInputService.input({
			prompt: localize('enterUsername', "Enter your username"),
			placeHolder: localize('usernamePlaceholder', "Username")
		});

		if (!username) {
			return;
		}

		const password = await this.quickInputService.input({
			prompt: localize('enterPassword', "Enter your password"),
			placeHolder: localize('passwordPlaceholder', "Password"),
			password: true
		});

		if (!password) {
			return;
		}

		// In a real implementation, you would authenticate with a server here
		// For this example, we'll just create a session
		try {
			await this.authenticationService.createSession('custom-auth-provider', []);
			// Update action label to show logged in state
			this.label = localize('customLogout', "Logout {0}", username);
		} catch (e) {
			console.error(localize('loginFailed', "Login failed: {0}", (e as Error).message));
		}
	}

	private async logout(): Promise<void> {
		try {
			const sessions = await this.authenticationService.getSessions('custom-auth-provider');
			for (const session of sessions) {
				await this.authenticationService.removeSession('custom-auth-provider', session.id);
			}
			// Reset action label
			this.label = CustomLoginAction.LABEL;
		} catch (e) {
			console.error(localize('logoutFailed', "Logout failed: {0}", (e as Error).message));
		}
	}
}

export class CustomLoginActionViewItem extends CompositeBarActionViewItem {
	constructor(
		action: CompositeBarAction,
		options: ICompositeBarActionViewItemOptions,
		@IThemeService themeService: IThemeService,
		@IHoverService hoverService: IHoverService,
		@IConfigurationService configurationService: IConfigurationService,
		@IKeybindingService keybindingService: IKeybindingService,
		@IContextMenuService private readonly contextMenuService: IContextMenuService,
		@IAuthenticationService private readonly authenticationService: IAuthenticationService,
		@IQuickInputService private readonly quickInputService: IQuickInputService,
		@IStorageService private readonly storageService: IStorageService
	) {
		super(action, { ...options, hasPopup: true }, () => true, themeService, hoverService, configurationService, keybindingService);
		console.log('CustomLoginActionViewItem constructor', this.authenticationService, this.quickInputService, this.storageService);
	}

	override render(container: HTMLElement): void {
		super.render(container);

		// Add click listener for custom behavior
		this._register(addDisposableListener(this.container, EventType.CLICK, async (e: MouseEvent) => {
			EventHelper.stop(e, true);
			await this.action.run();
		}));

		// Add context menu listener
		this._register(addDisposableListener(this.container, EventType.CONTEXT_MENU, (e: MouseEvent) => {
			EventHelper.stop(e, true);
			this.showContextMenu(e);
		}));
	}

	private showContextMenu(e: MouseEvent): void {
		const actions: IAction[] = [];

		// Add any context menu actions here
		actions.push(new Action(
			'customLogin.status',
			localize('loginStatus', "Login Status"),
			undefined,
			false,
			() => Promise.resolve()
		));

		const event = new StandardMouseEvent(getWindow(this.container), e);
		this.contextMenuService.showContextMenu({
			getAnchor: () => event,
			getActions: () => actions,
			anchorAlignment: AnchorAlignment.RIGHT
		});
	}

	protected override computeTitle(): string {
		return localize('customLoginTitle', "Custom Login");
	}
}
