"use client";

import { Paper, Stack, Box, Text, TextInput, PasswordInput, Anchor } from "@mantine/core";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { loginSchema, type LoginValues } from "@/lib/validations/auth";
import classes from "./auth-form.module.css";

export function LoginForm() {
  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    mode: "onBlur", // Validate on blur (loses focus) for better UX
    defaultValues: {
      email: "",
      password: "",
    },
  });

  return (
    <Paper className={classes.formContainer}>
      <Stack gap="md" align="center">
        <Box className={classes.logoBox}>
          <Text c="navy.0" size="xl" fw={600}>
            LS
          </Text>
        </Box>
        <div className={classes.fieldContainer}>
          <Text className={classes.label}>Email</Text>
          <Controller
            name="email"
            control={form.control}
            render={({ field, fieldState }) => (
              <TextInput
                {...field}
                placeholder="Email"
                classNames={{ input: classes.input, root: classes.inputRoot }}
                error={fieldState.error?.message}
              />
            )}
          />
        </div>
        <div className={classes.fieldContainer}>
          <Text className={classes.label}>Password</Text>
          <Controller
            name="password"
            control={form.control}
            render={({ field }) => (
              <PasswordInput
                {...field}
                placeholder="Password"
                classNames={{ input: classes.input, root: classes.inputRoot }}
              />
            )}
          />
        </div>
        <Anchor component={Link} href="/forgot-password">
          Forgot Password?
        </Anchor>
        {/* Additional form fields will be added in subsequent steps */}
      </Stack>
    </Paper>
  );
}