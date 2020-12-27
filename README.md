# @oss-docs/sync

This is the CLI which powers a docs translation repo. It's job is to handle a few things:

- Pulling translations into the app repo (`docs-sync pull`)
- Grabbing the english files from the localization repo (`docs-sync get-en`)
- Validating the changes in the localization repo (`docs-sync validate-against-en`)
- Updating a set of GitHub issues (`update-github-issues`)

### `localize.json`

This CLI expects you to have a `localize.json` in the root of your localization repo.

```json
{
    "app": "microsft/TypeScript-Website",
    "issues": {
      "pt": 23,
      "zh: 44
    },
    "docsRoots": [        
        { "from": "packages/playground-examples/copy/", "to": "docs/playground" },
        { "from": "packages/tsconfig-reference/copy/", "to": "docs/tsconfig" },
        { "from": "packages/typescriptlang-org/src/copy/", "to": "docs/typescriptlang" },
        { "from": "packages/documentation/copy/", "to": "docs/documentation" }
    ]
}
```