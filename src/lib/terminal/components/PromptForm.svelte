<script lang="ts">
	let {
		cwd,
		input = $bindable(''),
		inputRef = $bindable<HTMLInputElement | undefined>(),
		onKeydown,
		onSubmit
	}: {
		cwd: string;
		input?: string;
		inputRef?: HTMLInputElement;
		onKeydown: (event: KeyboardEvent) => void;
		onSubmit: () => void;
	} = $props();
</script>

<form class="prompt" onsubmit={(event) => (event.preventDefault(), onSubmit())}>
	<div class="prompt-meta">
		<span class="cwd">{cwd}</span>
	</div>
	<label class="prompt-input">
		<span class="chevron">❯</span>
		<input
			bind:this={inputRef}
			bind:value={input}
			aria-label="terminal command"
			autocomplete="off"
			onkeydown={onKeydown}
		/>
	</label>
</form>
