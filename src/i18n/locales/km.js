import common from "./km/common.js";
import authentication from "./km/authentication.js";
import movies from "./km/movies.js";
import collections from "./km/collections.js";
import navigation from "./km/navigation.js";
import profile from "./km/profile.js";
import notifications from "./km/notifications.js";

export default {
  ...common,
  ...authentication,
  ...movies,
  ...collections,
  ...navigation,
  ...profile,
  ...notifications,
};
