# LuxLeaf faithful fork of pmndrs/react-three-fiber

This branch restores the original repository as the active project, pinned at `d74622ea8ed717f7212d7e19d65ff3e325508389`. It replaces the earlier custom wrapper/workbench layout on this branch. The previous releases remain available in Git history and release tags.

The original implementation, examples, configuration, documentation and license declarations are retained. Original authorship is not transferred to Michelle L. Wu. Existing open-source licenses continue to apply. LuxLeaf-specific release administration is kept under `.luxleaf/`; it is not a replacement engine or a claim that the upstream code was independently authored.

## Source identity

Run `node .luxleaf/verify-source.mjs`. Every original file is checked against its pinned SHA-256. Original GitHub workflows are preserved under `.luxleaf/upstream-workflows/` so their deployment/publishing jobs cannot inadvertently act on the original developers' infrastructure. This is a relocation only; their contents remain unchanged.

## Acceptance

Source identity, successful builds, original test suites, runnable original examples, and distribution checks are separate gates. A copied tree alone does not establish runtime parity. Current build and test evidence will be recorded under `.luxleaf/`.

Use the original README and package scripts for the original API and applications. No custom LuxLeaf workbench is substituted for them on this branch.
