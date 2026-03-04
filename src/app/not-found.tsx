"use client"

import { Text, Flex } from "@mantine/core";
import { IconMoodSad } from "@tabler/icons-react";
import { usePathname } from "next/navigation";

export default function NotFound() {
  const route = usePathname()

  return (
    <Flex align="center" justify="center" direction="column" w="100vw" h="100vh" c="navy.7">
      <Text ta="center">Oh no! That's a</Text>
      <Text fz="h1" fw="bolder">404</Text>

      <Flex align="center" justify="center" direction="row" gap="xs">
        <Text>The route</Text>
        <Text c="navy.5">"{route.toString()}"</Text>
        <Text>does not exist</Text>
        <IconMoodSad />
      </Flex>
    </Flex >
  );
}
