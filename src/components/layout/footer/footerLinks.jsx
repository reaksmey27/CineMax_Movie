import { FaGithub, FaLinkedin, FaTwitter } from "react-icons/fa";

export const EXPLORE_LINKS = [
  { to: "/", label: "Home" },
  { to: "/movies", label: "Movies" },
  { to: "/trending", label: "Trending" },
  { to: "/upcoming", label: "Upcoming" },
  { to: "/watchlist", label: "Watchlist" },
  { to: "/favorites", label: "Favorites" },
  { to: "/notifications", label: "Notifications" },
];

export const GENRE_LINKS = [
  { to: "/movies?genre=28", label: "Action" },
  { to: "/movies?genre=35", label: "Comedy" },
  { to: "/movies?genre=27", label: "Horror" },
  { to: "/movies?genre=878", label: "Sci-Fi" },
  { to: "/movies?genre=16", label: "Animation" },
  { to: "/movies?genre=18", label: "Drama" },
];

export const SOCIAL_LINKS = [
  {
    href: "https://github.com",
    label: "GitHub",
    icon: <FaGithub size={16} aria-hidden="true" />,
  },
  {
    href: "https://linkedin.com",
    label: "LinkedIn",
    icon: <FaLinkedin size={16} aria-hidden="true" />,
  },
  {
    href: "https://twitter.com",
    label: "Twitter",
    icon: <FaTwitter size={16} aria-hidden="true" />,
  },
];
