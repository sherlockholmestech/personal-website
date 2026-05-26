<script lang="ts">
	import { resolve } from '$app/paths';
	import { helpfulCommands } from '../help';
	import { formatPostDate } from '../date';
	import type { BlogPostMeta } from '../types';

	let { posts, onCommand }: { posts: BlogPostMeta[]; onCommand: (command: string) => void } =
		$props();
</script>

<div class="welcome-banner">
	<div class="welcome-avatar">
		<img src="/pfp.jpg" alt="Sherlock Holmes profile" class="welcome-avatar-image" />
		<div class="welcome-avatar-caption">天生我才必有用，千金散尽还复来</div>
	</div>

	<div class="welcome-content">
		<pre
			class="welcome-ascii"
			aria-hidden="true">{`███████╗██╗  ██╗███████╗██████╗ ██╗      ██████╗  ██████╗██╗  ██╗
██╔════╝██║  ██║██╔════╝██╔══██╗██║     ██╔═══██╗██╔════╝██║ ██╔╝
███████╗███████║█████╗  ██████╔╝██║     ██║   ██║██║     █████╔╝
╚════██║██╔══██║██╔══╝  ██╔══██╗██║     ██║   ██║██║     ██╔═██╗
███████║██║  ██║███████╗██║  ██║███████╗╚██████╔╝╚██████╗██║  ██╗
╚══════╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝╚══════╝ ╚═════╝  ╚═════╝╚═╝  ╚═╝`}</pre>
		<pre class="welcome-ascii-mobile" aria-hidden="true">{`_____ _           _         _   
|   __| |_ ___ ___| |___ ___| |_ 
|__   |   | -_|  _| | . |  _| '_|
|_____|_|_|___|_| |_|___|___|_,_|`}</pre>

		<div class="welcome-summary" aria-label="site summary">
			<div class="welcome-summary-row">
				<span class="welcome-label">does</span>
				<strong class="welcome-summary-value"
					>Software Enginnering, Capture the Flag (pwn/forensics main), Model United Nations</strong
				>
			</div>
			<div class="welcome-summary-row">
				<span class="welcome-label">writes</span>
				<strong class="welcome-summary-value">CTF writeups, and my thoughts</strong>
			</div>
			<div class="welcome-summary-row">
				<span class="welcome-label">stack</span>
				<strong class="welcome-summary-value"
					>C/C++, Rust, HTML + JavaScript/TypeScript + CSS, Python, Godot Engine</strong
				>
			</div>
			<div class="welcome-summary-row">
				<span class="welcome-label">start</span>
				<strong class="welcome-summary-value">type a command to get started!</strong>
			</div>
		</div>

		<div class="welcome-try">
			<span class="welcome-label">try</span>
			<div class="flex flex-wrap gap-[6px]">
				{#each helpfulCommands as command (command)}
					<button
						type="button"
						class="welcome-command"
						aria-label={`run ${command}`}
						onclick={() => onCommand(command)}
					>
						{command}
					</button>
				{/each}
			</div>
		</div>

		<div class="welcome-latest">
			<span class="welcome-label">latest</span>
			<div class="welcome-latest-list">
				{#each posts.slice(0, 5) as post (post.path)}
					<a href={resolve(`/${post.path}` as `/blog/${string}`)} class="welcome-latest-link">
						<span class="text-[var(--tx-2)]">{formatPostDate(post.date)}</span>
						<strong class="welcome-latest-title">
							{post.title}
						</strong>
					</a>
				{/each}
			</div>
		</div>
	</div>
</div>
