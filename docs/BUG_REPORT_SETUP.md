# Bug Report System Setup Guide

This guide explains how to set up the bug report system with GitHub integration for the BUG website.

## Overview

The bug report system allows users to submit bug reports through a web form at `/bug-report`. When submitted, the system automatically creates a GitHub issue in your repository with all the bug details.

## Features

- **User-Friendly Form**: Comprehensive bug report form with all necessary fields
- **Auto-Detection**: Automatically detects browser and device information
- **Severity Levels**: Low, Medium, High, Critical
- **Categories**: UI/Design, Functionality, Performance, Security, Other
- **GitHub Integration**: Automatically creates GitHub issues with proper labels
- **Graceful Fallback**: Works even if GitHub integration is not configured

## Setup Instructions

### 1. Create a GitHub Personal Access Token

1. Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click "Generate new token (classic)"
3. Give it a descriptive name like "BUG Website Bug Reports"
4. Set expiration (recommend: No expiration or 1 year)
5. Select the following scopes:
   - `repo` (Full control of private repositories)
     - This includes: `repo:status`, `repo_deployment`, `public_repo`, `repo:invite`, `security_events`
6. Click "Generate token"
7. **IMPORTANT**: Copy the token immediately (you won't be able to see it again)

### 2. Add Environment Variables

Add the following to your `.env.local` file:

```env
# GitHub Integration for Bug Reports
GITHUB_TOKEN=your_github_personal_access_token_here
GITHUB_REPO=darkclone9/BUG-Official
```

Replace `your_github_personal_access_token_here` with the token you just created.

### 3. Configure GitHub Labels (Optional but Recommended)

For the best experience, create the following labels in your GitHub repository:

**Priority Labels:**
- `priority: critical` - Red (#d73a4a)
- `priority: high` - Orange (#d93f0b)
- `priority: medium` - Yellow (#fbca04)
- `priority: low` - Green (#0e8a16)

**Category Labels:**
- `bug` - Red (#d73a4a) - Default bug label
- `ui/ux` - Purple (#a371f7)
- `functionality` - Blue (#0075ca)
- `performance` - Orange (#d93f0b)
- `security` - Red (#b60205)
- `other` - Gray (#7057ff)

To create labels:
1. Go to your repository on GitHub
2. Click "Issues" → "Labels"
3. Click "New label"
4. Add each label with the suggested name and color

### 4. Test the Integration

1. Navigate to `/bug-report` on your website
2. Fill out the bug report form
3. Submit the report
4. Check your GitHub repository's Issues tab
5. You should see a new issue created with:
   - Title prefixed with `[Bug]`
   - All bug details in the issue body
   - Appropriate labels applied
   - Reporter information included

## Bug Report Form Fields

### Required Fields:
- **Title**: Brief description of the bug
- **Description**: Detailed explanation of the issue
- **Category**: Type of bug (UI, Functionality, Performance, Security, Other)
- **Severity**: Impact level (Low, Medium, High, Critical)

### Optional Fields:
- **Steps to Reproduce**: How to recreate the bug
- **Expected Behavior**: What should happen
- **Actual Behavior**: What actually happens
- **System Information**: Auto-detected browser and device info

## API Endpoint

The bug report API is available at `/api/bug-report` and accepts POST requests with the following structure:

```typescript
{
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
```

## Response Format

### Success Response:
```json
{
  "success": true,
  "message": "Bug report submitted and GitHub issue created",
  "issueNumber": 123,
  "issueUrl": "https://github.com/darkclone9/BUG-Official/issues/123"
}
```

### Error Response:
```json
{
  "error": "Failed to submit bug report",
  "message": "Detailed error message"
}
```

## Troubleshooting

### Issue: GitHub issues not being created

**Possible causes:**
1. `GITHUB_TOKEN` not set in environment variables
2. Token doesn't have correct permissions (needs `repo` scope)
3. Token has expired
4. Repository name is incorrect in `GITHUB_REPO`

**Solution:**
- Check `.env.local` file has correct values
- Verify token permissions on GitHub
- Generate a new token if expired
- Ensure repository name format is `owner/repo`

### Issue: Labels not being applied

**Possible causes:**
1. Labels don't exist in the repository
2. Label names don't match exactly

**Solution:**
- Create the labels in your GitHub repository
- Ensure label names match exactly (case-sensitive)

### Issue: "Failed to submit bug report" error

**Possible causes:**
1. Network connectivity issues
2. GitHub API rate limiting
3. Invalid token

**Solution:**
- Check browser console for detailed error messages
- Verify GitHub API status
- Check token validity

## Security Considerations

1. **Never commit your GitHub token to version control**
   - Always use `.env.local` for local development
   - Use environment variables in production
   - Add `.env.local` to `.gitignore`

2. **Token Permissions**
   - Only grant the minimum required permissions (`repo` scope)
   - Consider using a dedicated GitHub account for automation

3. **Rate Limiting**
   - GitHub API has rate limits (5000 requests/hour for authenticated requests)
   - The bug report system is designed to handle this gracefully

## Future Enhancements

Potential improvements to consider:

1. **Email Notifications**: Send email to admins when bugs are reported
2. **Duplicate Detection**: Check for similar existing issues before creating new ones
3. **Screenshot Upload**: Allow users to attach screenshots
4. **Status Tracking**: Show users the status of their reported bugs
5. **Voting System**: Let users upvote existing bug reports
6. **Auto-Assignment**: Automatically assign issues to team members based on category

## Support

If you encounter any issues with the bug report system:

1. Check this documentation first
2. Review the browser console for error messages
3. Check the server logs for API errors
4. Submit a bug report using the system itself! 😄

## Links

- Bug Report Page: `/bug-report`
- API Endpoint: `/api/bug-report`
- GitHub Repository: https://github.com/darkclone9/BUG-Official
- GitHub API Documentation: https://docs.github.com/en/rest/issues/issues

