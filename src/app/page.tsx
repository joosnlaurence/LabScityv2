"use client" // TODO: For useismobile, need to fix so this can be entirely serverside

import Link from "next/link";
import { useIsMobile } from "./use-is-mobile";
import { Button, Image, Box, Flex, Title, Text, Group, Badge, Stack, Card } from "@mantine/core";

const topContent = [
  "Quantum Computing",
  "Neuroscience",
  "Gene Editing",
  "Climate Modeling",
  "Dark Matter",
  "Protein Folding",
  "Superconductors",
  "Astrobiology",
]

const whoFor = [
  "Scientists",
  "Engineers",
  "Researchers"
]

export default function Home() {
  const isMobile = useIsMobile()

  return (
    <Box h="100vh">
      <Flex justify="space-between" align="center" p={16}>

        {/* navbar logo */}
        <Image
          src="/logo-sm.png"
          alt="LabScity logo"
          h={50}
          w="auto"
        />

        {/* login signup buttons */}
        <Flex gap={8}>

          <Link href="/login">
            <Button variant="outline" color="navy.8" radius="xl">
              Sign in
            </Button>
          </Link>

          <Link href="/signup">
            <Button variant="filled" color="navy.8" radius="xl">
              Join now
            </Button>
          </Link>

        </Flex>

      </Flex>

      {/* big title */}
      <Box pt={32} pb={16}>
        <Text size="2rem" ta="center" c="navy.8">
          Share your work,<br />
          <Text span fw="800">loud and clear.</Text>
        </Text>
      </Box>

      {/* navbar logo */}
      <Flex justify="center" pb={32}>
        <Image
          src="/landing.png"
          alt="LabScity logo"
          h={300}
          w="auto"
        />
      </Flex>

      {/* presentation cards */}
      <Flex gap={16} px={8} direction="column">

        {/* explore top content */}
        <Card radius="lg" bg="navy.7" p={32} c="gray.0" flex={1} py={isMobile ? 32 : 64}>
          <Flex direction={isMobile ? "column" : "row"} justify="center" align="center" gap={isMobile ? 0 : 32}>

            {/* title + desc */}
            <Flex align="flex-start" direction="column" ta="left" mb={16} gap={8}>
              <Text size="2rem" fw={800}>Explore Top Content</Text>
              <Text size="sm" fw={400}>Discover what's at the bleeding edge!</Text>
            </Flex>

            {/* top content badges */}
            <Flex wrap="wrap" gap={6} justify="flex-start" w={isMobile ? "100%" : "512"}> {/* NOTE: make sure wrap is on here so badges fit text */}
              {topContent.map((skill: any, i: any) =>
                <Badge key={i} color="gray.0" variant="outline" p={16}>
                  {skill}
                </Badge>
              )}
            </Flex>

          </Flex>
        </Card>

        {/* who is ls for */}
        <Card radius="lg" bg="gray.2" p={32} c="navy.7" flex={1} py={isMobile ? 32 : 64}>
          <Flex direction="column" align="center">

            {/* title + desc */}
            <Text size="2rem" fw={800} mb={16} ta="center">Who is LabScity For?</Text>

            <Stack gap={4} w="320">
              {whoFor.map((subj, i) =>
                <Button key={i} radius="xl" variant="light" c="navy.7">{subj}</Button>
              )}
            </Stack>

          </Flex>
        </Card>

      </Flex >

    </Box >
  );
}
