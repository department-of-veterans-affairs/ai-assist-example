import { Button } from "@department-of-veterans-affairs/clinical-design-system";
import type { ChangeEvent, FormEvent, KeyboardEvent } from "react";
import { useEffect, useRef } from "react";

interface ChatInputProps {
	input: string;
	handleInputChange: (
		e: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLTextAreaElement>,
	) => void;
	handleSubmit: (e: FormEvent<HTMLFormElement>) => void;
	isLoading: boolean;
}

export function ChatInput({
	input,
	handleInputChange,
	handleSubmit,
	isLoading,
}: ChatInputProps) {
	const textareaRef = useRef<HTMLTextAreaElement>(null);

	// Auto-resize textarea based on content
	const handleTextareaChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
		handleInputChange(e);

		// Resize textarea after content changes
		const textarea = e.target;
		textarea.style.height = "44px"; // Start with minimum height
		const newHeight = Math.min(textarea.scrollHeight, 200);
		textarea.style.height = `${newHeight}px`;
	};

	const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
		// Submit on Enter (without Shift)
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			if (input.trim() && !isLoading) {
				// Create a synthetic form event
				const form = e.currentTarget.closest("form");
				if (form) {
					form.requestSubmit();
				}
			}
		}
	};

	return (
		<div className="padding-3 border-base-lighter border-top-1px bg-white">
			<form className="max-width-desktop margin-x-auto" onSubmit={handleSubmit}>
				<div className="display-flex radius-md flex-align-center border-1px border-base-light">
					<textarea
						aria-describedby="chat-input-instructions"
						aria-label="Chat message input"
						className="padding-2 flex-1 border-0 bg-transparent font-body-md outline-0"
						disabled={isLoading}
						id="chat-input"
						name="message"
						onChange={handleTextareaChange}
						onKeyDown={handleKeyDown}
						placeholder="Type a message..."
						ref={textareaRef}
						rows={1}
						value={input}
						style={{ resize: "none", minHeight: "44px" }}
					/>
					<Button
						aria-label={isLoading ? "Sending message" : "Send message"}
						className="radius-0 border-0 border-base-light border-left-1px"
						disabled={!input.trim() || isLoading}
						type="submit"
					>
						{isLoading ? "Sending..." : "Send"}
					</Button>
				</div>
				<span
					aria-live="polite"
					className="display-block margin-top-1 font-body-xs text-base"
					id="chat-input-instructions"
				>
					{isLoading
						? "AI is responding..."
						: "Press Enter to send, Shift+Enter for new line"}
				</span>
			</form>
		</div>
	);
}
