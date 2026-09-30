# Landing page visual assets

The public landing page now uses final media directly rather than FPO placeholders.

## Active image assets

| File | Ratio | Working size | Used in |
| --- | --- | --- | --- |
| `ai_qualification_interview_001.webp` | 3:2 | 1500×1000 | Qualification stage 1 — establishing interview |
| `ai_qualification_interview_002.webp` | 3:2 | 1500×1000 | Qualification stage 2 — different participant context |
| `ai_qualification_interview_003.webp` | 3:2 | 1500×1000 | Qualification stage 3 — task-relevant context |
| `ai_qualification_interview_004.webp` | 3:2 | 1500×1000 | Qualification stage 4 — resolved / aligned context |
| `owner_campaign_setup_001.webp` | 4:3 | 1400×1050 | Owner section |
| `tester_browser_session_001.webp` | 4:3 | 1400×1050 | Tester section |
| `target_website_pricing_001.webp` | 16:9 | 1600×900 | Chrome Extension / Browser demo |
| `owner_review_feedback_001.webp` | 3:2 | 1500×1000 | Review section |

## Hero media

The Hero no longer uses `hero_test_session_001.webp`.

It now uses:

`apps/web/public/home_video/hero_background_001.webm`

The video is rendered as the full Hero background and follows the existing scroll-linked motion.

## Workflow section

`workflow_observation_001.webp` was part of an earlier image-first Workflow concept and is no longer required.

The current `WorkflowStory` is a scroll-driven seven-step sequence:

1. Create study
2. Claim session
3. Open live site
4. Complete tasks
5. Submit responses
6. Review feedback
7. Approve or reject

It uses animated product UI cards instead of a background editorial image.

## Image direction

- Prefer art-directed editorial imagery over staged corporate stock photography.
- Keep the Future Test Lab 2030 visual language consistent across Owner, Tester, and Review imagery.
- Use believable research / interaction environments rather than cafe or generic coworking scenes.
- Preserve negative space where product UI overlays the photography.
- Avoid readable third-party brands or copyrighted UI.
- Export final stills as optimized WebP files.


## Qualification image sequence

The Qualification scene is designed as a four-stage pinned story on desktop.

- Stage 1 uses `ai_qualification_interview_001.webp`
- Stage 2 uses `ai_qualification_interview_002.webp`
- Stage 3 uses `ai_qualification_interview_003.webp`
- Stage 4 uses `ai_qualification_interview_004.webp`

All four images should share the same editorial research-world direction: similar room family, warm-neutral light, believable HCI/research environment, consistent lens language, and different participant contexts.

Image changes are intentional hard cuts with no dissolve, fade, scale, or image-transition animation.

Only `ai_qualification_interview_001.webp` currently exists in the repository. Until the remaining files are uploaded, the implementation falls back safely to the first image rather than displaying a broken asset.
