import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { isAxiosError } from "axios";
import { Link, useNavigate } from "react-router-dom";
import { Alert, Button, Center, Container, Paper, PasswordInput, Stack, Text, TextInput, Title } from "@mantine/core";
import { useAuth } from "../../context/useAuth";
import { useLanguage } from "../../context/useLanguage.ts";
import { LogoMark } from "../../components/Brand.tsx";
import { createLoginSchema, type LoginFormData } from "../../api/Auth/schema.ts";

export default function Login() {
  const { login } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const {
    handleSubmit,
    register,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(createLoginSchema(t.validation)),
    mode: "onTouched",
  });

  async function handleLogin(values: LoginFormData) {
    try {
      setError(null);
      await login(values);
      navigate("/");
    } catch (err) {
      if (isAxiosError(err)) {
        setError(err.response?.data?.message || t.errors.somethingWentWrong);
      } else if (err instanceof Error && err.message) {
        setError(err.message);
      } else {
        setError(t.errors.somethingWentWrong);
      }
    }
  }

  return (
    <Container size="xs" py="xl">
      <Paper radius="lg" p="xl">
        <Center mb="md">
          <LogoMark size={48} />
        </Center>
        {/* Page heading: h1, kept at the h2 visual size. */}
        <Title order={1} fz="var(--mantine-h2-font-size)" lh="var(--mantine-h2-line-height)" ta="center" mb="md">
          {t.auth.welcomeBack}
        </Title>

        {error && (
          <Alert color="red" mb="md">
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit(handleLogin)}>
          <Stack>
            <TextInput
              label={t.auth.email}
              placeholder={t.auth.emailPlaceholder}
              type="email"
              {...register("email")}
              error={errors.email?.message}
            />
            <PasswordInput
              label={t.auth.password}
              placeholder={t.auth.passwordPlaceholder}
              {...register("password")}
              error={errors.password?.message}
            />
            <Button type="submit" loading={isSubmitting} fullWidth>
              {t.common.login}
            </Button>
            <Text ta="center" size="sm">
              {t.auth.noAccount} <Link to="/signup">{t.common.signup}</Link>
            </Text>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
}
