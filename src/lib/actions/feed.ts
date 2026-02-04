"use server"

import { z } from "zod";
import

// NOTE: Do last as will call other funcs
// TODO: Dr. Sharonwski wants to have non followed user's posts to enter the feed. This is going to be difficult to test without content on the platform.
// TODO: Dependency Injection possibility here because we have two kinds of feeds
export async function getFeedPosts() {
  // TODO: Will need to retrieve posts by some metrics
  // TODO: Will need to sort posts (chronological probably - with a filter on followed users posts? - then other posts?)
}
