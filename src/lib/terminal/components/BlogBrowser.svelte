<script lang="ts">
	import type { BlogPost } from '../types';
	import { matchingPreview } from '../search';

	let {
		posts,
		results,
		selectedIndex,
		selectedPost,
		query = $bindable(''),
		inputRef = $bindable<HTMLInputElement | undefined>(),
		onQueryInput,
		onKeydown,
		onSelect,
		onOpen
	}: {
		posts: BlogPost[];
		results: BlogPost[];
		selectedIndex: number;
		selectedPost: BlogPost;
		query?: string;
		inputRef?: HTMLInputElement;
		onQueryInput: () => void;
		onKeydown: (event: KeyboardEvent) => void;
		onSelect: (index: number) => void;
		onOpen: (index: number) => void;
	} = $props();
</script>

<div class="fzf-browser">
	<div class="fzf-header">
		<span>~/blog</span>
		<span>{results.length}/{posts.length} posts</span>
	</div>
	<label class="fzf-search">
		<span>query</span>
		<input
			bind:this={inputRef}
			bind:value={query}
			aria-label="search blog posts"
			autocomplete="off"
			oninput={onQueryInput}
			onkeydown={onKeydown}
		/>
	</label>
	<div class="fzf-body">
		<div class="fzf-results">
			{#each results as post, index (post.path)}
				<button
					type="button"
					class:selected={index === selectedIndex}
					class="fzf-row"
					onclick={() => onSelect(index)}
					ondblclick={() => onOpen(index)}
				>
					<span class="fzf-title">{post.title}</span>
					<span class="fzf-meta">
						<span class="fzf-tags">
							{#each post.tags as tag (tag)}
								<span>#{tag}</span>
							{/each}
						</span>
						<span class="fzf-path">{post.path}</span>
					</span>
				</button>
			{/each}
		</div>
		<div class="fzf-preview">
			<div class="fzf-preview-label">preview</div>
			<div class="preview-title">{selectedPost.title}</div>
			<div class="preview-meta">
				{selectedPost.date} · {selectedPost.tags.join(', ')}
			</div>
			<p>{matchingPreview(selectedPost, query)}</p>
			<div class="preview-hint">cat {selectedPost.path}</div>
		</div>
	</div>
</div>
