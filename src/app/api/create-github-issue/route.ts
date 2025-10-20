import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, title, description, email, userId, userName, url, userAgent } = body;

    // Validate required fields
    if (!title || !description) {
      return NextResponse.json(
        { error: 'Title and description are required' },
        { status: 400 }
      );
    }

    // Get GitHub credentials from environment variables
    const githubToken = process.env.GITHUB_TOKEN;
    const githubRepo = process.env.GITHUB_REPO;

    if (!githubToken || !githubRepo) {
      console.error('GitHub credentials not configured');
      return NextResponse.json(
        { error: 'GitHub integration not configured' },
        { status: 500 }
      );
    }

    // Parse repo owner and name
    const [owner, repo] = githubRepo.split('/');

    // Determine labels based on feedback type
    const labels: string[] = [];
    switch (type) {
      case 'bug':
        labels.push('bug', 'user-reported');
        break;
      case 'feature':
        labels.push('enhancement', 'user-requested');
        break;
      case 'other':
        labels.push('feedback');
        break;
    }

    // Create issue body with metadata
    const issueBody = `${description}

---

**Reported by:** ${userName || 'Anonymous'} ${userId ? `(ID: ${userId})` : ''}
**Email:** ${email || 'Not provided'}
**Page URL:** ${url || 'Not provided'}
**User Agent:** ${userAgent || 'Not provided'}
**Feedback Type:** ${type}

---
*This issue was automatically created from user feedback.*`;

    // Create GitHub issue
    console.log('Creating GitHub issue for repo:', `${owner}/${repo}`);
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/issues`, {
      method: 'POST',
      headers: {
        'Authorization': `token ${githubToken}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        'User-Agent': 'BUG-Official-Feedback-System',
      },
      body: JSON.stringify({
        title: `[${type.toUpperCase()}] ${title}`,
        body: issueBody,
        labels: labels,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('GitHub API error:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
      });
      return NextResponse.json(
        { error: 'Failed to create GitHub issue', details: errorText, status: response.status },
        { status: response.status }
      );
    }

    const issue = await response.json();

    return NextResponse.json({
      success: true,
      issueNumber: issue.number,
      issueUrl: issue.html_url,
    });

  } catch (error) {
    console.error('Error creating GitHub issue:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
