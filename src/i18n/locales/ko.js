import common from "./ko/common.js";
import authentication from "./ko/authentication.js";
import movies from "./ko/movies.js";
import collections from "./ko/collections.js";
import navigation from "./ko/navigation.js";
import profile from "./ko/profile.js";
import notifications from "./ko/notifications.js";

export default {
  ...common,
  ...authentication,
  ...movies,
  ...collections,
  ...navigation,
  ...profile,
  ...notifications,
};
