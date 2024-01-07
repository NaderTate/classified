import { NextPage } from "next";
import { LoginForm } from "./_components/LoginForm";

type LoginPageProps = {};

const LoginPage: NextPage = async ({}: LoginPageProps) => {
  return <LoginForm />;
};

export default LoginPage;
