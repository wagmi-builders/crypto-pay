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
import { useEffect, useRef, useState } from "react";

import { QRCodeSVG } from "qrcode.react";

export const QRDialog = ({ data }: { data: string }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef();

  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!!data && !open) {
      setOpen(true);
    }
  }, [data]);

  return (
    <>
      <AlertDialog
        isOpen={open}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Scan this QR to claim data on Polygon ID
            </AlertDialogHeader>

            <AlertDialogBody>
              {data ? (
                <QRCodeSVG
                  value={data}
                  style={{
                    width: "100%",
                    aspectRatio: "1 / 1",
                    height: "auto",
                  }}
                />
              ) : null}
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button w="100%" ref={cancelRef} onClick={() => setOpen(false)}>
                Done
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
};
