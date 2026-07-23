"""
github_client.py
-----------------
Wraps PyGithub to pull the raw facts we need about a repo:
metadata, file tree, commit history, and file contents.

Works unauthenticated (60 requests/hour) or with a token
(5000 requests/hour) — pass a token once you have one.
"""

from github import Github, Auth
from github.GithubException import GithubException, RateLimitExceededException


class GitHubClient:
    def __init__(self, token: str | None = None):
        """
        token: personal access token (optional). Without one you get
        unauthenticated access — fine for early dev/testing, but you'll
        hit rate limits fast. Get a free token at
        https://github.com/settings/tokens (no scopes needed for public repos).
        """
        if token:
            self.gh = Github(auth=Auth.Token(token))
        else:
            self.gh = Github()

    def get_repo_metadata(self, owner: str, repo: str) -> dict:
        """Basic repo facts: name, description, language, stars, etc."""
        r = self.gh.get_repo(f"{owner}/{repo}")
        return {
            "full_name": r.full_name,
            "description": r.description,
            "primary_language": r.language,
            "languages": r.get_languages(),  # {"Python": 12345, "JS": 456, ...} bytes per language
            "stars": r.stargazers_count,
            "forks": r.forks_count,
            "open_issues": r.open_issues_count,
            "default_branch": r.default_branch,
            "created_at": r.created_at.isoformat() if r.created_at else None,
            "last_pushed": r.pushed_at.isoformat() if r.pushed_at else None,
            "size_kb": r.size,
            "topics": r.get_topics(),
            "license": r.license.name if r.license else None,
            "homepage": r.homepage,
        }

    def get_file_tree(self, owner: str, repo: str, branch: str | None = None) -> list[dict]:
        """
        Full recursive file listing (path, type, size) using the git trees API
        in a single call — much cheaper than walking directories one by one.
        """
        r = self.gh.get_repo(f"{owner}/{repo}")
        branch = branch or r.default_branch
        tree = r.get_git_tree(sha=branch, recursive=True)
        return [
            {"path": item.path, "type": item.type, "size": item.size}
            for item in tree.tree
        ]

    def get_recent_commits(self, owner: str, repo: str, limit: int = 30) -> list[dict]:
        """Recent commit history — useful for activity signals."""
        r = self.gh.get_repo(f"{owner}/{repo}")
        commits = []
        for c in r.get_commits()[:limit]:
            commits.append({
                "sha": c.sha[:7],
                "author": c.commit.author.name if c.commit.author else None,
                "date": c.commit.author.date.isoformat() if c.commit.author else None,
                "message": c.commit.message.split("\n")[0],  # first line only
            })
        return commits

    def get_file_content(self, owner: str, repo: str, path: str) -> str | None:
        """Fetch raw text content of a single file (e.g. README, package.json)."""
        r = self.gh.get_repo(f"{owner}/{repo}")
        try:
            content_file = r.get_contents(path)
            return content_file.decoded_content.decode("utf-8", errors="replace")
        except GithubException:
            return None

    def get_readme(self, owner: str, repo: str) -> str | None:
        r = self.gh.get_repo(f"{owner}/{repo}")
        try:
            readme = r.get_readme()
            return readme.decoded_content.decode("utf-8", errors="replace")
        except GithubException:
            return None


if __name__ == "__main__":
    # Quick manual test against a small, real public repo.
    client = GitHubClient()  # no token — fine for a couple of test calls
    OWNER, REPO = "pallets", "flask"

    print("=== METADATA ===")
    meta = client.get_repo_metadata(OWNER, REPO)
    for k, v in meta.items():
        print(f"{k}: {v}")

    print("\n=== FILE TREE (first 15) ===")
    tree = client.get_file_tree(OWNER, REPO)
    for item in tree[:15]:
        print(item)
    print(f"... {len(tree)} total files/dirs")

    print("\n=== RECENT COMMITS (5) ===")
    for c in client.get_recent_commits(OWNER, REPO, limit=5):
        print(c)

    print("\n=== RATE LIMIT STATUS ===")
    rl = client.gh.get_rate_limit()
    print(f"core: {rl.core.remaining}/{rl.core.limit}")
