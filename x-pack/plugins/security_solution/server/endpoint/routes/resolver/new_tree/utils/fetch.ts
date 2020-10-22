/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { IScopedClusterClient } from 'kibana/server';
import { DescendantsQuery } from '../queries/children';
import { UniqueID } from '../queries/unique_id';

/**
 * The query parameters passed in from the request. These define the limits for the ES requests for retrieving the
 * resolver tree.
 */
export interface TreeOptions {
  levels: {
    ancestors: number;
    descendants: number;
  } | null;
  descendants: number;
  ancestors: number;
  timerange: {
    start: string;
    end: string;
  };
  userFieldsDef: {
    ancestry?: string;
    connections: Array<{ id: string; parentID: string }>;
  };
  nodes: Array<Map<string, string>>;
  indexPatterns: string[];
}

/**
 * Handles retrieving nodes of a resolver tree.
 */
export class Fetcher {
  constructor(private readonly client: IScopedClusterClient) {}

  /**
   * This method retrieves the resolver tree starting from the `id` during construction of the class.
   *
   * @param options the options for retrieving the structure of the tree.
   */
  public async tree(options: TreeOptions) {
    const query = new DescendantsQuery(
      new UniqueID(options.userFieldsDef),
      options.indexPatterns,
      options.timerange,
      options.descendants
    );

    return query.search(this.client, options.nodes);
  }
}
