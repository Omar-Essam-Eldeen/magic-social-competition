import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import {
  Alert,
  Button,
  Center,
  Container,
  Group,
  Paper,
  PasswordInput,
  Radio,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { isAxiosError } from "axios";
import { useAuth } from "../../context/useAuth.ts";
import { useLanguage } from "../../context/useLanguage.ts";
import { LogoMark } from "../../components/Brand.tsx";
import { createRegisterSchema, type RegisterFormData } from "../../api/Auth/schema.ts";

export default function Signup() {
  const { signup } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const {
    handleSubmit,
    register,
    control,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    defaultValues: { gender: "male" },
    resolver: zodResolver(createRegisterSchema(t.validation)),
    mode: "onTouched",
  });

  async function handleRegister(values: RegisterFormData) {
    try {
      setError(null);
      await signup(values);
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
          {t.auth.createAccount}
        </Title>

        {error && (
          <Alert color="red" mb="md">
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit(handleRegister)}>
          <Stack>
            <TextInput
              label={t.auth.name}
              placeholder={t.auth.namePlaceholder}
              {...register("name")}
              error={errors.name?.message}
            />
            <TextInput
              label={t.auth.username}
              placeholder={t.auth.usernamePlaceholder}
              {...register("username")}
              error={errors.username?.message}
            />
            <TextInput
              label={t.auth.email}
              placeholder={t.auth.emailPlaceholder}
              type="email"
              {...register("email")}
              error={errors.email?.message}
            />
            <TextInput
              label={t.auth.dateOfBirth}
              type="date"
              {...register("dateOfBirth")}
              error={errors.dateOfBirth?.message}
            />
            <Controller
              name="gender"
              control={control}
              render={({ field }) => (
                <Radio.Group
                  label={t.auth.gender}
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.gender?.message}>
                  <Group mt="xs">
                    <Radio value="male" label={t.auth.male} />
                    <Radio value="female" label={t.auth.female} />
                  </Group>
                </Radio.Group>
              )}
            />
            <PasswordInput
              label={t.auth.password}
              placeholder={t.auth.passwordPlaceholder}
              {...register("password")}
              error={errors.password?.message}
            />
            <PasswordInput
              label={t.auth.rePassword}
              placeholder={t.auth.rePasswordPlaceholder}
              {...register("rePassword")}
              error={errors.rePassword?.message}
            />
            <Button type="submit" loading={isSubmitting} fullWidth>
              {t.common.signup}
            </Button>
            <Text ta="center" size="sm">
              {t.auth.haveAccount} <Link to="/login">{t.common.login}</Link>
            </Text>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
}
