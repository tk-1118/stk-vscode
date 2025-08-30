/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { InstantiationType, registerSingleton } from '../../../../platform/instantiation/common/extensions.js';
import { IBusinessDesignApiService, BusinessDesignApiService } from './businessDesignApiService.js';

// allow-any-unicode-next-line
// 注册业务设计API服务
registerSingleton(IBusinessDesignApiService, BusinessDesignApiService, InstantiationType.Eager);
