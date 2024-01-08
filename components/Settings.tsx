"use client";

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
  Switch,
  Input,
  cn,
  Divider,
} from "@nextui-org/react";
import { z } from "zod";
import { useSession } from "next-auth/react";
import { useState, useTransition } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ErrorMessage } from "@hookform/error-message";

import { FormError } from "./FormError";
import { FormSuccess } from "./FormSuccess";

import { SettingsSchema } from "@/schemas";
import { updateSettings } from "@/actions/updateSettings";

export default function Settings() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const session = useSession();
  const user = session?.data?.user;
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();
  const { update } = useSession();
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<z.infer<typeof SettingsSchema>>({
    resolver: zodResolver(SettingsSchema),
    defaultValues: {
      password: undefined,
      newPassword: undefined,
      name: user?.name || undefined,
      email: user?.email || undefined,
      isTwoFactorEnabled: user?.isTwoFactorEnabled,
    },
  });

  const onSubmit = (values: z.infer<typeof SettingsSchema>) => {
    startTransition(() => {
      updateSettings(values)
        .then((data) => {
          if (data.error) {
            setError(data.error);
          }
          if (data.success) {
            update();
            // setSuccess(data.success);
            onOpenChange();
          }
        })
        .catch(() => setError("Something went wrong!"));
    });
  };
  return (
    <>
      <button className="w-full text-left" onClick={onOpen}>
        Settings
      </button>
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        classNames={{
          wrapper: "z-[9999999999]",
          backdrop: "z-[9999999999]",
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Settings
              </ModalHeader>
              <form onSubmit={handleSubmit(onSubmit)}>
                <ModalBody>
                  {!user?.isOAuth && (
                    <>
                      <Input
                        variant="bordered"
                        defaultValue={user?.name || ""}
                        label="name"
                        {...register("name")}
                      />
                      <ErrorMessage
                        errors={errors}
                        name="name"
                        render={({ message }) => (
                          <p className="text-red-500 text-sm text-left w-full">
                            {message}
                          </p>
                        )}
                      />
                      <Input
                        variant="bordered"
                        defaultValue={user?.email || ""}
                        label="email"
                        {...register("email")}
                      />
                      <ErrorMessage
                        errors={errors}
                        name="email"
                        render={({ message }) => (
                          <p className="text-red-500 text-sm text-left w-full">
                            {message}
                          </p>
                        )}
                      />
                      <Divider />
                      <h1>Update your password:</h1>
                      <Input
                        defaultValue={undefined}
                        variant="bordered"
                        label="old password"
                        {...register("password")}
                      />
                      <ErrorMessage
                        errors={errors}
                        name="password"
                        render={({ message }) => (
                          <p className="text-red-500 text-sm text-left w-full">
                            {message}
                          </p>
                        )}
                      />
                      <Input
                        defaultValue={undefined}
                        variant="bordered"
                        label="new password"
                        {...register("newPassword")}
                      />
                      <ErrorMessage
                        errors={errors}
                        name="newPassword"
                        render={({ message }) => (
                          <p className="text-red-500 text-sm text-left w-full">
                            {message}
                          </p>
                        )}
                      />
                    </>
                  )}
                  <Controller
                    name="isTwoFactorEnabled"
                    control={control}
                    render={({ field: { onChange, value } }) => (
                      <Switch
                        classNames={{
                          base: cn(
                            "inline-flex flex-row-reverse w-full max-w-md bg-content1 hover:bg-content2 items-center",
                            "justify-between cursor-pointer rounded-lg gap-2 p-4 border-2 border-transparent",
                            "data-[selected=true]:border-primary"
                          ),
                          wrapper: "p-0 h-4 overflow-visible",
                          thumb: cn(
                            "w-6 h-6 border-2 shadow-lg",
                            "group-data-[hover=true]:border-primary",
                            //selected
                            "group-data-[selected=true]:ml-6",
                            // pressed
                            "group-data-[pressed=true]:w-7",
                            "group-data-[selected]:group-data-[pressed]:ml-4"
                          ),
                        }}
                        isSelected={value}
                        onChange={onChange}
                      >
                        <div className="flex flex-col gap-1">
                          <p className="text-medium">2-factor Autentication</p>
                          <p className="text-tiny text-default-400">
                            Requires a verification code every time you sign in.
                          </p>
                        </div>
                      </Switch>
                    )}
                  />
                </ModalBody>

                <FormSuccess message={success} />
                <FormError error={error} />
                <ModalFooter>
                  <Button color="danger" variant="light" onPress={onClose}>
                    Cancel
                  </Button>
                  <Button
                    isLoading={isPending}
                    isDisabled={isPending}
                    color="primary"
                    type="submit"
                  >
                    Save
                  </Button>
                </ModalFooter>
              </form>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
