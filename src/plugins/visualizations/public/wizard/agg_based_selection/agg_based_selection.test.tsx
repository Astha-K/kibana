/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import React from 'react';
import { mountWithIntl } from '@kbn/test/jest';
import { TypesStart, VisType, VisGroups } from '../../vis_types';
import { AggBasedSelection } from './agg_based_selection';

describe('AggBasedSelection', () => {
  const defaultVisTypeParams = {
    hidden: false,
    visualization: class Controller {
      public render = jest.fn();
      public destroy = jest.fn();
    },
    requiresSearch: false,
    requestHandler: 'none',
    responseHandler: 'none',
  };
  const _visTypes = [
    {
      name: 'vis1',
      title: 'Vis Type 1',
      stage: 'production',
      group: VisGroups.PROMOTED,
      ...defaultVisTypeParams,
    },
    {
      name: 'vis2',
      title: 'Vis Type 2',
      group: VisGroups.AGGBASED,
      stage: 'production',
      ...defaultVisTypeParams,
    },
    {
      name: 'vis3',
      title: 'Vis Type 3',
      stage: 'production',
      group: VisGroups.AGGBASED,
    },
    {
      name: 'visWithSearch',
      title: 'Vis with search',
      group: VisGroups.AGGBASED,
      stage: 'production',
      ...defaultVisTypeParams,
    },
  ] as VisType[];

  const visTypes: TypesStart = {
    get<T>(id: string): VisType<T> {
      return _visTypes.find((vis) => vis.name === id) as VisType<T>;
    },
    all: () => {
      return (_visTypes as unknown) as VisType[];
    },
    getAliases: () => [],
    unRegisterAlias: () => [],
    getByGroup: (group: VisGroups) => {
      return _visTypes.filter((type) => {
        return type.group === group;
      }) as VisType[];
    },
  };

  beforeAll(() => {
    Object.defineProperty(window, 'location', {
      value: {
        assign: jest.fn(),
      },
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call the toggleGroups if the user clicks the goBack link', () => {
    const toggleGroups = jest.fn();
    const wrapper = mountWithIntl(
      <AggBasedSelection
        visTypesRegistry={visTypes}
        toggleGroups={toggleGroups}
        onVisTypeSelected={jest.fn()}
      />
    );
    const aggBasedGroupCard = wrapper.find('[data-test-subj="goBackLink"]').at(0);
    aggBasedGroupCard.simulate('click');
    expect(toggleGroups).toHaveBeenCalled();
  });

  describe('filter for visualization types', () => {
    it('should render as expected', () => {
      const wrapper = mountWithIntl(
        <AggBasedSelection
          visTypesRegistry={visTypes}
          toggleGroups={jest.fn()}
          onVisTypeSelected={jest.fn()}
        />
      );
      const searchBox = wrapper.find('input[data-test-subj="filterVisType"]');
      searchBox.simulate('change', { target: { value: 'with' } });
      expect(wrapper.find('[data-test-subj="visType-visWithSearch"]').exists()).toBe(true);
    });
  });
});
