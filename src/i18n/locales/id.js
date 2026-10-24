import common from "./id/common.js";
import authentication from "./id/authentication.js";
import movies from "./id/movies.js";
import collections from "./id/collections.js";
import navigation from "./id/navigation.js";
import profile from "./id/profile.js";
import notifications from "./id/notifications.js";

export default {
  ...common,
  ...authentication,
  ...movies,
  ...collections,
  ...navigation,
  ...profile,
  ...notifications,
};
