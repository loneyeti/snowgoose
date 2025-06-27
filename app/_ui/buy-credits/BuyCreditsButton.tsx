"use client";

import React, { useState } from "react";
import { Button } from "../button";
import BuyCreditsModal from "./BuyCreditsModal";

interface BuyCreditsButtonProps extends React.ComponentProps<typeof Button> {}

export default function BuyCreditsButton({
  children,
  ...props
}: BuyCreditsButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <>
      <Button onClick={openModal} {...props}>
        {children || "Buy More Credits"}
      </Button>
      <BuyCreditsModal isOpen={isModalOpen} onClose={closeModal} />
    </>
  );
}
