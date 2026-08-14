package com.notextra.generation.internal;

import com.notextra.generation.api.GenerationJobStatus;
import com.notextra.generation.api.GenerationJobStatusChanged;
import java.util.UUID;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

@Component
class GenerationJobWsNotifier {

	private final SimpMessagingTemplate messagingTemplate;

	GenerationJobWsNotifier(SimpMessagingTemplate messagingTemplate) {
		this.messagingTemplate = messagingTemplate;
	}

	@EventListener
	void onStatusChanged(GenerationJobStatusChanged event) {
		messagingTemplate.convertAndSendToUser(
			event.ownerId().toString(),
			"/queue/generation-jobs",
			new JobStatusMessage(
				event.jobId(),
				event.status(),
				event.resultNoteId(),
				event.resultMediaId(),
				event.errorMessage()
			)
		);
	}

	record JobStatusMessage(
		UUID jobId,
		GenerationJobStatus status,
		UUID resultNoteId,
		UUID resultMediaId,
		String errorMessage
	) {
	}
}
