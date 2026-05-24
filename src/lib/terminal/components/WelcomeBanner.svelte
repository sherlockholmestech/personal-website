<script lang="ts">
	import { resolve } from '$app/paths';
	import { helpfulCommands } from '../help';
	import { formatPostDate } from '../date';
	import type { BlogPost } from '../types';

	let { posts }: { posts: BlogPost[] } = $props();
</script>

<div
	class="my-[8px] mb-[18px] grid grid-cols-[minmax(180px,0.24fr)_minmax(0,1fr)] justify-items-start gap-[18px] border-b border-[var(--border)] py-[8px] pb-[16px] max-[760px]:mb-[12px] max-[760px]:grid-cols-1 max-[760px]:gap-[10px] max-[760px]:pb-[12px]"
>
	<div
		class="relative block h-full w-full min-w-0 self-stretch max-[760px]:aspect-square max-[760px]:max-w-[180px]"
	>
		<img
			src="/pfp.jpg"
			alt="Sherlock Holmes profile"
			class="h-full w-full rounded-[5px] border-2 border-[var(--yellow)] object-cover"
		/>
		<div
			class="absolute inset-x-2 bottom-2 bg-[color-mix(in_srgb,_var(--bg)_78%,_transparent)] px-[6px] py-[4px] text-left text-[12px] leading-[1.45] text-[var(--tx)]"
		>
			天生我才必有用，千金散尽还复来
		</div>
	</div>

	<div class="w-full min-w-0 overflow-x-auto text-left">
		<pre
			class="mb-[10px] text-[12px] leading-[1.1] whitespace-pre text-[var(--cyan)] max-[760px]:max-w-full max-[760px]:overflow-hidden max-[760px]:text-[0px] max-[760px]:whitespace-pre-wrap max-[760px]:after:text-[16px] max-[760px]:after:leading-[1.4] max-[760px]:after:content-['sherlock@website:~']"
			aria-hidden="true">{`███████╗██╗  ██╗███████╗██████╗ ██╗      ██████╗  ██████╗██╗  ██╗
██╔════╝██║  ██║██╔════╝██╔══██╗██║     ██╔═══██╗██╔════╝██║ ██╔╝
███████╗███████║█████╗  ██████╔╝██║     ██║   ██║██║     █████╔╝
╚════██║██╔══██║██╔══╝  ██╔══██╗██║     ██║   ██║██║     ██╔═██╗
███████║██║  ██║███████╗██║  ██║███████╗╚██████╔╝╚██████╗██║  ██╗
╚══════╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝╚══════╝ ╚═════╝  ╚═════╝╚═╝  ╚═╝`}</pre>

		<div class="mb-[12px] grid gap-[3px] max-[760px]:gap-[6px]" aria-label="site summary">
			<div
				class="grid grid-cols-[8ch_minmax(0,1fr)] gap-[10px] leading-[1.45] max-[760px]:grid-cols-1 max-[760px]:gap-[1px]"
			>
				<span class="font-bold text-[var(--yellow)]">does</span>
				<strong class="min-w-0 font-normal text-[var(--tx)]"
					>Software Enginnering, Capture the Flag (pwn/forensics main), Model United Nations</strong
				>
			</div>
			<div
				class="grid grid-cols-[8ch_minmax(0,1fr)] gap-[10px] leading-[1.45] max-[760px]:grid-cols-1 max-[760px]:gap-[1px]"
			>
				<span class="font-bold text-[var(--yellow)]">writes</span>
				<strong class="min-w-0 font-normal text-[var(--tx)]">CTF writeups, and my thoughts</strong>
			</div>
			<div
				class="grid grid-cols-[8ch_minmax(0,1fr)] gap-[10px] leading-[1.45] max-[760px]:grid-cols-1 max-[760px]:gap-[1px]"
			>
				<span class="font-bold text-[var(--yellow)]">stack</span>
				<strong class="min-w-0 font-normal text-[var(--tx)]"
					>C/C++, Rust, HTML + JavaScript/TypeScript + CSS, Python, Godot Engine</strong
				>
			</div>
			<div
				class="grid grid-cols-[8ch_minmax(0,1fr)] gap-[10px] leading-[1.45] max-[760px]:grid-cols-1 max-[760px]:gap-[1px]"
			>
				<span class="font-bold text-[var(--yellow)]">start</span>
				<strong class="min-w-0 font-normal text-[var(--tx)]">type a command to get started!</strong>
			</div>
		</div>

		<div
			class="grid grid-cols-[8ch_minmax(0,1fr)] items-start gap-[10px] max-[760px]:grid-cols-1 max-[760px]:gap-[6px]"
		>
			<span class="font-bold text-[var(--yellow)]">try</span>
			<div class="flex flex-wrap gap-[6px]">
				{#each helpfulCommands as command (command)}
					<code class="bg-[var(--yellow)] px-[5px] py-[1px] text-[13px] text-[var(--bg)]">
						{command}
					</code>
				{/each}
			</div>
		</div>

		<div
			class="mt-[10px] grid grid-cols-[8ch_minmax(0,1fr)] items-start gap-[10px] max-[760px]:grid-cols-1 max-[760px]:gap-[6px]"
		>
			<span class="font-bold text-[var(--yellow)]">latest</span>
			<div class="grid gap-[4px] max-[760px]:grid-cols-1">
				{#each posts.slice(0, 5) as post (post.path)}
					<a
						href={resolve(`/${post.path}` as `/blog/${string}`)}
						class="grid grid-cols-[10ch_minmax(0,1fr)] gap-[10px] text-[var(--tx)] no-underline hover:text-[var(--yellow)] max-[760px]:grid-cols-1 max-[760px]:gap-0 max-[760px]:py-[2px]"
					>
						<span class="text-[var(--tx-2)]">{formatPostDate(post.date)}</span>
						<strong
							class="min-w-0 overflow-hidden font-normal text-ellipsis whitespace-nowrap max-[760px]:whitespace-normal"
						>
							{post.title}
						</strong>
					</a>
				{/each}
			</div>
		</div>
	</div>
</div>
