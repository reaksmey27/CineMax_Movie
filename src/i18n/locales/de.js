import common from "./de/common.js";
import authentication from "./de/authentication.js";
import movies from "./de/movies.js";
import collections from "./de/collections.js";
import navigation from "./de/navigation.js";
import profile from "./de/profile.js";
import notifications from "./de/notifications.js";

export default {
  ...common,
  ...authentication,
  ...movies,
  ...collections,
  ...navigation,
  ...profile,
  ...notifications,
};
