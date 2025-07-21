"use client";

import React from "react";
import { useFlashMessages } from "./FlashMessageProvider";
import { FlashMessage } from "@/lib/types";

interface FlashMessageItemProps {
  message: FlashMessage;
  onClose: (id: string) => void;
}

function FlashMessageItem({ message, onClose }: FlashMessageItemProps) {
  const getBootstrapClass = (type: FlashMessage["type"]) => {
    switch (type) {
      case "success":
        return "alert-success";
      case "error":
        return "alert-danger";
      case "info":
        return "alert-info";
      default:
        return "alert-info";
    }
  };

  return (
    <div
      className={`alert ${getBootstrapClass(
        message.type
      )} alert-dismissible flash-message`}
      role="alert"
    >
      {message.message}
      <button
        type="button"
        className="btn-close"
        aria-label="Close"
        onClick={() => onClose(message.id)}
      ></button>
    </div>
  );
}

export default function FlashMessages() {
  const { messages, removeMessage } = useFlashMessages();

  if (messages.length === 0) {
    return null;
  }

  return (
    <div className="flash-messages">
      {messages.map((message) => (
        <FlashMessageItem
          key={message.id}
          message={message}
          onClose={removeMessage}
        />
      ))}
    </div>
  );
}
