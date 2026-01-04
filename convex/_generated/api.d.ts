/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as cart from "../cart.js";
import type * as chat from "../chat.js";
import type * as crons from "../crons.js";
import type * as events from "../events.js";
import type * as forum from "../forum.js";
import type * as gallery from "../gallery.js";
import type * as helpers from "../helpers.js";
import type * as httpActions from "../httpActions.js";
import type * as inventoryRepair from "../inventoryRepair.js";
import type * as merch from "../merch.js";
import type * as offlineQueue from "../offlineQueue.js";
import type * as orders from "../orders.js";
import type * as recommendations from "../recommendations.js";
import type * as scheduler from "../scheduler.js";
import type * as search from "../search.js";
import type * as trending from "../trending.js";
import type * as ugc from "../ugc.js";
import type * as users from "../users.js";
import type * as venues from "../venues.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  cart: typeof cart;
  chat: typeof chat;
  crons: typeof crons;
  events: typeof events;
  forum: typeof forum;
  gallery: typeof gallery;
  helpers: typeof helpers;
  httpActions: typeof httpActions;
  inventoryRepair: typeof inventoryRepair;
  merch: typeof merch;
  offlineQueue: typeof offlineQueue;
  orders: typeof orders;
  recommendations: typeof recommendations;
  scheduler: typeof scheduler;
  search: typeof search;
  trending: typeof trending;
  ugc: typeof ugc;
  users: typeof users;
  venues: typeof venues;
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
