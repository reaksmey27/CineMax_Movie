import common from "./fr/common.js";
import authentication from "./fr/authentication.js";
import movies from "./fr/movies.js";
import collections from "./fr/collections.js";
import navigation from "./fr/navigation.js";
import profile from "./fr/profile.js";
import notifications from "./fr/notifications.js";

export default {
  ...common,
  ...authentication,
  ...movies,
  ...collections,
  ...navigation,
  ...profile,
  ...notifications,
};
