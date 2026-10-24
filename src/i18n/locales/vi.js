import common from "./vi/common.js";
import authentication from "./vi/authentication.js";
import movies from "./vi/movies.js";
import collections from "./vi/collections.js";
import navigation from "./vi/navigation.js";
import profile from "./vi/profile.js";
import notifications from "./vi/notifications.js";

export default {
  ...common,
  ...authentication,
  ...movies,
  ...collections,
  ...navigation,
  ...profile,
  ...notifications,
};
