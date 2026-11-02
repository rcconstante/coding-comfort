/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as auth from "../auth.js";
import type * as bootstrap from "../bootstrap.js";
import type * as dataAccess from "../dataAccess.js";
import type * as dataManagement from "../dataManagement.js";
import type * as http from "../http.js";
import type * as instruments from "../instruments.js";
import type * as permissions from "../permissions.js";
import type * as reflection from "../reflection.js";
import type * as reflection_worker from "../reflection_worker.js";
import type * as research from "../research.js";
import type * as researchers from "../researchers.js";
import type * as survey from "../survey.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  bootstrap: typeof bootstrap;
  dataAccess: typeof dataAccess;
  dataManagement: typeof dataManagement;
  http: typeof http;
  instruments: typeof instruments;
  permissions: typeof permissions;
  reflection: typeof reflection;
  reflection_worker: typeof reflection_worker;
  research: typeof research;
  researchers: typeof researchers;
  survey: typeof survey;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
