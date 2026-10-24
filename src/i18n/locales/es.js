import common from "./es/common.js";
import authentication from "./es/authentication.js";
import movies from "./es/movies.js";
import collections from "./es/collections.js";
import navigation from "./es/navigation.js";
import profile from "./es/profile.js";
import notifications from "./es/notifications.js";

export default {
  ...common,
  ...authentication,
  ...movies,
  ...collections,
  ...navigation,
  ...profile,
  ...notifications,
};
