import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Button,
} from "@chakra-ui/react";

import { useDisclosure } from "@chakra-ui/react";
import { useEffect, useRef } from "react";

import { QRCodeSVG } from "qrcode.react";

export const QRDialog = ({ data }: { data: string }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef();

  useEffect(() => {
    if (!!data) {
      onOpen();
    } else {
      onClose();
    }
  }, [data]);

  return (
    <>
      <AlertDialog
        isOpen={!!data}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Scan this QR to claim data on Polygon ID
            </AlertDialogHeader>

            <AlertDialogBody>
              {data ? <QRCodeSVG value={data} /> : null}
            </AlertDialogBody>
          </AlertDialogContent>

          <AlertDialogFooter>
            <Button ref={cancelRef} onClick={onClose}>
              Done
            </Button>
          </AlertDialogFooter>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
};
