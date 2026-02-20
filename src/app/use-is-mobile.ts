// ALL THIS DOES IS CHECK WHETHER WE ARE ON MOBILE SCREEN BASED ON MANTINE THEME BREAKPOINTS!

import { useMantineTheme } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";

export function useIsMobile() {
  const theme = useMantineTheme();
  return useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);
}
