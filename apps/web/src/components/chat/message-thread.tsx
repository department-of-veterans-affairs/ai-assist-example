import type { Message } from "@ai-sdk/react";
import { Alert } from "@department-of-veterans-affairs/clinical-design-system";
import { useEffect, useRef } from "react";
import { MessageItem } from "./message-item";

interface MessageThreadProps {
	messages: Message[];
	isLoading: boolean;
	error?: Error;
}

export function MessageThread({
	messages,
	isLoading,
	error,
}: MessageThreadProps) {
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const prevMessagesLength = useRef(messages.length);

	useEffect(() => {
		if (messages.length !== prevMessagesLength.current) {
			messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
			prevMessagesLength.current = messages.length;
		}
	});

	if (error) {
		return (
			<div className="flex-1 overflow-y-auto">
				<div className="max-width-desktop margin-x-auto padding-3">
					<Alert className="margin-bottom-3" type="error">
						An error occurred: {error.message}
					</Alert>
				</div>
			</div>
		);
	}

	return (
		<div className="flex-1 overflow-y-auto">
			<div className="max-width-desktop margin-x-auto padding-3">
				{messages.length === 0 ? (
					<div className="padding-8 text-center">
						<p className="font-body-lg text-base-dark">
							Start a conversation by typing a message below.
						</p>
					</div>
				) : (
					<div className="display-flex flex-column flex-gap-3">
						{messages.map((message) => (
							<MessageItem key={message.id} message={message} />
						))}
						{isLoading && (
							<div className="display-flex flex-justify-start">
								<div className="padding-3 border-base-light border-width-1 bg-white">
									<span className="text-base-dark">AI is thinking...</span>
								</div>
							</div>
						)}
					</div>
				)}
				<div ref={messagesEndRef} />
			</div>
		</div>
	);
}
