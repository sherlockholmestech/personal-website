<script lang="ts">
	import type { BlogPost, MdBlock } from '../types';
	import MarkdownBlocks from './MarkdownBlocks.svelte';

	let { post, blocks, onClose }: { post: BlogPost; blocks: MdBlock[]; onClose: () => void } =
		$props();
</script>

<aside class="side-reader pane active">
	<div class="pane-chrome">
		<span class="pane-title">{post.title}</span>
		<button type="button" class="close-pane" aria-label="close side reader" onclick={onClose}>
			×
		</button>
		<span class="pane-title-spacer"></span>
	</div>
	<div class="side-reader-content">
		<header class="side-post-header">
			<h1>{post.title}</h1>
			<div class="post-meta">
				<span>{post.date}</span>
				{#each post.tags as tag (tag)}
					<span>#{tag}</span>
				{/each}
			</div>
		</header>
		<div class="markdown">
			<MarkdownBlocks {blocks} />
		</div>
	</div>
</aside>
