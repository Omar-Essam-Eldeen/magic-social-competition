// Phase 4: auth schemas are factories over the i18n validation messages.
// Same validation rules as before — only the messages come from `m`.
// Call sites (updated by the page agents):
//   const { t } = useLanguage();
//   useForm<RegisterFormData>({ resolver: zodResolver(createRegisterSchema(t.validation)) })
//   useForm<LoginFormData>({ resolver: zodResolver(createLoginSchema(t.validation)) })
//   useForm<ChangePasswordFormData>({ resolver: zodResolver(createChangePasswordSchema(t.validation)) })
import { differenceInYears } from "date-fns";
import z from "zod";
import type { Dict } from "../../i18n/dictionary.ts";

export function createRegisterSchema(m: Dict["validation"]) {
  return z
    .object({
      name: z.string().trim().min(2, m.nameRequired).max(20, m.nameMax),
      username: z.string().trim().min(2, m.usernameRequired).max(20, m.usernameMax),
      email: z.string().trim().min(2, m.emailRequired).email(m.invalidEmail),
      dateOfBirth: z
        .string()
        .min(1, m.dobRequired)
        .regex(/^\d{4}-\d{2}-\d{2}$/, m.dobFormat)
        .refine((value) => {
          const [y, mo, d] = value.split("-").map(Number);
          const date = new Date(y, mo - 1, d);
          return date.getFullYear() === y && date.getMonth() === mo - 1 && date.getDate() === d;
        }, m.invalidDate)
        .refine((value) => new Date(value) <= new Date(), m.dobFuture)
        .refine((value) => differenceInYears(new Date(), new Date(value)) >= 16, m.dobMinAge),
      gender: z.enum(["male", "female"]),
      password: z
        .string()
        .min(1, m.passwordRequired)
        .regex(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
          m.passwordWeak,
        ),
      rePassword: z.string().min(1, m.rePasswordRequired),
    })
    .refine((formvalues) => formvalues.rePassword === formvalues.password, {
      path: ["rePassword"],
      message: m.passwordsMismatch,
    });
}

export function createLoginSchema(m: Dict["validation"]) {
  return z.object({
    email: z.string().trim().min(2, m.emailRequired).email(m.invalidEmail),
    password: z.string().min(2, m.passwordRequired),
  });
}

export function createChangePasswordSchema(m: Dict["validation"]) {
  return z
    .object({
      password: z.string().min(1, m.currentPasswordRequired),
      newPassword: z
        .string()
        .min(1, m.newPasswordRequired)
        .regex(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
          m.passwordWeak,
        ),
      rePassword: z.string().min(1, m.confirmPasswordRequired),
    })
    .refine((formValues) => formValues.newPassword === formValues.rePassword, {
      path: ["rePassword"],
      message: m.newPasswordsMismatch,
    });
}

export type RegisterFormData = z.infer<ReturnType<typeof createRegisterSchema>>;

export type LoginFormData = z.infer<ReturnType<typeof createLoginSchema>>;

export type ChangePasswordFormData = z.infer<ReturnType<typeof createChangePasswordSchema>>;
