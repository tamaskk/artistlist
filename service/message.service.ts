import { Message } from "@/types/message.type";

const sendMessage = async (message: Partial<Message>) => {
  try {
    const response = await fetch("/api/messages/send-message", {
      method: "POST",
      body: JSON.stringify(message),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Sikertelen üzenet küldés");
    }

    return data;
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
};

const getMessages = async (artistId: string) => {
  try {
    const response = await fetch(
      `/api/messages/get-messages?artistId=${artistId}`
    );
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Sikertelen üzenetek lekérése");
    }

    return data;
  } catch (error) {
    console.error("Error getting messages:", error);
    throw error;
  }
};

const readMessage = async (messageId: string) => {
  try {
    const response = await fetch(`/api/messages/read-message?messageId=${messageId}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Sikertelen üzenetek olvasása");
    }

    return data;
  } catch (error) {
    console.error("Error reading message:", error);
    throw error;
  }
};

export { sendMessage, getMessages, readMessage };
