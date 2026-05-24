<script lang="ts">
	import { resolve } from '$app/paths';
	import { helpfulCommands } from '../help';
	import { formatPostDate } from '../date';
	import type { BlogPost } from '../types';

	let { posts }: { posts: BlogPost[] } = $props();
</script>

<div class="welcome-banner">
	<div class="banner-media">
		<img src="/pfp.jpg" alt="Sherlock Holmes profile" />
		<div class="banner-quote">天生我才必有用，千金散尽还复来</div>
	</div>

	<div class="banner-copy">
		<pre
			class="banner-ascii"
			aria-hidden="true">{`███████╗██╗  ██╗███████╗██████╗ ██╗      ██████╗  ██████╗██╗  ██╗
██╔════╝██║  ██║██╔════╝██╔══██╗██║     ██╔═══██╗██╔════╝██║ ██╔╝
███████╗███████║█████╗  ██████╔╝██║     ██║   ██║██║     █████╔╝
╚════██║██╔══██║██╔══╝  ██╔══██╗██║     ██║   ██║██║     ██╔═██╗
███████║██║  ██║███████╗██║  ██║███████╗╚██████╔╝╚██████╗██║  ██╗
╚══════╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝╚══════╝ ╚═════╝  ╚═════╝╚═╝  ╚═╝`}</pre>

		<div class="fetch-lines" aria-label="site summary">
			<div>
				<span>does</span><strong
					>Software Enginnering, Capture the Flag (pwn/forensics main), Model United Nations</strong
				>
			</div>
			<div><span>writes</span><strong>CTF writeups, and my thoughts</strong></div>
			<div>
				<span>stack</span><strong
					>C/C++, Rust, HTML + JavaScript/TypeScript + CSS, Python, Godot Engine</strong
				>
			</div>
			<div><span>start</span><strong>type a command to get started!</strong></div>
		</div>

		<div class="banner-help">
			<span>try</span>
			<div>
				{#each helpfulCommands as command (command)}
					<code>{command}</code>
				{/each}
			</div>
		</div>

		<div class="banner-posts">
			<span>latest</span>
			<div>
				{#each posts.slice(0, 5) as post (post.path)}
					<a href={resolve(`/${post.path}` as `/blog/${string}`)}>
						<span>{formatPostDate(post.date)}</span>
						<strong>{post.title}</strong>
					</a>
				{/each}
			</div>
		</div>
	</div>
</div>
