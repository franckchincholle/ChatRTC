'use client';

import React, { useEffect, useRef } from 'react';
import { useMessages } from '@/hooks/useMessage';
import { MessageItem } from './MessageItem';
import { Spinner } from '@/components/ui/Spinner';
import { Message } from '@/types/message.types';
import { formatDateSeparator } from '@/utils/formatDate';

/** Regroupe les messages : même auteur + moins de 5 min d'écart = "continued" */
function buildGroups(messages: Message[]) {
  return messages.map((msg, i) => {
    const prev = messages[i - 1];
    const isContinued =
      prev &&
      prev.author.id === msg.author.id &&
      new Date(msg.createdAt).getTime() - new Date(prev.createdAt).getTime() < 5 * 60 * 1000;

    const prevDate = prev ? new Date(prev.createdAt).toDateString() : null;
    const currDate = new Date(msg.createdAt).toDateString();
    const showDaySep = prevDate !== currDate;

    return { msg, isContinued, showDaySep };
  });
}

export function MessageList() {
  const { messages, isLoading } = useMessages();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (isLoading) {
    return (
      <div className="messages-container">
        <Spinner centered />
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="messages-container">
        <div className="messages-start-banner">
          <div className="messages-start-icon">#</div>
          <p className="messages-start-title">
            Début du channel
          </p>
          <p className="messages-start-desc">
            Ce channel est encore vide. Soyez le premier à écrire !
          </p>
        </div>
      </div>
    );
  }

  const groups = buildGroups(messages);

  return (
    <div className="messages-container">
      {groups.map(({ msg, isContinued, showDaySep }) => (
        <React.Fragment key={msg.id}>
          {showDaySep && (
            <div className="day-separator">
              {formatDateSeparator(msg.createdAt)}
            </div>
          )}
          <MessageItem message={msg} continued={isContinued} />
        </React.Fragment>
      ))}
      <div ref={bottomRef} />
    </div>
  );
}