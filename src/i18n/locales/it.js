import common from "./it/common.js";
import authentication from "./it/authentication.js";
import movies from "./it/movies.js";
import collections from "./it/collections.js";
import navigation from "./it/navigation.js";
import profile from "./it/profile.js";
import notifications from "./it/notifications.js";

export default {
  ...common,
  ...authentication,
  ...movies,
  ...collections,
  ...navigation,
  ...profile,
  ...notifications,
};
