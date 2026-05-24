<script lang="ts">
	import { helpfulCommands } from '../help';
</script>

<div class="welcome-banner">
	<div class="banner-media">
		<img src="/pfp.jpg" alt="Sherlock Holmes profile" />
		<div class="banner-quote">天生我才必有用，千金散尽还复来</div>
	</div>

	<div class="banner-copy">
		<pre
			class="banner-ascii"
			aria-hidden="true">{`███████╗██╗  ██╗███████╗██████╗ ██╗      ██████╗  ██████╗██╗  ██╗    ██╗  ██╗ ██████╗ ██╗     ███╗   ███╗███████╗███████╗
██╔════╝██║  ██║██╔════╝██╔══██╗██║     ██╔═══██╗██╔════╝██║ ██╔╝    ██║  ██║██╔═══██╗██║     ████╗ ████║██╔════╝██╔════╝
███████╗███████║█████╗  ██████╔╝██║     ██║   ██║██║     █████╔╝     ███████║██║   ██║██║     ██╔████╔██║█████╗  ███████╗
╚════██║██╔══██║██╔══╝  ██╔══██╗██║     ██║   ██║██║     ██╔═██╗     ██╔══██║██║   ██║██║     ██║╚██╔╝██║██╔══╝  ╚════██║
███████║██║  ██║███████╗██║  ██║███████╗╚██████╔╝╚██████╗██║  ██╗    ██║  ██║╚██████╔╝███████╗██║ ╚═╝ ██║███████╗███████║
╚══════╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝╚══════╝ ╚═════╝  ╚═════╝╚═╝  ╚═╝    ╚═╝  ╚═╝ ╚═════╝ ╚══════╝╚═╝     ╚═╝╚══════╝╚══════╝`}</pre>

		<div class="fetch-lines" aria-label="site summary">
			<div>
				<span>does</span><strong
					>Software Enginnering, Capture the Flag (pwn/forensics main), Model United Nations</strong
				>
			</div>
			<div><span>writes</span><strong>CTF writeups, and my thoughts</strong></div>
			<div>
				<span>stack</span><strong>C/C++, Rust, HTML + JavaScript/TypeScript + CSS, Python</strong>
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
	</div>
</div>
