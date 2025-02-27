import { FC, useState } from "react";
import clsx from "clsx";
import {
  defaultMessages,
  defaultUserInfos,
  MessageModel,
  UserInfoModel,
  messageFromClient,
} from "../../helpers";
import CustomisedButton from "../../../app/modules/components/CustomisedButton";
import { CustomIconButton } from "../../../app/modules/components/CustomIconButton";
import { AttachFile, Upload } from "@mui/icons-material";
import { Avatar, Box, Link, Stack, TextField, Typography } from "@mui/material";

type Props = {
  isDrawer?: boolean;
};

const bufferMessages = defaultMessages;

const ChatInner: FC<Props> = ({ isDrawer = false }) => {
  const [chatUpdateFlag, toggleChatUpdateFlat] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const [messages, setMessages] = useState<MessageModel[]>(bufferMessages);
  const [userInfos] = useState<UserInfoModel[]>(defaultUserInfos);

  const sendMessage = () => {
    const newMessage: MessageModel = {
      user: 2,
      type: "out",
      text: message,
      time: "Just now",
    };

    bufferMessages.push(newMessage);
    setMessages(bufferMessages);
    toggleChatUpdateFlat(!chatUpdateFlag);
    setMessage("");
    setTimeout(() => {
      bufferMessages.push(messageFromClient);
      setMessages(() => bufferMessages);
      toggleChatUpdateFlat((flag) => !flag);
    }, 1000);
  };

  const onEnterPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.keyCode === 13 && e.shiftKey === false) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      <Stack
        className="card-body"
        id={
          isDrawer ? "kt_drawer_chat_messenger_body" : "kt_chat_messenger_body"
        }
      >
        <Stack
          className={clsx("scroll-y me-n5 pe-5", {
            "h-300px h-lg-auto": !isDrawer,
          })}
          data-kt-element="messages"
          data-kt-scroll="true"
          data-kt-scroll-activate="{default: false, lg: true}"
          data-kt-scroll-max-height="auto"
          data-kt-scroll-dependencies={
            isDrawer
              ? "#kt_drawer_chat_messenger_header, #kt_drawer_chat_messenger_footer"
              : "#kt_header, #kt_app_header, #kt_app_toolbar, #kt_toolbar, #kt_footer, #kt_app_footer, #kt_chat_messenger_header, #kt_chat_messenger_footer"
          }
          data-kt-scroll-wrappers={
            isDrawer
              ? "#kt_drawer_chat_messenger_body"
              : "#kt_content, #kt_app_content, #kt_chat_messenger_body"
          }
          data-kt-scroll-offset={isDrawer ? "0px" : "5px"}
        >
          {messages.map((message, index) => {
            const userInfo = userInfos[message.user];
            const state = message.type === "in" ? "info" : "primary";
            const templateAttr = {};
            if (message.template) {
              Object.defineProperty(templateAttr, "data-kt-element", {
                value: `template-${message.type}`,
              });
            }
            const contentClass = `${isDrawer ? "" : "d-flex"} justify-content-${
              message.type === "in" ? "start" : "end"
            } mb-10`;
            return (
              <Stack
                key={`message${index}`}
                className={clsx("d-flex", contentClass, "mb-10", {
                  "d-none": message.template,
                })}
                {...templateAttr}
              >
                <Stack
                  className={clsx(
                    "d-flex flex-column align-items",
                    `align-items-${message.type === "in" ? "start" : "end"}`
                  )}
                >
                  <Stack direction={"row"} alignItems={"center"} spacing={1}>
                    {message.type === "in" ? (
                      <>
                        <Stack width={"40px"} height={"40px"}>
                          <Avatar
                            alt="profile picture"
                            src="media/avatars/300-1.jpg"
                            sx={{
                              width: "100%",
                              height: "100%",
                            }}
                          />
                        </Stack>
                        <Stack direction={"row"} spacing={1}>
                          <Link href="#">{userInfo.name}</Link>
                          <Typography variant="body2">
                            {message.time}
                          </Typography>
                        </Stack>
                      </>
                    ) : (
                      <>
                        <Stack direction={"row"} spacing={1}>
                          <Typography variant="body2">
                            {message.time}
                          </Typography>
                          <Link href="#">You</Link>
                        </Stack>
                        <Stack width={"40px"} height={"40px"}>
                          <Avatar
                            alt="profile picture"
                            src="media/avatars/300-6.jpg"
                            sx={{
                              width: "100%",
                              height: "100%",
                            }}
                          />
                        </Stack>
                      </>
                    )}
                  </Stack>

                  <Stack
                    className={clsx(
                      "p-5 rounded",
                      `bg-light-${state}`,
                      "text-gray-900 fw-bold mw-lg-400px",
                      `text-${message.type === "in" ? "start" : "end"}`
                    )}
                    data-kt-element="message-text"
                    dangerouslySetInnerHTML={{ __html: message.text }}
                  ></Stack>
                </Stack>
              </Stack>
            );
          })}
        </Stack>

        <Stack
          className="card-footer pt-4"
          id={
            isDrawer
              ? "kt_drawer_chat_messenger_footer"
              : "kt_chat_messenger_footer"
          }
        >
          <TextField fullWidth placeholder="Type a message"></TextField>

          <Stack direction={"row"} justifyContent={"space-between"}>
            <Stack direction={"row"} spacing={1}>
              <CustomIconButton icon={<AttachFile />} tooltip="Attached" />
              <CustomIconButton icon={<Upload />} tooltip="Upload" />
            </Stack>
            <CustomisedButton
              variant="contained"
              type="button"
              label="Send"
              handleClick={sendMessage}
            />
          </Stack>
        </Stack>
      </Stack>
    </>
  );
};

export { ChatInner };
