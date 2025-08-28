/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { localize } from '../../../../nls.js';
import { $ } from '../../../../base/browser/dom.js';
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

export class BusinessDesignView extends ViewPane {

	static readonly ID = 'workbench.view.businessDesign.main';
	// allow-any-unicode-next-line
	static readonly NAME = localize('businessDesignView', "业务设计");

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
		@IAccessibleViewInformationService accessibleViewInformationService?: IAccessibleViewInformationService,
	) {
		super({
			id: BusinessDesignView.ID,
			title: BusinessDesignView.NAME,
		}, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, hoverService, accessibleViewInformationService);
	}

	protected override renderBody(container: HTMLElement): void {
		super.renderBody(container);

		// allow-any-unicode-next-line
		// 添加业务设计视图的内容
		const content = $('.business-design-view-content');
		content.style.padding = '20px';

		const title = $('.business-design-title');
		// allow-any-unicode-next-line
		title.textContent = localize('businessDesignTitle', '业务设计');
		title.style.fontSize = '24px';
		title.style.fontWeight = 'bold';
		title.style.marginBottom = '20px';

		const description = $('.business-design-description');
		// allow-any-unicode-next-line
		description.textContent = localize('businessDesignDescription', '在这里您可以进行业务设计和建模工作。');
		description.style.marginBottom = '20px';

		const featuresList = $('.business-design-features');
		featuresList.style.marginBottom = '20px';

		const featuresTitle = $('.features-title');
		// allow-any-unicode-next-line
		featuresTitle.textContent = localize('businessDesignFeatures', '功能特性：');
		featuresTitle.style.fontWeight = 'bold';
		featuresTitle.style.marginBottom = '10px';

		const features = [
			// allow-any-unicode-next-line
			localize('feature1', '业务流程建模'),
			// allow-any-unicode-next-line
			localize('feature2', '数据模型设计'),
			// allow-any-unicode-next-line
			localize('feature3', '系统架构设计'),
			// allow-any-unicode-next-line
			localize('feature4', '接口规范定义')
		];

		const featuresListElement = $('ul');
		for (const feature of features) {
			const listItem = $('li');
			listItem.textContent = feature;
			featuresListElement.appendChild(listItem);
		}

		featuresList.appendChild(featuresTitle);
		featuresList.appendChild(featuresListElement);

		content.appendChild(title);
		content.appendChild(description);
		content.appendChild(featuresList);

		container.appendChild(content);
	}

	protected override layoutBody(height: number, width: number): void {
		super.layoutBody(height, width);
		// allow-any-unicode-next-line
		// 可以在这里添加自定义布局逻辑
	}
}
