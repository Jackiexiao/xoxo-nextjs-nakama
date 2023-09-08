export type SiteConfig = typeof siteConfig

export const siteConfig = {
  name: "TicTacToe",
  description:
    "TicTacToe Game, built with Nextjs (Radix UI, Tailwind CSS) + Nakama",
  mainNav: [
    {
      title: "Home",
      href: "/",
    },
    {
      title: "Game",
      href: "/tictactoe",
    },
  ],
  links: {
    twitter: "https://twitter.com/realjackiexiao",
    github: "https://github.com/Jackiexiao/xoxo-nextjs-nakama",
    docs: "https://ui.shadcn.com",
  },
}
