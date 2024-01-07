import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
} from "@nextui-org/react";

import { deleteRecord } from "@/actions/records";
import { FaTrashCan } from "react-icons/fa6";

type Props = { id: string };

const ConfirmDeleteRecord = ({ id }: Props) => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  return (
    <>
      <Button
        size="sm"
        variant="light"
        fullWidth
        onPress={onOpen}
        className="flex justify-start"
        startContent={<FaTrashCan className="text-danger-500" />}
      >
        Delete
      </Button>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <p>Are you sure about that?</p>
                <p className="text-sm font-light">
                  This action cannot be undone!
                </p>
              </ModalHeader>
              <ModalBody>
                <div className="flex gap-x-5 justify-end">
                  <Button onPress={onClose}>No</Button>
                  <Button
                    color="danger"
                    onPress={() => {
                      deleteRecord(id);
                    }}
                  >
                    Yes
                  </Button>
                </div>
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default ConfirmDeleteRecord;
