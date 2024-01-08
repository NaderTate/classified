import * as z from "zod";

export const NewPasswordSchema = z.object({
  password: z.string().min(6, {
    message: "Minimum of 6 characters required",
  }),
});

export const ResetSchema = z.object({
  email: z.string().email({
    message: "Email is required",
  }),
});

export const LoginSchema = z.object({
  email: z.string().email({
    message: "Email is required",
  }),
  password: z.string().min(1, {
    message: "Password is required",
  }),
  code: z.optional(z.string()),
});

export const RegisterSchema = z.object({
  name: z.string().min(1, {
    message: "Name is required",
  }),
  email: z.string().email({
    message: "Email is required",
  }),
  password: z.string().min(6, {
    message: "Minimum 6 characters required",
  }),
});

export const SettingsSchema = z
  .object({
    name: z.optional(z.string()),
    isTwoFactorEnabled: z.optional(z.boolean()),
    email: z.optional(z.string().email()),
    password: z
      .union([
        z.string().min(6, "password needs to be at least 6 characters"),
        z.string().length(0),
      ])
      .optional()
      .transform((e) => (e === "" ? undefined : e)),

    newPassword: z
      .union([
        z.string().min(6, "password needs to be at least 6 characters"),
        z.string().length(0),
      ])
      .optional()
      .transform((e) => (e === "" ? undefined : e)),
  })
  .refine(
    (data) => {
      if (data.password && !data.newPassword) {
        return false;
      }

      return true;
    },
    {
      message: "New password is required!",
      path: ["newPassword"],
    }
  )
  .refine(
    (data) => {
      if (data.newPassword && !data.password) {
        return false;
      }

      return true;
    },
    {
      message: "Password is required!",
      path: ["password"],
    }
  );
export const RecordSchema = z.object({
  site: z.string().optional(),
  icon: z.string().optional(),
  username: z.string().optional(),
  email: z
    .string()
    .email({
      message: "Email is required",
    })
    .optional(),
  password: z.string().optional(),
});
