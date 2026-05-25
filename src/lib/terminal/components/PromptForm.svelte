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

<form
	class="mt-[14px] flex flex-col border-0 bg-[var(--bg)] p-0 text-[15px] max-[760px]:mt-0 max-[760px]:text-[16px]"
	onsubmit={(event) => (event.preventDefault(), onSubmit())}
>
	<div class="leading-[1.45] text-[var(--tx)]">
		<span
			class="text-[var(--cyan)] max-[760px]:text-[0px] max-[760px]:after:text-[16px] max-[760px]:after:content-['~']"
		>
			{cwd}
		</span>
	</div>
	<label class="m-0 flex items-center gap-2 leading-[1.45] max-[760px]:min-h-[44px]">
		<span class="text-[var(--yellow)]">❯</span>
		<input
			bind:this={inputRef}
			bind:value={input}
			aria-label="terminal command"
			autocomplete="off"
			onkeydown={onKeydown}
			class="min-w-[40px] flex-1 border-0 bg-transparent text-[var(--tx)] caret-[var(--yellow)] outline-none max-[760px]:min-h-[44px] max-[760px]:text-[16px]"
		/>
	</label>
</form>
