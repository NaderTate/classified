import Link from "next/link";
import { BsArrowUpCircle } from "react-icons/bs";
function UpArrow() {
  return (
    <Link href="#top" className="fixed bottom-5 right-5">
      <BsArrowUpCircle size={25} />
    </Link>
  );
}

export default UpArrow;
