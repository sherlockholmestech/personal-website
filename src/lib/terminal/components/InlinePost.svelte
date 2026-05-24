<script lang="ts">
	import type { BlogPost, MdBlock } from '../types';
	import MarkdownBlocks from './MarkdownBlocks.svelte';

	let { post, blocks }: { post: BlogPost; blocks: MdBlock[] } = $props();
</script>

<div class="inline-reader">
	<div class="post-meta">
		<span class="green">opened</span>
		<span>{post.path}.md</span>
	</div>
	<div class="markdown">
		<MarkdownBlocks {blocks} {post} showHeadingMeta />
	</div>
</div>
