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
import { IBusinessDesignApiService, IBusinessDesign } from './businessDesignApiService.js';

export class BusinessDesignView extends ViewPane {

	static readonly ID = 'workbench.view.businessDesign.main';
	// allow-any-unicode-next-line
	static readonly NAME = localize('businessDesignView', "业务设计");

	private businessDesigns: IBusinessDesign[] = [];
	private refreshButton: HTMLButtonElement | undefined;
	private businessDesignsList: HTMLElement | undefined;
	private businessDesignApiService: IBusinessDesignApiService;

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

		// allow-any-unicode-next-line
		// 获取API服务实例
		this.businessDesignApiService = instantiationService.invokeFunction((accessor) => {
			return accessor.get(IBusinessDesignApiService);
		});
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

		// allow-any-unicode-next-line
		// 添加刷新按钮
		this.refreshButton = document.createElement('button');
		this.refreshButton.textContent = localize('refresh', '刷新'); // allow-any-unicode-next-line
		this.refreshButton.style.marginBottom = '20px';
		this.refreshButton.style.padding = '8px 16px';
		this.refreshButton.style.borderRadius = '4px';
		this.refreshButton.style.border = '1px solid #ccc';
		this.refreshButton.style.backgroundColor = '#007acc';
		this.refreshButton.style.color = 'white';
		this.refreshButton.style.cursor = 'pointer';

		if (this.refreshButton) {
			this._register(addDisposableListener(this.refreshButton, EventType.CLICK, async () => {
				await this.loadBusinessDesigns();
			}));
		}

		// allow-any-unicode-next-line
		// 业务设计列表
		this.businessDesignsList = $('.business-designs-list');
		this.businessDesignsList.style.marginBottom = '20px';

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
		content.appendChild(this.refreshButton);
		content.appendChild(this.businessDesignsList);
		content.appendChild(description);
		content.appendChild(featuresList);

		container.appendChild(content);

		// allow-any-unicode-next-line
		// 加载业务设计数据
		this.loadBusinessDesigns();
	}

	private async loadBusinessDesigns(): Promise<void> {
		if (!this.businessDesignsList) {
			return;
		}

		try {
			// allow-any-unicode-next-line
			// 调用实际的API服务
			this.businessDesigns = await this.businessDesignApiService.getBusinessDesigns();
			this.renderBusinessDesigns();
		} catch (error) {
			console.error('Failed to load business designs:', error);
			// allow-any-unicode-next-line
			// 显示错误信息
			this.businessDesignsList.textContent = localize('loadFailed', '加载业务设计失败'); // allow-any-unicode-next-line
		}
	}

	private renderBusinessDesigns(): void {
		if (!this.businessDesignsList) {
			return;
		}

		// allow-any-unicode-next-line
		// 清空现有内容
		this.businessDesignsList.innerHTML = '';

		// allow-any-unicode-next-line
		// 创建业务设计列表
		const listElement = $('ul');
		for (const design of this.businessDesigns) {
			const listItem = $('li');
			listItem.textContent = `${design.name} - ${design.description}`;
			listElement.appendChild(listItem);
		}

		this.businessDesignsList.appendChild(listElement);
	}

	protected override layoutBody(height: number, width: number): void {
		super.layoutBody(height, width);
		// allow-any-unicode-next-line
		// 可以在这里添加自定义布局逻辑
	}
}
