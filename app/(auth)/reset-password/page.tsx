import { NextPage } from "next";

import { PasswordResetForm } from "./_components/PasswordResetForm";

type ResetPasswordPageProps = {};

const ResetPasswordPage: NextPage = async ({}: ResetPasswordPageProps) => {
  return <PasswordResetForm />;
};

export default ResetPasswordPage;
