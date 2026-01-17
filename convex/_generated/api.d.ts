/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as admin from "../admin.js";
import type * as cart from "../cart.js";
import type * as chat from "../chat.js";
import type * as crons from "../crons.js";
import type * as dashboard from "../dashboard.js";
import type * as dev from "../dev.js";
import type * as drops from "../drops.js";
import type * as events from "../events.js";
import type * as forum from "../forum.js";
import type * as gallery from "../gallery.js";
import type * as helpers from "../helpers.js";
import type * as httpActions from "../httpActions.js";
import type * as instagram from "../instagram.js";
import type * as instagramSync from "../instagramSync.js";
import type * as inventoryRepair from "../inventoryRepair.js";
import type * as leaderboard from "../leaderboard.js";
import type * as merch from "../merch.js";
import type * as migrations from "../migrations.js";
import type * as offlineQueue from "../offlineQueue.js";
import type * as orders from "../orders.js";
import type * as points from "../points.js";
import type * as quests from "../quests.js";
import type * as recommendations from "../recommendations.js";
import type * as rewards from "../rewards.js";
import type * as scheduler from "../scheduler.js";
import type * as search from "../search.js";
import type * as seedSocials from "../seedSocials.js";
import type * as socialGallery from "../socialGallery.js";
import type * as spotify from "../spotify.js";
import type * as spotifySync from "../spotifySync.js";
import type * as streaks from "../streaks.js";
import type * as trending from "../trending.js";
import type * as ugc from "../ugc.js";
import type * as userSettings from "../userSettings.js";
import type * as users from "../users.js";
import type * as venues from "../venues.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  admin: typeof admin;
  cart: typeof cart;
  chat: typeof chat;
  crons: typeof crons;
  dashboard: typeof dashboard;
  dev: typeof dev;
  drops: typeof drops;
  events: typeof events;
  forum: typeof forum;
  gallery: typeof gallery;
  helpers: typeof helpers;
  httpActions: typeof httpActions;
  instagram: typeof instagram;
  instagramSync: typeof instagramSync;
  inventoryRepair: typeof inventoryRepair;
  leaderboard: typeof leaderboard;
  merch: typeof merch;
  migrations: typeof migrations;
  offlineQueue: typeof offlineQueue;
  orders: typeof orders;
  points: typeof points;
  quests: typeof quests;
  recommendations: typeof recommendations;
  rewards: typeof rewards;
  scheduler: typeof scheduler;
  search: typeof search;
  seedSocials: typeof seedSocials;
  socialGallery: typeof socialGallery;
  spotify: typeof spotify;
  spotifySync: typeof spotifySync;
  streaks: typeof streaks;
  trending: typeof trending;
  ugc: typeof ugc;
  userSettings: typeof userSettings;
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
