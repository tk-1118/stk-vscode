/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { localize, localize2 } from '../../../../nls.js';
import { Codicon } from '../../../../base/common/codicons.js';
import { registerIcon } from '../../../../platform/theme/common/iconRegistry.js';
import { Registry } from '../../../../platform/registry/common/platform.js';
import { IViewContainersRegistry, Extensions as ViewContainerExtensions, ViewContainerLocation, ViewContainer, IViewsRegistry, IViewDescriptorService } from '../../../common/views.js';
import { SyncDescriptor } from '../../../../platform/instantiation/common/descriptors.js';
import { ViewPaneContainer } from '../../../browser/parts/views/viewPaneContainer.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IWorkbenchLayoutService } from '../../../services/layout/browser/layoutService.js';
import { IContextMenuService } from '../../../../platform/contextview/browser/contextView.js';
import { ITelemetryService } from '../../../../platform/telemetry/common/telemetry.js';
import { IExtensionService } from '../../../services/extensions/common/extensions.js';
import { IThemeService } from '../../../../platform/theme/common/themeService.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { IWorkspaceContextService } from '../../../../platform/workspace/common/workspace.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { CustomAuthenticationView } from './customAuthenticationView.js';
import { IWorkbenchContribution, WorkbenchPhase, registerWorkbenchContribution2 } from '../../../common/contributions.js';
import { IAuthenticationService } from '../../../services/authentication/common/authentication.js';
import { CustomAuthenticationProvider } from './customAuthenticationProvider.js';
import { IQuickInputService } from '../../../../platform/quickinput/common/quickInput.js';
import { InstantiationType, registerSingleton } from '../../../../platform/instantiation/common/extensions.js';
import { ICustomAuthenticationService } from '../../../services/authentication/common/customAuthentication.js';
import { CustomAuthenticationService } from './customAuthenticationService.js';

// Register icon for custom authentication
const customAuthenticationIcon = registerIcon('custom-authentication', Codicon.account, localize('customAuthenticationIcon', 'Custom Authentication icon'));

// Viewlet ID
const CUSTOM_AUTHENTICATION_VIEWLET_ID = 'workbench.view.customAuthentication';

// Create view pane container class
export class CustomAuthenticationViewPaneContainer extends ViewPaneContainer {
	constructor(
		@IWorkbenchLayoutService layoutService: IWorkbenchLayoutService,
		@ITelemetryService telemetryService: ITelemetryService,
		@IWorkspaceContextService contextService: IWorkspaceContextService,
		@IStorageService storageService: IStorageService,
		@IConfigurationService configurationService: IConfigurationService,
		@IInstantiationService instantiationService: IInstantiationService,
		@IThemeService themeService: IThemeService,
		@IContextMenuService contextMenuService: IContextMenuService,
		@IExtensionService extensionService: IExtensionService,
		@IViewDescriptorService viewDescriptorService: IViewDescriptorService,
		@ILogService logService: ILogService,
	) {
		super(CUSTOM_AUTHENTICATION_VIEWLET_ID, { mergeViewWithContainerWhenSingleView: true }, instantiationService, configurationService, layoutService, contextMenuService, telemetryService, extensionService, themeService, storageService, contextService, viewDescriptorService, logService);
	}

	override create(parent: HTMLElement): void {
		super.create(parent);
		parent.classList.add('custom-authentication-viewlet');
	}
}

// Register view container
const viewContainerRegistry = Registry.as<IViewContainersRegistry>(ViewContainerExtensions.ViewContainersRegistry);
export const CUSTOM_AUTHENTICATION_VIEW_CONTAINER: ViewContainer = viewContainerRegistry.registerViewContainer({
	id: CUSTOM_AUTHENTICATION_VIEWLET_ID,
	// allow-any-unicode-next-line
	title: localize2('customAuthentication', "业务设计平台登陆"),
	ctorDescriptor: new SyncDescriptor(CustomAuthenticationViewPaneContainer),
	storageId: 'workbench.customAuthentication.views.state',
	icon: customAuthenticationIcon,
	alwaysUseContainerInfo: true,
	hideIfEmpty: false,
	order: 100,
	openCommandActionDescriptor: {
		id: CUSTOM_AUTHENTICATION_VIEWLET_ID,
		// allow-any-unicode-next-line
		title: localize2('customAuthentication', "业务设计平台登陆"),
		// allow-any-unicode-next-line
		mnemonicTitle: localize({ key: 'miViewCustomAuthentication', comment: ['&& denotes a mnemonic'] }, "业务&&设计平台登陆"),
		order: 100
	},
}, ViewContainerLocation.Sidebar);

// Custom Authentication View ID
const CUSTOM_AUTHENTICATION_VIEW_ID = 'workbench.view.customAuthentication.main';

// Register view to view container
const viewsRegistry = Registry.as<IViewsRegistry>(ViewContainerExtensions.ViewsRegistry);
viewsRegistry.registerViews([{
	id: CUSTOM_AUTHENTICATION_VIEW_ID,
	name: localize2('customAuthenticationView', "Custom Authentication"),
	ctorDescriptor: new SyncDescriptor(CustomAuthenticationView),
	canToggleVisibility: false,
	hideByDefault: false,
}], CUSTOM_AUTHENTICATION_VIEW_CONTAINER);

class CustomAuthenticationContribution implements IWorkbenchContribution {
	static readonly ID = 'workbench.contrib.customAuthentication';

	constructor(
		@IAuthenticationService private readonly authenticationService: IAuthenticationService,
		@IQuickInputService private readonly quickInputService: IQuickInputService,
		@IStorageService private readonly storageService: IStorageService,
		@ICustomAuthenticationService private readonly customAuthenticationService: ICustomAuthenticationService
	) {
		console.log('CustomAuthenticationContribution constructor called');
		// Register our custom authentication provider
		console.log('CustomAuthenticationContribution registering provider');
		const customAuthProvider = new CustomAuthenticationProvider(this.quickInputService, this.storageService, this.customAuthenticationService);
		this.authenticationService.registerAuthenticationProvider('custom-auth-provider', customAuthProvider);
		console.log('CustomAuthenticationContribution provider registered');
		console.log('CustomAuthenticationContribution constructor finished');
	}
}

// Register the custom authentication service
registerSingleton(ICustomAuthenticationService, CustomAuthenticationService, InstantiationType.Delayed);

// Register the contribution
registerWorkbenchContribution2(
	CustomAuthenticationContribution.ID,
	CustomAuthenticationContribution,
	WorkbenchPhase.AfterRestored
);
