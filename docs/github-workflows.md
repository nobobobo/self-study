# GitHub Actions ワークフロー設定ドキュメント

このドキュメントでは、`.github/workflows/` 配下に定義されている GitHub Actions ワークフローの設定内容について説明します。

## 一覧

| ファイル | 名前 | 概要 |
| --- | --- | --- |
| [`claude.yml`](../.github/workflows/claude.yml) | Claude Code | Issue や PR コメントで `@claude` にメンションされた際に Claude Code を実行する |
| [`claude-code-review.yml`](../.github/workflows/claude-code-review.yml) | Claude Code Review | PR の作成・更新時に Claude Code による自動コードレビューを実行する |

---

## `claude.yml`（Claude Code）

Issue や Pull Request 上で Claude Code を呼び出すためのワークフローです。

### トリガー（`on`）

以下のイベントで起動します。

- `issue_comment`（`created`）: Issue や PR へのコメント作成時
- `pull_request_review_comment`（`created`）: PR のレビューコメント作成時
- `issues`（`opened`, `assigned`）: Issue の新規作成・アサイン時
- `pull_request_review`（`submitted`）: PR レビューの送信時

### 実行条件（`jobs.claude.if`）

上記イベントのうち、以下のいずれかの条件を満たした場合にのみジョブが実行されます。

- コメント本文（`issue_comment` / `pull_request_review_comment`）に `@claude` が含まれる
- レビュー本文（`pull_request_review`）に `@claude` が含まれる
- Issue の本文またはタイトル（`issues`）に `@claude` が含まれる

つまり、**本文中に `@claude` というトリガーフレーズを含めることで Claude Code が起動する**仕組みです（このドキュメント自体も、この issue のコメントで `@claude` にメンションしたことで作成されました）。

### 権限（`permissions`）

| 権限 | 値 | 用途 |
| --- | --- | --- |
| `contents` | `read` | リポジトリのソースコード読み取り |
| `pull-requests` | `read` | PR 情報の読み取り |
| `issues` | `read` | Issue 情報の読み取り |
| `id-token` | `write` | OIDC トークンの発行（認証用） |
| `actions` | `read` | PR に紐づく CI 結果の読み取り |

### ステップ（`steps`）

1. **Checkout repository**: `actions/checkout@v4` でリポジトリをチェックアウト（`fetch-depth: 1` で浅いクローン）
2. **Run Claude Code**: `anthropics/claude-code-action@v1` を実行
   - `claude_code_oauth_token`: 認証用の OAuth トークン（`secrets.CLAUDE_CODE_OAUTH_TOKEN`）
   - `additional_permissions`: `actions: read` を追加付与し、PR の CI 結果を Claude が参照できるようにする
   - `prompt`（コメントアウト中）: カスタムプロンプトを指定する場合に使用。未指定時はメンションされたコメント内の指示に従う
   - `claude_args`（コメントアウト中）: `--allowed-tools` などの追加オプションを指定可能

---

## `claude-code-review.yml`（Claude Code Review）

Pull Request 作成・更新時に、Claude Code のコードレビュー機能を自動実行するワークフローです。

### トリガー（`on`）

- `pull_request`（`opened`, `synchronize`, `ready_for_review`, `reopened`）: PR の作成・コミット追加・Draft 解除・再オープン時

特定のファイルパス（例: `src/**/*.ts`）に変更があった場合のみ実行するよう `paths` フィルタを設定することも可能です（現状はコメントアウトされており、全ファイルが対象）。

### 実行条件

デフォルトでは条件なしに全ての PR で実行されます。特定の投稿者（例: 外部コントリビューターや初回投稿者）に限定する `if` 条件をコメントアウトで用意しており、必要に応じて有効化できます。

### 権限（`permissions`）

| 権限 | 値 | 用途 |
| --- | --- | --- |
| `contents` | `read` | リポジトリのソースコード読み取り |
| `pull-requests` | `read` | PR 情報の読み取り |
| `issues` | `read` | Issue 情報の読み取り |
| `id-token` | `write` | OIDC トークンの発行（認証用） |

### ステップ（`steps`）

1. **Checkout repository**: `actions/checkout@v4` でリポジトリをチェックアウト（`fetch-depth: 1`）
2. **Run Claude Code Review**: `anthropics/claude-code-action@v1` を実行
   - `claude_code_oauth_token`: 認証用の OAuth トークン
   - `plugin_marketplaces` / `plugins`: `anthropics/claude-code` リポジトリのプラグインマーケットプレイスから `code-review` プラグインを読み込む
   - `prompt`: `/code-review:code-review --comment` コマンドを実行し、対象 PR にインラインコメントとしてレビュー結果を投稿する
   - `claude_args`: `mcp__github_inline_comment__create_inline_comment` ツールを許可し、インラインコメント投稿を可能にする

---

## 共通の注意事項

- 両ワークフローとも `secrets.CLAUDE_CODE_OAUTH_TOKEN` をリポジトリの Secrets に設定しておく必要があります。
- `claude.yml` は `.github/workflows` ディレクトリ自体を含め、GitHub App の権限上ワークフローファイルの変更はできません。ワークフローの修正が必要な場合は、リポジトリの管理者が手動で編集してください。
- 詳細な設定オプションについては [claude-code-action の usage ドキュメント](https://github.com/anthropics/claude-code-action/blob/main/docs/usage.md) を参照してください。
