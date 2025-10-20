import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

interface BugReport {
  title: string;
  description: string;
  stepsToReproduce?: string;
  expectedBehavior?: string;
  actualBehavior?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'ui' | 'functionality' | 'performance' | 'security' | 'other';
  browserInfo: string;
  deviceInfo: string;
  reportedBy: string;
  reportedByUid: string;
  reportedByName: string;
  timestamp: string;
  url: string;
}

export async function POST(request: NextRequest) {
  try {
    const bugReport: BugReport = await request.json();

    // Validate required fields
    if (!bugReport.title || !bugReport.description) {
      return NextResponse.json(
        { error: 'Title and description are required' },
        { status: 400 }
      );
    }

    // Get GitHub token from environment
    const githubToken = process.env.GITHUB_TOKEN;
    const githubRepo = process.env.GITHUB_REPO || 'darkclone9/BUG-Official';

    if (!githubToken) {
      console.error('GitHub token not configured');
      // Still save to Firestore even if GitHub integration fails
      return NextResponse.json(
        { 
          success: true, 
          message: 'Bug report received (GitHub integration not configured)',
          saved: true 
        },
        { status: 200 }
      );
    }

    // Create GitHub issue
    const issueBody = createIssueBody(bugReport);
    const labels = getLabels(bugReport);

    const githubResponse = await fetch(
      `https://api.github.com/repos/${githubRepo}/issues`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${githubToken}`,
          'Accept': 'application/vnd.github+json',
          'Content-Type': 'application/json',
          'X-GitHub-Api-Version': '2022-11-28',
        },
        body: JSON.stringify({
          title: `[Bug] ${bugReport.title}`,
          body: issueBody,
          labels: labels,
        }),
      }
    );

    if (!githubResponse.ok) {
      const errorData = await githubResponse.json();
      console.error('GitHub API error:', errorData);
      throw new Error(`GitHub API error: ${errorData.message || 'Unknown error'}`);
    }

    const issueData = await githubResponse.json();

    return NextResponse.json({
      success: true,
      message: 'Bug report submitted and GitHub issue created',
      issueNumber: issueData.number,
      issueUrl: issueData.html_url,
    });

  } catch (error) {
    console.error('Error creating bug report:', error);
    return NextResponse.json(
      { 
        error: 'Failed to submit bug report',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

function createIssueBody(bugReport: BugReport): string {
  let body = `## Bug Report\n\n`;
  body += `**Reported by:** ${bugReport.reportedByName} (${bugReport.reportedBy})\n`;
  body += `**Timestamp:** ${new Date(bugReport.timestamp).toLocaleString()}\n`;
  body += `**Page URL:** ${bugReport.url}\n\n`;
  
  body += `### Description\n${bugReport.description}\n\n`;

  if (bugReport.stepsToReproduce) {
    body += `### Steps to Reproduce\n${bugReport.stepsToReproduce}\n\n`;
  }

  if (bugReport.expectedBehavior) {
    body += `### Expected Behavior\n${bugReport.expectedBehavior}\n\n`;
  }

  if (bugReport.actualBehavior) {
    body += `### Actual Behavior\n${bugReport.actualBehavior}\n\n`;
  }

  body += `### System Information\n`;
  body += `- **Device:** ${bugReport.deviceInfo}\n`;
  body += `- **Browser:** ${bugReport.browserInfo}\n`;
  body += `- **Severity:** ${bugReport.severity}\n`;
  body += `- **Category:** ${bugReport.category}\n`;

  return body;
}

function getLabels(bugReport: BugReport): string[] {
  const labels: string[] = ['bug'];

  // Add severity label
  switch (bugReport.severity) {
    case 'critical':
      labels.push('priority: critical');
      break;
    case 'high':
      labels.push('priority: high');
      break;
    case 'medium':
      labels.push('priority: medium');
      break;
    case 'low':
      labels.push('priority: low');
      break;
  }

  // Add category label
  switch (bugReport.category) {
    case 'ui':
      labels.push('ui/ux');
      break;
    case 'functionality':
      labels.push('functionality');
      break;
    case 'performance':
      labels.push('performance');
      break;
    case 'security':
      labels.push('security');
      break;
    case 'other':
      labels.push('other');
      break;
  }

  return labels;
}

