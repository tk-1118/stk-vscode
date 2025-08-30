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
import { BusinessDesignView } from './businessDesignView.js';

// allow-any-unicode-next-line
// 为业务设计功能注册图标
const businessDesignIcon = registerIcon('business-design', Codicon.project, localize('businessDesignIcon', 'Business Design icon'));

// allow-any-unicode-next-line
// 视图容器ID
const BUSINESS_DESIGN_VIEWLET_ID = 'workbench.view.businessDesign';

// allow-any-unicode-next-line
// 创建视图容器面板类
export class BusinessDesignViewPaneContainer extends ViewPaneContainer {

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
		super(BUSINESS_DESIGN_VIEWLET_ID, { mergeViewWithContainerWhenSingleView: true }, instantiationService, configurationService, layoutService, contextMenuService, telemetryService, extensionService, themeService, storageService, contextService, viewDescriptorService, logService);
	}

	override create(parent: HTMLElement): void {
		super.create(parent);
		parent.classList.add('business-design-viewlet');
	}
}

// allow-any-unicode-next-line
// 注册视图容器
const viewContainerRegistry = Registry.as<IViewContainersRegistry>(ViewContainerExtensions.ViewContainersRegistry);
export const BUSINESS_DESIGN_VIEW_CONTAINER: ViewContainer = viewContainerRegistry.registerViewContainer({
	id: BUSINESS_DESIGN_VIEWLET_ID,
	// allow-any-unicode-next-line
	title: localize2('businessDesign', "业务设计"),
	ctorDescriptor: new SyncDescriptor(BusinessDesignViewPaneContainer),
	storageId: 'workbench.businessDesign.views.state',
	icon: businessDesignIcon,
	alwaysUseContainerInfo: true,
	hideIfEmpty: false,
	order: 10,
	openCommandActionDescriptor: {
		id: BUSINESS_DESIGN_VIEWLET_ID,
		// allow-any-unicode-next-line
		title: localize2('businessDesign', "业务设计"),
		// allow-any-unicode-next-line
		mnemonicTitle: localize({ key: 'miViewBusinessDesign', comment: ['&& denotes a mnemonic'] }, "业务&&设计"),
		order: 10
	},
}, ViewContainerLocation.Sidebar);

// allow-any-unicode-next-line
// 业务设计视图ID
const BUSINESS_DESIGN_VIEW_ID = 'workbench.view.businessDesign.main';

// allow-any-unicode-next-line
// 注册视图到视图容器
const viewsRegistry = Registry.as<IViewsRegistry>(ViewContainerExtensions.ViewsRegistry);
viewsRegistry.registerViews([{
	id: BUSINESS_DESIGN_VIEW_ID,
	// allow-any-unicode-next-line
	name: localize2('businessDesignView', "业务设计"),
	ctorDescriptor: new SyncDescriptor(BusinessDesignView),
	canToggleVisibility: false,
	hideByDefault: false,
}], BUSINESS_DESIGN_VIEW_CONTAINER);

// allow-any-unicode-next-line
// 注册业务设计API服务
import './businessDesignApi.contribution.js';
