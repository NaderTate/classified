import { NextPage } from "next";

import { SignUpForm } from "./_components/SignupForm";

type SinupPageProps = {};

const SinupPage: NextPage = async ({}: SinupPageProps) => {
  return <SignUpForm />;
};

export default SinupPage;
