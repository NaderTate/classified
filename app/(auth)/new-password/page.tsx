import { NextPage } from "next";

import { NewPasswordForm } from "./_components/NewPasswordForm";

type NewPasswordPageProps = {};

const NewPasswordPage: NextPage = async ({}: NewPasswordPageProps) => {
  return <NewPasswordForm />;
};

export default NewPasswordPage;
